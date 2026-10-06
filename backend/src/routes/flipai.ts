import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// System prompt cho AI "Lật ngược vấn đề"
const FLIP_SYSTEM_PROMPT = `Bạn là một cố vấn tích cực chuyên "lật ngược vấn đề" (reframing), dành cho học sinh lớp 9 Việt Nam.

NHIỆM VỤ DUY NHẤT:
Khi học sinh nêu một điểm yếu, thói quen tiêu cực, hoặc điều khiến các em tự ti — bạn hãy:
1. Xác nhận rằng cảm giác đó hoàn toàn bình thường
2. Tìm ra MẶT TÍCH CỰC ẨN GIẤU bên trong điểm yếu đó
3. Gợi ý 1-2 ngành nghề/hoạt động phù hợp với đặc điểm này
4. Đưa ra 1 lời khuyên nhỏ cụ thể để biến điểm yếu thành lợi thế

VÍ DỤ MẪU:
Học sinh: "Em học kém Toán, tư duy chậm"
Bạn: "Người suy nghĩ chậm thường là người CẨN THẬN và KHÔNG VỘI VÃ — đây là lợi thế lớn trong các công việc đòi hỏi sự tỉ mỉ như kiểm soát chất lượng, kế toán kiểm toán, lập trình (phát hiện lỗi), hay y tá điều dưỡng. Thử thách của em tuần này: Khi làm bài, hãy là người CUỐI CÙNG nộp bài — và đọc lại 2 lần. Sự cẩn thận là siêu năng lực!"

Học sinh: "Em hay xao nhãng, không tập trung được"
Bạn: "Tâm trí hay xao nhãng thường là dấu hiệu của TRÍ TÒ MÒ CAO và KHẢ NĂNG KẾT NỐI NHIỀU Ý TƯỞNG — đây là đặc điểm của các nhà sáng tạo, nghệ sĩ, nhà thiết kế và doanh nhân. Einstein cũng nổi tiếng là 'đãng trí'! Thử kỹ thuật Pomodoro: tập trung 25 phút, nghỉ 5 phút — não bạn sẽ yêu thích nhịp này."

PHONG CÁCH:
- Tiếng Việt, thân thiện, khích lệ — như người anh chị giỏi tâm lý
- KHÔNG phủ nhận khó khăn. KHÔNG nói "không có vấn đề gì đâu"
- Trả lời 100-150 chữ, có cấu trúc rõ ràng
- Luôn kết thúc bằng một lời thách thức nhỏ cụ thể hoặc câu hỏi mở

DANH SÁCH ĐIỂM YẾU → NHÌN NHẬN LẠI:
- Nhút nhát → Quan sát tốt, lắng nghe sâu, phù hợp nghiên cứu/viết lách/lập trình
- Hay nói chuyện → Giao tiếp tốt, phù hợp bán hàng/giáo viên/MC/luật sư
- Lười → Tìm cách tối ưu/tự động hóa, phù hợp kỹ sư/quản lý dự án
- Cầu toàn → Tiêu chuẩn cao, phù hợp kiến trúc/thiết kế/y tế/nghiên cứu
- Nhạy cảm → Đồng cảm cao, phù hợp tâm lý học/nghệ thuật/sư phạm/công tác xã hội
- Bướng bỉnh → Kiên định, phù hợp lãnh đạo/thương lượng/khởi nghiệp
- Mơ mộng → Tưởng tượng phong phú, phù hợp sáng tạo/viết/thiết kế/phim ảnh`;

// POST /api/flipai/chat
router.post('/chat', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { weakness } = req.body;
    if (!weakness?.trim()) return res.status(400).json({ error: 'Vui lòng nhập điểm yếu.' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.length > 20) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        const client = new GoogleGenAI({ apiKey });
        const interaction = await client.interactions.create({
          model: 'gemini-2.0-flash',
          system_instruction: FLIP_SYSTEM_PROMPT,
          input: weakness.trim(),
        });
        return res.json({ response: interaction.output_text });
      } catch (e) {
        console.error('Gemini flipai error:', e);
      }
    }

    // Fallback thông minh khi không có API
    res.json({ response: getFallbackFlip(weakness) });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

function getFallbackFlip(weakness: string): string {
  const lower = weakness.toLowerCase();

  if (lower.includes('nhút nhát') || lower.includes('rụt rè') || lower.includes('ngại') || lower.includes('nói trước đám đông')) {
    return `💡 Người nhút nhát thường có khả năng **QUAN SÁT** và **LẮNG NGHE** vượt trội — đây là siêu năng lực trong thời đại ồn ào này!\n\nNgười cẩn thận trước khi nói thường nói ra những điều có giá trị hơn. Phù hợp: nghiên cứu, lập trình, viết lách, thủ thư, phân tích dữ liệu.\n\n🎯 Thách thức nhỏ: Tuần này, hãy nói 1 ý kiến trong giờ học — chỉ 1 thôi, nhưng hãy chắc chắn đó là ý kiến hay nhất bạn nghĩ được!`;
  }
  if (lower.includes('lười') || lower.includes('không chăm') || lower.includes('hay trì hoãn')) {
    return `💡 Người "lười" thường thực ra là người **TÌM CÁCH TỐI ƯU** — não bạn luôn tìm con đường ngắn nhất!\n\nĐây là tư duy của kỹ sư, lập trình viên, và nhà quản lý. Bill Gates từng nói ông thích giao việc khó cho người lười vì họ sẽ tìm cách dễ nhất để làm.\n\n🎯 Thách thức: Thử làm một bài tập theo cách "lười nhất" có thể — nhưng vẫn đúng. Bạn vừa học được tư duy tối ưu hóa!`;
  }
  if (lower.includes('hay nói') || lower.includes('nói nhiều') || lower.includes('lắm lời')) {
    return `💡 Người hay nói có **KHẢ NĂNG GIAO TIẾP** tự nhiên — một trong những kỹ năng được trả lương cao nhất!\n\nPhù hợp: giáo viên, MC, luật sư, sales, PR, podcaster, hướng dẫn viên du lịch.\n\n🎯 Thách thức: Hôm nay hãy thử kể lại một chủ đề bất kỳ cho bạn bè nghe trong 2 phút — thuyết phục và thú vị nhất có thể. Đó chính là nghề nghiệp tương lai đấy!`;
  }
  if (lower.includes('kém toán') || lower.includes('không giỏi toán') || lower.includes('tư duy chậm') || lower.includes('toán')) {
    return `💡 Người tính toán chậm thường là người **CẨN THẬN** và **KHÔNG VỘI VÃ** — lợi thế lớn trong công việc đòi hỏi độ chính xác!\n\nPhù hợp: kiểm soát chất lượng, kế toán kiểm toán, y tá, biên tập viên, lập trình (debug), nghiên cứu khoa học.\n\n🎯 Thách thức: Khi làm bài thi, hãy tự nhận vai "người kiểm tra" — đọc lại 2 lần trước khi nộp. Sự cẩn thận của em chính là siêu năng lực!`;
  }
  if (lower.includes('nhạy cảm') || lower.includes('dễ khóc') || lower.includes('dễ buồn') || lower.includes('hay xúc động')) {
    return `💡 Người nhạy cảm có **TRÍ TUỆ CẢM XÚC** (EQ) cao — khoa học chứng minh EQ quan trọng hơn IQ trong 80% công việc!\n\nPhù hợp: tâm lý học, sư phạm, công tác xã hội, nghệ thuật, viết văn, y tế.\n\n🎯 Thách thức: Lần tới khi bạn xúc động, thử viết xuống cảm xúc đó bằng 3 câu. Đó là cách các nhà văn và nhà tâm lý học luyện tập hàng ngày!`;
  }
  if (lower.includes('mơ mộng') || lower.includes('không tập trung') || lower.includes('xao nhãng') || lower.includes('đãng trí')) {
    return `💡 Tâm trí hay mơ mộng thường có **TRÍ TƯỞNG TƯỢNG** và **KHẢ NĂNG KẾT NỐI Ý TƯỞNG** vượt trội!\n\nEinstein, Steve Jobs, và Leonardo da Vinci đều nổi tiếng là "đãng trí". Phù hợp: thiết kế, nghệ thuật, game design, sáng tác, khởi nghiệp.\n\n🎯 Thách thức: Thử kỹ thuật Pomodoro — tập trung 25 phút, nghỉ 5 phút. Não bạn sẽ yêu thích nhịp này và sáng tạo hơn bao giờ hết!`;
  }
  if (lower.includes('bướng') || lower.includes('cứng đầu') || lower.includes('không nghe lời')) {
    return `💡 Người "bướng" thực ra có **BẢN LĨNH** và **SỰ KIÊN ĐỊNH** — tố chất quan trọng của nhà lãnh đạo!\n\nPhù hợp: khởi nghiệp, luật, thương lượng, quản lý, thể thao thi đấu.\n\n🎯 Thách thức: Thử áp dụng sự kiên định đó vào MỘT việc tốt trong tuần này — như duy trì thói quen học đúng giờ. Bạn sẽ thấy sức mạnh của mình!`;
  }

  return `💡 Cảm ơn bạn đã dũng cảm nhìn nhận bản thân!\n\nĐiều bạn chia sẻ cho thấy bạn đang **TỰ NHẬN THỨC** — đây là kỹ năng quan trọng nhất mà nhiều người lớn còn chưa có.\n\nMỗi điểm yếu đều có mặt tích cực ẩn giấu. Hãy thử kể rõ hơn điều bạn đang gặp khó, mình sẽ giúp bạn nhìn theo góc nhìn mới! 🌱\n\n🎯 Câu hỏi: Điểm yếu này xuất hiện trong tình huống nào nhiều nhất?`;
}

export { router as flipAiRoutes };
