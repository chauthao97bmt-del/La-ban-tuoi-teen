import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
      include: { class: { include: { teacher: { include: { user: true } } } } }
    });
    if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });

    const { emotion, content, visibility } = req.body;
    if (!content || !emotion) return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' });

    const request = await prisma.supportRequest.create({
      data: { studentId: student.id, emotion, content, visibility: visibility || 'PRIVATE' }
    });

    if ((visibility === 'TEACHER' || visibility === 'URGENT') && student.class?.teacher) {
      await prisma.notification.create({
        data: {
          userId: student.class.teacher.userId,
          type: 'SUPPORT_REQUEST',
          title: '💬 Học sinh muốn chia sẻ với bạn',
          content: `Một học sinh trong lớp ${student.class.name} muốn được lắng nghe. Vui lòng kiểm tra phần "Tâm Sự".`
        }
      });
    }

    res.json({ success: true, request });
  } catch (error) { res.status(500).json({ error: 'Lỗi server.' }); }
});

router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
    const requests = await prisma.supportRequest.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) { res.status(500).json({ error: 'Lỗi server.' }); }
});

export { router as supportRoutes };
