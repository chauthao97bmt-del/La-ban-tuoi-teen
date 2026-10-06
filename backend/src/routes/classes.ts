import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/my-class', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
      include: {
        class: {
          include: {
            teacher: true,
            announcements: { orderBy: { createdAt: 'desc' }, take: 20 },
            _count: { select: { students: true } }
          }
        }
      }
    });
    if (!student?.class) return res.json(null);
    res.json(student.class);
  } catch (error) { res.status(500).json({ error: 'Lỗi server.' }); }
});

router.post('/announcements', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user!.id } });
    if (!teacher) return res.status(403).json({ error: 'Không có quyền.' });

    const { classId, title, content, type } = req.body;
    const announcement = await prisma.classAnnouncement.create({
      data: { classId, teacherId: teacher.id, title, content, type: type || 'INFO' }
    });
    res.json(announcement);
  } catch (error) { res.status(500).json({ error: 'Lỗi server.' }); }
});

export { router as classRoutes };
