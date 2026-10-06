import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: { id: string; role: string; username: string };
}

const MISSIONS = [
  "Hôm nay hãy nói một lời cảm ơn với một người mà bạn thường ít nói chuyện.",
  "Hãy hỏi bố/mẹ: 'Ngày trước bố/mẹ từng muốn làm nghề gì?'",
  "Hãy giúp một bạn trong lớp mà không nói cho bạn biết đó là nhiệm vụ của mình.",
  "Khen ngợi một điểm tốt của người bạn ngồi cạnh.",
  "Cho một con vật hoang (chó, mèo, chim...) ăn hoặc giúp đỡ một con vật.",
  "Dọn dẹp một góc phòng của mình mà không cần ai nhắc nhở.",
  "Viết một tờ giấy note ghi lời chúc tốt đẹp và lén dán lên bàn học của một bạn trong lớp.",
  "Hãy mỉm cười với ít nhất 3 người bạn gặp trong ngày hôm nay."
];

// Lấy nhiệm vụ hiện tại (hoặc gán mới nếu chưa có)
router.get('/current', authenticate, requireRole(['STUDENT']), async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });

    // Lấy nhiệm vụ mới nhất
    let mission = await prisma.studentSecretMission.findFirst({
      where: { studentId: student.id },
      orderBy: { assignedAt: 'desc' },
    });

    // Nếu không có, gán một nhiệm vụ ngẫu nhiên
    if (!mission) {
      const randomMission = MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
      mission = await prisma.studentSecretMission.create({
        data: {
          studentId: student.id,
          missionText: randomMission
        }
      });
    }

    res.json(mission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// Hoàn thành nhiệm vụ
router.post('/:id/complete', authenticate, requireRole(['STUDENT']), async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });

    const mission = await prisma.studentSecretMission.findFirst({
      where: { id: req.params.id, studentId: student.id }
    });

    if (!mission) return res.status(404).json({ error: 'Không tìm thấy nhiệm vụ.' });
    if (mission.isCompleted) return res.status(400).json({ error: 'Nhiệm vụ này đã được hoàn thành.' });

    const { reflection } = req.body;

    const updated = await prisma.studentSecretMission.update({
      where: { id: mission.id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        reflection: reflection || null
      }
    });

    // Thưởng XP
    await prisma.studentProfile.update({
      where: { studentId: student.id },
      data: { xp: { increment: 50 } }
    }).catch(() => {});

    res.json({ success: true, mission: updated, message: 'Chúc mừng bạn đã hoàn thành xuất sắc! XP +50' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

export { router as missionRoutes };
