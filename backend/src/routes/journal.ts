import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });

    const entries = await prisma.journalEntry.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });

    const { title, content, isPrivate } = req.body;
    if (!content) return res.status(400).json({ error: 'Nội dung không được để trống.' });

    const entry = await prisma.journalEntry.create({
      data: { studentId: student.id, title, content, isPrivate: isPrivate !== false }
    });

    await prisma.studentProfile.update({
      where: { studentId: student.id },
      data: { xp: { increment: 20 } }
    });

    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(403).json({ error: 'Không có quyền.' });

    const entry = await prisma.journalEntry.findFirst({
      where: { id: req.params.id, studentId: student.id }
    });
    if (!entry) return res.status(404).json({ error: 'Không tìm thấy nhật ký.' });

    const { title, content, isPrivate } = req.body;
    const updated = await prisma.journalEntry.update({
      where: { id: req.params.id },
      data: { title, content, isPrivate }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(403).json({ error: 'Không có quyền.' });

    const entry = await prisma.journalEntry.findFirst({
      where: { id: req.params.id, studentId: student.id }
    });
    if (!entry) return res.status(404).json({ error: 'Không tìm thấy nhật ký.' });

    await prisma.journalEntry.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

export { router as journalRoutes };
