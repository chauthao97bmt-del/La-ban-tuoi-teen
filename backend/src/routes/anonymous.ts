import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: { id: string; role: string; username: string };
}

const CATEGORIES: Record<string, string> = {
  GENERAL: '💌 Điều em muốn nói',
  EMOTION: '😔 Cảm xúc',
  STUDY: '📚 Học tập',
  FRIEND: '👫 Bạn bè',
  FAMILY: '🏠 Gia đình',
  OTHER: '✨ Khác',
};

// ─── HỌC SINH ────────────────────────────────────────────────────────────────

// POST /api/anonymous — học sinh gửi thư ẩn danh
router.post('/', authenticate, requireRole(['STUDENT']), async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
      include: { class: true },
    });

    if (!student?.classId) {
      return res.status(400).json({ error: 'Bạn chưa thuộc lớp nào. Hãy nhờ giáo viên thêm vào lớp trước nhé.' });
    }

    const { content, category = 'GENERAL', allowReply = false } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Nội dung thư không được để trống.' });
    }

    if (content.trim().length < 5) {
      return res.status(400).json({ error: 'Thư quá ngắn, hãy viết thêm nhé!' });
    }

    // Tạo thư — KHÔNG lưu studentId (ẩn danh thật sự)
    const letter = await prisma.anonymousLetter.create({
      data: {
        classId: student.classId,
        content: content.trim(),
        category,
        allowReply: Boolean(allowReply),
      },
    });

    // Thông báo cho giáo viên (không tiết lộ ai gửi)
    const teacher = await prisma.teacher.findFirst({
      where: { classes: { some: { id: student.classId } } },
      include: { user: true },
    });

    if (teacher) {
      await prisma.notification.create({
        data: {
          userId: teacher.userId,
          type: 'ANONYMOUS_LETTER',
          title: '💌 Có thư mới trong Hộp thư không tên',
          content: `Một học sinh trong lớp của bạn vừa gửi một bức thư ẩn danh${allowReply ? ' và cho phép bạn phản hồi' : ''}.`,
        },
      });
    }

    // Award XP cho học sinh vì đã chia sẻ
    await prisma.studentProfile.update({
      where: { studentId: student.id },
      data: { xp: { increment: 10 } },
    }).catch(() => {}); // ignore nếu chưa có profile

    res.json({
      success: true,
      message: allowReply
        ? '💌 Thư của bạn đã được gửi! Giáo viên có thể phản hồi ẩn danh và bạn sẽ thấy ở đây.'
        : '💌 Thư của bạn đã được gửi đến hộp thư bí mật. Giáo viên sẽ đọc và giữ bí mật.',
      letterId: letter.id,
    });
  } catch (error) {
    console.error('Anonymous letter error:', error);
    res.status(500).json({ error: 'Lỗi server, vui lòng thử lại.' });
  }
});

// GET /api/anonymous/my-replies — học sinh xem phản hồi ẩn danh (nếu allowReply=true)
// Dùng sessionToken lưu ở localStorage (không phải userId) để giữ ẩn danh
router.get('/my-replies', authenticate, requireRole(['STUDENT']), async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student?.classId) return res.json([]);

    // Lấy thư có phản hồi trong lớp của học sinh — không lộ ai gửi
    const letters = await prisma.anonymousLetter.findMany({
      where: {
        classId: student.classId,
        allowReply: true,
        teacherResponse: { not: null },
      },
      orderBy: { respondedAt: 'desc' },
      take: 20,
    });

    // Trả về danh sách phản hồi ẩn danh (không phân biệt ai gửi)
    res.json(letters.map(l => ({
      id: l.id,
      category: l.category,
      categoryLabel: CATEGORIES[l.category] || l.category,
      content: l.content,
      teacherResponse: l.teacherResponse,
      respondedAt: l.respondedAt,
      createdAt: l.createdAt,
    })));
  } catch {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ─── GIÁO VIÊN ────────────────────────────────────────────────────────────────

// GET /api/anonymous/teacher — giáo viên xem hộp thư
router.get('/teacher', authenticate, requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: req.user!.id },
      include: { classes: true },
    });

    if (!teacher && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Không tìm thấy tài khoản giáo viên.' });
    }

    const classIds = teacher?.classes.map(c => c.id) || [];

    // Admin thấy tất cả
    const where = req.user!.role === 'ADMIN' ? {} : { classId: { in: classIds } };

    const letters = await prisma.anonymousLetter.findMany({
      where: { ...where, isArchived: false },
      orderBy: { createdAt: 'desc' },
    });

    // Đánh dấu đã đọc
    await prisma.anonymousLetter.updateMany({
      where: { ...where, isRead: false },
      data: { isRead: true },
    });

    res.json(letters.map(l => ({
      id: l.id,
      category: l.category,
      categoryLabel: CATEGORIES[l.category] || l.category,
      content: l.content,
      allowReply: l.allowReply,
      teacherResponse: l.teacherResponse,
      respondedAt: l.respondedAt,
      isRead: l.isRead,
      createdAt: l.createdAt,
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// POST /api/anonymous/:id/reply — giáo viên phản hồi ẩn danh
router.post('/:id/reply', authenticate, requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { response } = req.body;
    if (!response?.trim()) return res.status(400).json({ error: 'Nội dung phản hồi không được trống.' });

    const letter = await prisma.anonymousLetter.findUnique({ where: { id: req.params.id as string } });
    if (!letter) return res.status(404).json({ error: 'Không tìm thấy thư này.' });
    if (!letter.allowReply) return res.status(403).json({ error: 'Học sinh không cho phép phản hồi thư này.' });

    const updated = await prisma.anonymousLetter.update({
      where: { id: req.params.id as string },
      data: {
        teacherResponse: response.trim(),
        respondedAt: new Date(),
      },
    });

    res.json({ success: true, letter: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// DELETE /api/anonymous/:id/archive — giáo viên lưu trữ / xóa thư
router.delete('/:id/archive', authenticate, requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.anonymousLetter.update({
      where: { id: req.params.id as string },
      data: { isArchived: true },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// GET /api/anonymous/teacher/unread-count
router.get('/teacher/unread-count', authenticate, requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: req.user!.id },
      include: { classes: true },
    });
    const classIds = teacher?.classes.map(c => c.id) || [];
    const count = await prisma.anonymousLetter.count({
      where: { classId: { in: classIds }, isRead: false, isArchived: false },
    });
    res.json({ count });
  } catch {
    res.json({ count: 0 });
  }
});

export { router as anonymousRoutes };
