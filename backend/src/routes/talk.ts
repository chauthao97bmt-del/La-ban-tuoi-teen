import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/talk/unread-count
router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    let unreadTeacher = 0;
    let unreadPsych = 0;

    if (req.user!.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId } });
      if (student) {
        unreadTeacher = await prisma.classroomMessage.count({
          where: { conversation: { studentId: student.id }, senderRole: 'TEACHER', isRead: false }
        });
        unreadPsych = await prisma.psychMessage.count({
          where: { conversation: { studentId: student.id }, senderRole: 'PSYCHOLOGIST', isRead: false }
        });
      }
    } else if (req.user!.role === 'TEACHER' || req.user!.role === 'ADMIN') {
      const teacher = await prisma.teacher.findUnique({ where: { userId } });
      if (teacher) {
        unreadTeacher = await prisma.classroomMessage.count({
          where: { conversation: { teacherId: teacher.id }, senderRole: 'STUDENT', isRead: false }
        });
      }
    } else if (req.user!.role === 'PSYCHOLOGIST') {
      const psych = await prisma.user.findUnique({ where: { id: userId } });
      if (psych) {
        unreadPsych = await prisma.psychMessage.count({
          where: { senderRole: 'STUDENT', isRead: false } // Actually we should check if they are the psych, wait... PsychConversation has no psychId, it just goes to the global psych pool? No, psychs reply. Let's see PsychConversation model. Wait, any Psych can reply, so Psych sees all unread STUDENT messages.
        });
      }
    }

    res.json({ unreadTeacher, unreadPsych });
  } catch (error) {
    res.json({ unreadTeacher: 0, unreadPsych: 0 });
  }
});

// Helper: Tự động đánh dấu đã đọc khi xem tin nhắn
async function markAsRead(convId: string, type: 'TEACHER'|'PSYCH', userRole: string) {
  if (type === 'TEACHER') {
    await prisma.classroomMessage.updateMany({
      where: { conversationId: convId, senderRole: { not: userRole }, isRead: false },
      data: { isRead: true }
    });
  } else {
    const oppRole = userRole === 'STUDENT' ? 'PSYCHOLOGIST' : 'STUDENT';
    await prisma.psychMessage.updateMany({
      where: { conversationId: convId, senderRole: oppRole, isRead: false },
      data: { isRead: true }
    });
  }
}
const db = prisma as any;

const newAnonTag = () => `Bạn học #${Math.floor(1000 + Math.random() * 9000)}`;
const studentInclude = { include: { class: true } };

// Ẩn thông tin nhận dạng trước khi gửi cho GV / chuyên gia
function forStaff(conv: any) {
  if (!conv) return conv;
  const { ownerUserId, ...rest } = conv;
  if (rest.isAnonymous) rest.student = null;
  return rest;
}
function forStudent(conv: any) {
  if (!conv) return conv;
  const { ownerUserId, ...rest } = conv;
  return rest;
}

// ═══════════════════════════════════════════════════════════
// TÂM SỰ VỚI GVCN
// ═══════════════════════════════════════════════════════════

// POST /api/talk/teacher/start — HS tạo cuộc trò chuyện mới với GVCN
router.post('/teacher/start', authenticate, requireRole(['STUDENT']), async (req: AuthRequest, res: Response) => {
  try {
    const { isAnonymous } = req.body;
    const firstMessage = req.body.firstMessage ?? req.body.content;
    if (!firstMessage?.trim()) return res.status(400).json({ error: 'Vui lòng nhập tin nhắn.' });

    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
      include: { class: { include: { teacher: true } } }
    });
    if (!student?.class?.teacher) return res.status(404).json({ error: 'Bạn chưa được xếp lớp hoặc lớp chưa có GVCN.' });

    const anonTag = isAnonymous ? newAnonTag() : null;
    const conv = await db.classroomConversation.create({
      data: {
        studentId: isAnonymous ? null : student.id,
        ownerUserId: req.user!.id,
        teacherId: student.class.teacher.id,
        isAnonymous: !!isAnonymous,
        anonTag,
        messages: { create: { senderRole: 'STUDENT', content: firstMessage.trim() } }
      },
      include: { messages: true, teacher: true }
    });

    await prisma.notification.create({
      data: {
        userId: student.class.teacher.userId,
        type: 'NEW_MESSAGE',
        title: isAnonymous ? `💌 Tin nhắn từ ${anonTag}` : `💌 Tin nhắn từ ${student.fullName}`,
        content: firstMessage.trim().substring(0, 80),
      }
    });
    res.json(forStudent(conv));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// GET /api/talk/teacher/conversations — HS xem các cuộc trò chuyện của mình (kể cả ẩn danh)
router.get('/teacher/conversations', authenticate, requireRole(['STUDENT']), async (req: AuthRequest, res: Response) => {
  try {
    const convs = await db.classroomConversation.findMany({
      where: { ownerUserId: req.user!.id },
      include: { teacher: true, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(convs.map(forStudent));
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// Kiểm tra quyền truy cập cuộc trò chuyện với GVCN
async function loadTeacherConv(id: string, user: AuthRequest['user']) {
  const conv = await db.classroomConversation.findUnique({
    where: { id },
    include: { teacher: true, student: studentInclude, messages: { orderBy: { createdAt: 'asc' } } }
  });
  if (!conv) return { conv: null, side: null };
  if (user!.role === 'STUDENT') return { conv, side: conv.ownerUserId === user!.id ? 'STUDENT' : null };
  if (conv.teacher.userId === user!.id) return { conv, side: 'TEACHER' };
  return { conv, side: null };
}

// GET /api/talk/teacher/conversation/:id
router.get('/teacher/conversation/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { conv, side } = await loadTeacherConv(req.params.id, req.user);
    if (!conv) return res.status(404).json({ error: 'Không tìm thấy.' });
    if (!side) return res.status(403).json({ error: 'Bạn không có quyền xem cuộc trò chuyện này.' });
    
    await markAsRead(conv.id, 'TEACHER', side === 'TEACHER' ? 'TEACHER' : 'STUDENT');
    const updatedConv = await loadTeacherConv(req.params.id, req.user); // Reload after marking as read to reflect changes
    
    res.json(side === 'STUDENT' ? forStudent(updatedConv.conv) : forStaff(updatedConv.conv));
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// POST /api/talk/teacher/conversation/:id/reply
router.post('/teacher/conversation/:id/reply', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Tin nhắn trống.' });

    const { conv: existing, side } = await loadTeacherConv(req.params.id, req.user);
    if (!existing) return res.status(404).json({ error: 'Không tìm thấy.' });
    if (!side) return res.status(403).json({ error: 'Bạn không có quyền trả lời cuộc trò chuyện này.' });

    const conv = await db.classroomConversation.update({
      where: { id: req.params.id },
      data: { updatedAt: new Date(), messages: { create: { senderRole: side, content: content.trim() } } },
      include: { messages: { orderBy: { createdAt: 'asc' } }, teacher: true, student: studentInclude }
    });

    if (side === 'TEACHER') {
      if (conv.ownerUserId) {
        await prisma.notification.create({
          data: { userId: conv.ownerUserId, type: 'NEW_MESSAGE', title: '💌 Cô chủ nhiệm đã trả lời bạn', content: content.trim().substring(0, 80) }
        });
      }
    } else {
      await prisma.notification.create({
        data: {
          userId: conv.teacher.userId,
          type: 'NEW_MESSAGE',
          title: conv.isAnonymous ? `💌 ${conv.anonTag} nhắn thêm` : `💌 ${conv.student?.fullName || 'Học sinh'} nhắn thêm`,
          content: content.trim().substring(0, 80),
        }
      });
    }
    res.json(side === 'STUDENT' ? forStudent(conv) : forStaff(conv));
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// GET /api/talk/teacher/inbox — GVCN xem hộp thư
router.get('/teacher/inbox', authenticate, requireRole(['TEACHER', 'ADMIN', 'PSYCHOLOGIST']), async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.id } });
    if (!teacher) return res.json([]);
    const convs = await db.classroomConversation.findMany({
      where: { teacherId: teacher.id },
      include: { student: studentInclude, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(convs.map(forStaff));
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// ═══════════════════════════════════════════════════════════
// TRÒ CHUYỆN VỚI CHUYÊN GIA TÂM LÝ
// ═══════════════════════════════════════════════════════════

// POST /api/talk/psych/start
router.post('/psych/start', authenticate, requireRole(['STUDENT']), async (req: AuthRequest, res: Response) => {
  try {
    const { isAnonymous } = req.body;
    const firstMessage = req.body.firstMessage ?? req.body.content;
    if (!firstMessage?.trim()) return res.status(400).json({ error: 'Vui lòng nhập tin nhắn.' });

    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Không tìm thấy.' });

    const psychUser = await prisma.user.findFirst({ where: { role: 'PSYCHOLOGIST', isActive: true } });
    if (!psychUser) return res.status(404).json({ error: 'Hiện chưa có chuyên gia tâm lý.' });

    const anonTag = isAnonymous ? newAnonTag() : null;
    const conv = await db.psychConversation.create({
      data: {
        studentId: isAnonymous ? null : student.id,
        ownerUserId: req.user!.id,
        psychUserId: psychUser.id,
        isAnonymous: !!isAnonymous,
        anonTag,
        messages: { create: { senderRole: 'STUDENT', content: firstMessage.trim() } }
      },
      include: { messages: true }
    });

    await prisma.notification.create({
      data: {
        userId: psychUser.id,
        type: 'NEW_MESSAGE',
        title: isAnonymous ? `🧠 Tin nhắn từ ${anonTag}` : `🧠 Tin nhắn từ ${student.fullName}`,
        content: firstMessage.trim().substring(0, 80),
      }
    });
    res.json(forStudent(conv));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// GET /api/talk/psych/conversations — HS xem các cuộc trò chuyện của mình
router.get('/psych/conversations', authenticate, requireRole(['STUDENT']), async (req: AuthRequest, res: Response) => {
  try {
    const convs = await db.psychConversation.findMany({
      where: { ownerUserId: req.user!.id },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(convs.map(forStudent));
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

async function loadPsychConv(id: string, user: AuthRequest['user']) {
  const conv = await db.psychConversation.findUnique({
    where: { id },
    include: { student: studentInclude, messages: { orderBy: { createdAt: 'asc' } } }
  });
  if (!conv) return { conv: null, side: null };
  if (user!.role === 'STUDENT') return { conv, side: conv.ownerUserId === user!.id ? 'STUDENT' : null };
  if (user!.role === 'PSYCHOLOGIST' && conv.psychUserId === user!.id) return { conv, side: 'PSYCHOLOGIST' };
  return { conv, side: null };
}

// GET /api/talk/psych/conversation/:id
router.get('/psych/conversation/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { conv, side } = await loadPsychConv(req.params.id, req.user);
    if (!conv) return res.status(404).json({ error: 'Không tìm thấy.' });
    if (!side) return res.status(403).json({ error: 'Bạn không có quyền xem cuộc trò chuyện này.' });
    
    await markAsRead(conv.id, 'PSYCH', side === 'PSYCHOLOGIST' ? 'PSYCHOLOGIST' : 'STUDENT');
    const updatedConv = await loadPsychConv(req.params.id, req.user);
    
    res.json(side === 'STUDENT' ? forStudent(updatedConv.conv) : forStaff(updatedConv.conv));
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// POST /api/talk/psych/conversation/:id/reply
router.post('/psych/conversation/:id/reply', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Tin nhắn trống.' });

    const { conv: existing, side } = await loadPsychConv(req.params.id, req.user);
    if (!existing) return res.status(404).json({ error: 'Không tìm thấy.' });
    if (!side) return res.status(403).json({ error: 'Bạn không có quyền trả lời cuộc trò chuyện này.' });

    const conv = await db.psychConversation.update({
      where: { id: req.params.id },
      data: { updatedAt: new Date(), messages: { create: { senderRole: side, content: content.trim() } } },
      include: { messages: { orderBy: { createdAt: 'asc' } }, student: studentInclude }
    });

    const notifyUserId = side === 'PSYCHOLOGIST' ? conv.ownerUserId : conv.psychUserId;
    if (notifyUserId) {
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          type: 'NEW_MESSAGE',
          title: side === 'PSYCHOLOGIST'
            ? '🧠 Chuyên gia tâm lý đã trả lời bạn'
            : (conv.isAnonymous ? `🧠 ${conv.anonTag} nhắn thêm` : `🧠 ${conv.student?.fullName || 'Học sinh'} nhắn thêm`),
          content: content.trim().substring(0, 80),
        }
      });
    }
    res.json(side === 'STUDENT' ? forStudent(conv) : forStaff(conv));
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// GET /api/talk/psych/inbox — Chuyên gia xem hộp thư
router.get('/psych/inbox', authenticate, requireRole(['PSYCHOLOGIST']), async (req: AuthRequest, res: Response) => {
  try {
    const convs = await db.psychConversation.findMany({
      where: { psychUserId: req.user!.id },
      include: { student: studentInclude, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(convs.map(forStaff));
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

export { router as talkRoutes };
