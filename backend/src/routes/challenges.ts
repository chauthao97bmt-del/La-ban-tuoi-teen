import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const challenges = await prisma.challenge.findMany({ orderBy: { dayNumber: 'asc' } });
    res.json(challenges);
  } catch (error) { res.status(500).json({ error: 'Lỗi server.' }); }
});

router.get('/my-progress', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
    const progress = await prisma.challengeProgress.findMany({
      where: { studentId: student.id },
      include: { challenge: true }
    });
    res.json(progress);
  } catch (error) { res.status(500).json({ error: 'Lỗi server.' }); }
});

router.post('/:challengeId/complete', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });

    const challenge = await prisma.challenge.findUnique({ where: { id: req.params.challengeId } });
    if (!challenge) return res.status(404).json({ error: 'Không tìm thấy thử thách.' });

    const existing = await prisma.challengeProgress.findUnique({
      where: { studentId_challengeId: { studentId: student.id, challengeId: req.params.challengeId } }
    });
    if (existing?.completed) {
      return res.status(400).json({ error: 'Bạn đã hoàn thành thử thách này rồi!' });
    }

    const progress = await prisma.challengeProgress.upsert({
      where: { studentId_challengeId: { studentId: student.id, challengeId: req.params.challengeId } },
      update: { completed: true, response: req.body.response, completedAt: new Date() },
      create: { studentId: student.id, challengeId: req.params.challengeId, completed: true, response: req.body.response, completedAt: new Date() }
    });

    await prisma.studentProfile.update({
      where: { studentId: student.id },
      data: { xp: { increment: challenge.xpReward } }
    });

    // Check for badge - first challenge
    const totalCompleted = await prisma.challengeProgress.count({ where: { studentId: student.id, completed: true } });
    if (totalCompleted === 1) {
      const badge = await prisma.badge.findFirst({ where: { condition: 'FIRST_CHALLENGE' } });
      if (badge) {
        await prisma.studentBadge.create({ data: { studentId: student.id, badgeId: badge.id } }).catch(() => {});
      }
    }
    if (totalCompleted === 21) {
      const badge = await prisma.badge.findFirst({ where: { condition: 'COMPLETE_21_DAYS' } });
      if (badge) {
        await prisma.studentBadge.create({ data: { studentId: student.id, badgeId: badge.id } }).catch(() => {});
        await prisma.notification.create({
          data: { userId: req.user!.id, type: 'BADGE', title: '🏆 Hoàn thành 21 ngày!', content: 'Xuất sắc! Bạn đã hoàn thành thử thách 21 ngày. Huy hiệu "Người Hoàn Thành" đã được trao!' }
        });
      }
    }

    res.json({ success: true, progress, xpEarned: challenge.xpReward });
  } catch (error) { res.status(500).json({ error: 'Lỗi server.' }); }
});

export { router as challengeRoutes };
