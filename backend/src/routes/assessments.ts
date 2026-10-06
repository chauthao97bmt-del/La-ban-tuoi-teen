import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// POST /api/assessments/submit
router.post('/submit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });

    const { type, answers, result } = req.body;
    if (!type || !answers || !result) {
      return res.status(400).json({ error: 'Thiếu thông tin bài đánh giá.' });
    }

    const assessment = await prisma.assessment.create({
      data: {
        studentId: student.id,
        type,
        answers: JSON.stringify(answers),
        result: JSON.stringify(result)
      }
    });

    // Update student profile based on type
    const updateData: any = {};
    if (type === 'RIASEC') {
      updateData.riasecScores = JSON.stringify(result);
    } else if (type === 'STRENGTHS') {
      updateData.strengths = JSON.stringify(result);
    } else if (type === 'VALUES') {
      updateData.values = JSON.stringify(result);
    } else if (type === 'INTERESTS') {
      updateData.interests = JSON.stringify(result);
    } else if (type === 'LEARNING_STYLE') {
      updateData.learningStyles = JSON.stringify(result);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.studentProfile.update({
        where: { studentId: student.id },
        data: { ...updateData, xp: { increment: 100 } }
      });
    } else {
      await prisma.studentProfile.update({
        where: { studentId: student.id },
        data: { xp: { increment: 50 } }
      });
    }

    res.json({ success: true, assessment, xpEarned: 100 });
  } catch (error) {
    console.error('Assessment submit error:', error);
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// GET /api/assessments/my
router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });

    const assessments = await prisma.assessment.findMany({
      where: { studentId: student.id },
      orderBy: { completedAt: 'desc' }
    });

    res.json(assessments.map(a => ({
      ...a,
      answers: JSON.parse(a.answers),
      result: JSON.parse(a.result)
    })));
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// GET /api/assessments/questions/:type - Return assessment questions
router.get('/questions/:type', async (req: AuthRequest, res: Response) => {
  const { type } = req.params;

  const questions: Record<string, any[]> = {
    RIASEC: [
      { id: 1, text: 'Tôi thích làm việc với tay – sửa chữa, xây dựng, chế tạo', group: 'R' },
      { id: 2, text: 'Tôi thích làm việc ngoài trời', group: 'R' },
      { id: 3, text: 'Tôi thích vận hành máy móc hoặc thiết bị', group: 'R' },
      { id: 4, text: 'Tôi thích nghiên cứu và phân tích thông tin', group: 'I' },
      { id: 5, text: 'Tôi thích giải quyết những vấn đề phức tạp', group: 'I' },
      { id: 6, text: 'Tôi thích đọc và tìm hiểu về khoa học', group: 'I' },
      { id: 7, text: 'Tôi thích sáng tác, vẽ, viết hoặc biểu diễn', group: 'A' },
      { id: 8, text: 'Tôi thích thể hiện bản thân qua nghệ thuật', group: 'A' },
      { id: 9, text: 'Tôi thích những môi trường không có quy tắc cứng nhắc', group: 'A' },
      { id: 10, text: 'Tôi thích giúp đỡ và hỗ trợ người khác', group: 'S' },
      { id: 11, text: 'Tôi thích dạy hoặc hướng dẫn người khác', group: 'S' },
      { id: 12, text: 'Tôi thích làm việc trong nhóm', group: 'S' },
      { id: 13, text: 'Tôi thích thuyết phục và dẫn dắt người khác', group: 'E' },
      { id: 14, text: 'Tôi thích kinh doanh và bán hàng', group: 'E' },
      { id: 15, text: 'Tôi thích đặt mục tiêu và đạt được chúng', group: 'E' },
      { id: 16, text: 'Tôi thích sắp xếp, tổ chức và quản lý thông tin', group: 'C' },
      { id: 17, text: 'Tôi thích làm theo quy trình rõ ràng', group: 'C' },
      { id: 18, text: 'Tôi chú ý đến chi tiết và thích sự chính xác', group: 'C' },
    ],
    STRENGTHS: [
      { id: 1, name: 'Giao tiếp', description: 'Khả năng truyền đạt ý tưởng rõ ràng và kết nối với người khác', icon: '💬' },
      { id: 2, name: 'Sáng tạo', description: 'Khả năng nghĩ ra ý tưởng mới và giải quyết vấn đề theo cách độc đáo', icon: '🎨' },
      { id: 3, name: 'Tư duy logic', description: 'Khả năng phân tích và suy luận có hệ thống', icon: '🧮' },
      { id: 4, name: 'Giải quyết vấn đề', description: 'Khả năng tìm ra giải pháp hiệu quả khi gặp khó khăn', icon: '🔧' },
      { id: 5, name: 'Kiên trì', description: 'Khả năng tiếp tục cố gắng dù gặp thất bại', icon: '💪' },
      { id: 6, name: 'Hợp tác', description: 'Khả năng làm việc tốt với người khác', icon: '🤝' },
      { id: 7, name: 'Lãnh đạo', description: 'Khả năng dẫn dắt và truyền cảm hứng cho nhóm', icon: '🌟' },
      { id: 8, name: 'Tự học', description: 'Khả năng chủ động học hỏi không cần người hướng dẫn', icon: '📚' },
      { id: 9, name: 'Công nghệ', description: 'Khả năng làm việc với các công cụ và thiết bị công nghệ', icon: '💻' },
      { id: 10, name: 'Đồng cảm', description: 'Khả năng hiểu và chia sẻ cảm xúc của người khác', icon: '❤️' },
    ],
    VALUES: [
      { id: 1, name: 'Tự do', description: 'Được làm theo cách riêng của mình', icon: '🕊️' },
      { id: 2, name: 'Ổn định', description: 'Có công việc và cuộc sống ổn định, ít rủi ro', icon: '🏠' },
      { id: 3, name: 'Sáng tạo', description: 'Được tạo ra những điều mới mẻ', icon: '🎨' },
      { id: 4, name: 'Thu nhập tốt', description: 'Kiếm được nhiều tiền để đảm bảo cuộc sống tốt', icon: '💰' },
      { id: 5, name: 'Giúp đỡ người khác', description: 'Tạo ra sự thay đổi tích cực cho cộng đồng', icon: '🤝' },
      { id: 6, name: 'Thành tựu', description: 'Đạt được những mục tiêu lớn trong cuộc sống', icon: '🏆' },
      { id: 7, name: 'Gia đình', description: 'Dành nhiều thời gian cho gia đình', icon: '👨‍👩‍👧' },
      { id: 8, name: 'Khám phá', description: 'Trải nghiệm những điều mới mẻ, đi nhiều nơi', icon: '🌍' },
      { id: 9, name: 'Đóng góp xã hội', description: 'Làm cho thế giới trở nên tốt đẹp hơn', icon: '🌱' },
    ],
  };

  const q = questions[type as string];
  if (!q) return res.status(404).json({ error: 'Loại bài đánh giá không hợp lệ.' });
  res.json(q);
});

export { router as assessmentRoutes };
