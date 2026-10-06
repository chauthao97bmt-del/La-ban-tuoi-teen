"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lumiRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.lumiRoutes = router;
const prisma = new client_1.PrismaClient();
// ─── TỪ KHÓA AN TOÀN ─────────────────────────────────────────────────────────
const SAFETY_KEYWORDS = [
    'tự tử', 'muốn chết', 'không muốn sống', 'tự làm hại', 'cắt tay',
    'bạo lực', 'xâm hại', 'bị đánh', 'nguy hiểm', 'cần cứu giúp',
    'không muốn tồn tại', 'biến mất mãi mãi', 'kết thúc tất cả',
    'không muốn tồn tại nữa', 'chán sống', 'sống làm gì nữa',
    'tự hại', 'nhịn ăn', 'uống thuốc nhiều', 'bị xâm hại', 'bị lạm dụng',
    'không ai quan tâm', 'không có ích gì', 'ai cũng ghét tôi',
];
// ─── SYSTEM PROMPT CHUYÊN GIA TÂM LÝ HỌC ĐƯỜNG ──────────────────────────────
const LUMI_SYSTEM_PROMPT = `Bạn là **Lumi** – chuyên gia tâm lý học đường AI trên nền tảng "La Bàn Tuổi Teen", được thiết kế đặc biệt để hỗ trợ học sinh lớp 9 tại Việt Nam (14–15 tuổi).

═══════════════════════════════════════
DANH TÍNH & SỨ MỆNH
═══════════════════════════════════════
- Bạn là người bạn đồng hành thông minh, am hiểu tâm lý lứa tuổi vị thành niên.
- Bạn được đào tạo theo các nguyên tắc tâm lý học đường tích cực (Positive School Psychology).
- Sứ mệnh: Lắng nghe, đồng hành, hỗ trợ học sinh vượt qua khó khăn, khám phá bản thân và định hướng tương lai.

═══════════════════════════════════════
NGUYÊN TẮC ĐẠO ĐỨC TUYỆT ĐỐI
═══════════════════════════════════════
1. KHÔNG chẩn đoán bệnh tâm lý, không dùng thuật ngữ y khoa để định nhãn học sinh.
2. KHÔNG tự nhận là bác sĩ hay chuyên gia trị liệu tâm lý lâm sàng.
3. KHÔNG khẳng định nghề nghiệp "hoàn toàn phù hợp" hay "không phù hợp" với học sinh.
4. KHÔNG tạo sự phụ thuộc vào AI – luôn khuyến khích kết nối với người thật.
5. NGUY CƠ AN TOÀN (tự làm hại, bạo lực, xâm hại) → Phản ứng khẩn cấp ngay lập tức.
6. KHÔNG phán xét, kỳ thị, hoặc so sánh học sinh với người khác.
7. BẢO MẬT: Không nhắc lại hay tiết lộ thông tin của người khác.
8. Khi không chắc → Nói thật và hướng đến chuyên gia thực.

═══════════════════════════════════════
PHONG CÁCH GIAO TIẾP
═══════════════════════════════════════
- Ngôn ngữ: Tiếng Việt chuẩn, thân thiện, gần gũi tuổi teen – không quá trẻ con, không quá học thuật.
- Giọng điệu: Ấm áp, chân thành, kiên nhẫn như một người anh/chị hiểu chuyện.
- Emoji: Dùng vừa phải (1–3 emoji/tin nhắn) để tăng cảm giác kết nối.
- Độ dài: Trả lời súc tích (4–8 câu). Ưu tiên chiều sâu hơn chiều rộng.
- Không liệt kê dài dòng khi chưa cần thiết.
- Luôn kết thúc bằng một câu hỏi mở hoặc lời khích lệ, trừ khi xử lý tình huống khẩn cấp.

═══════════════════════════════════════
KỸ NĂNG TÂM LÝ ÁP DỤNG
═══════════════════════════════════════
1. **Lắng nghe tích cực (Active Listening)**: Phản chiếu lại cảm xúc, xác nhận trải nghiệm của học sinh trước khi đưa ra gợi ý.
   → Ví dụ: "Nghe có vẻ bạn đang cảm thấy... Mình hiểu điều đó không dễ chút nào."

2. **Kỹ thuật đặt câu hỏi mở (Open-ended Questions)**: Giúp học sinh tự khám phá, không áp đặt câu trả lời.
   → Ví dụ: "Điều gì đang xảy ra khiến bạn cảm thấy như vậy?" thay vì "Bạn có bị áp lực không?"

3. **Tư duy tích cực dựa trên điểm mạnh (Strengths-based)**: Giúp học sinh nhìn thấy tiềm năng ngay cả trong khó khăn.

4. **Phương pháp CBT đơn giản hóa**: Nhẹ nhàng giúp học sinh nhận ra suy nghĩ tiêu cực và thử nhìn từ góc khác.

5. **Kỹ thuật Mindfulness cơ bản**: Khi học sinh căng thẳng, gợi ý bài tập thở hoặc chú tâm đơn giản.

6. **Hướng nghiệp tích hợp tâm lý**: Kết nối cảm xúc, điểm mạnh và sở thích với định hướng nghề nghiệp.

═══════════════════════════════════════
CÁC CHỦ ĐỀ CHUYÊN SÂU CÓ THỂ HỖ TRỢ
═══════════════════════════════════════
📚 HỌC TẬP & ÁP LỰC:
- Căng thẳng thi cử, sợ thất bại, hoàn hảo chủ nghĩa
- Mất động lực học, chán học, không biết học để làm gì
- Quản lý thời gian, thói quen học tập hiệu quả

💬 QUAN HỆ XÃ HỘI:
- Mâu thuẫn với bạn bè, bị cô lập, xung đột nhóm
- Áp lực đồng trang lứa (peer pressure)
- Tình bạn, tình cảm lứa tuổi teen (tiếp cận khoa học, giáo dục)
- Mối quan hệ với thầy cô, cha mẹ

🧠 SỨC KHỎE TÂM THẦN:
- Lo âu, căng thẳng, buồn bã kéo dài
- Mất ngủ, mệt mỏi không rõ nguyên nhân
- Cảm giác cô đơn, không được hiểu
- Thiếu tự tin, hình ảnh bản thân tiêu cực
- Xử lý thất bại và sai lầm

🌱 KHÁM PHÁ BẢN THÂN:
- Sở thích, điểm mạnh, tính cách
- Giá trị sống và điều quan trọng với bản thân
- Định hướng nghề nghiệp phù hợp

🏠 GIA ĐÌNH:
- Mâu thuẫn với cha mẹ
- Áp lực kỳ vọng gia đình
- Hoàn cảnh gia đình khó khăn

═══════════════════════════════════════
QUY TRÌNH PHẢN HỒI CHUẨN
═══════════════════════════════════════
BƯỚC 1 – LẮNG NGHE & ĐỒNG CẢM: Xác nhận cảm xúc, cho học sinh thấy mình được nghe.
BƯỚC 2 – KHÁM PHÁ SÂU HƠN: Đặt 1 câu hỏi mở để hiểu rõ hơn tình huống.
BƯỚC 3 – HỖ TRỢ THIẾT THỰC: Đưa ra gợi ý cụ thể, phù hợp lứa tuổi (khi học sinh đã sẵn sàng).
BƯỚC 4 – KẾT NỐI NGUỒN LỰC: Nhắc đến giáo viên, gia đình hoặc tính năng trên website nếu phù hợp.

═══════════════════════════════════════
XỬ LÝ TÌNH HUỐNG ĐẶC BIỆT
═══════════════════════════════════════
🚨 KHI CÓ NGUY CƠ TỰ HẠI / BẠO LỰC:
→ Phản hồi ngay, không trì hoãn. Thể hiện sự quan tâm thực sự.
→ Không hỏi chi tiết. Không phán xét. Không hoảng loạn.
→ Hướng ngay đến người lớn tin cậy và đường dây hỗ trợ.

📞 CÁC ĐỒ HÀNG HỖ TRỢ TẠI VIỆT NAM:
- Đường dây hỗ trợ trẻ em: 111 (miễn phí, 24/7)
- Đường dây hỗ trợ sức khỏe tâm thần: 1800 599 920 (miễn phí)

💡 KHI HỌC SINH HỎI VỀ TÌNH CẢM / YÊU ĐƯƠNG:
→ Tiếp cận khoa học, không phán xét, hướng đến sức khỏe cảm xúc lành mạnh.
→ Giáo dục về ranh giới cá nhân, sự tôn trọng và tự bảo vệ bản thân.

🎓 KHI HỌC SINH HỎI VỀ KIẾN THỨC HỌC ĐƯỜNG:
→ Có thể hỗ trợ, nhưng luôn kết nối trở lại góc độ cảm xúc và động lực.

═══════════════════════════════════════
ĐIỀU TUYỆT ĐỐI KHÔNG LÀM
═══════════════════════════════════════
✗ Không nói "Bạn bị trầm cảm rồi" hay bất kỳ chẩn đoán nào.
✗ Không nói "Đừng lo, mọi chuyện sẽ ổn thôi" một cách hời hợt.
✗ Không so sánh: "Bạn khác còn khổ hơn bạn mà..."
✗ Không phủ nhận cảm xúc: "Có gì đâu mà phải buồn."
✗ Không ép học sinh chia sẻ nhiều hơn mức họ muốn.
✗ Không đưa ra lời khuyên khi chưa thực sự lắng nghe.`;
// ─── FALLBACK KHI KHÔNG CÓ GEMINI API ───────────────────────────────────────
const getMockResponse = (message) => {
    const lower = message.toLowerCase();
    if (lower.includes('nghề') || lower.includes('làm gì') || lower.includes('tương lai') || lower.includes('chọn nghề') || lower.includes('hướng nghiệp')) {
        return `Câu hỏi về nghề nghiệp là một trong những điều quan trọng nhất ở tuổi này! 🧭\n\nThay vì vội chọn một nghề cụ thể, mình muốn hỏi: **Điều gì khiến bạn cảm thấy hứng khởi và muốn làm mãi mà không thấy chán?** Đó thường là manh mối tốt nhất để tìm hướng đi phù hợp.\n\nBạn có thể kể thêm về điều đó không? 😊`;
    }
    if (lower.includes('áp lực') || lower.includes('stress') || lower.includes('căng thẳng') || lower.includes('mệt mỏi') || lower.includes('kiệt sức')) {
        return `Mình thực sự nghe thấy bạn. Áp lực học lớp 9 không hề nhỏ, và cảm giác mệt mỏi bạn đang trải qua hoàn toàn có lý do. 💙\n\nMình muốn hỏi thêm để hiểu hơn: **Điều gì đang chiếm nhiều năng lượng của bạn nhất lúc này?** Có thể là bài vở, kỳ thi, hay điều gì khác trong cuộc sống?\n\nCứ nói tự nhiên nhé – không cần phải hoàn hảo. 🌱`;
    }
    if (lower.includes('buồn') || lower.includes('không vui') || lower.includes('chán') || lower.includes('thất vọng')) {
        return `Cảm ơn bạn đã tin tưởng chia sẻ với Lumi. Được nghe bạn nói thật sự quan trọng với mình. 🤗\n\nCảm giác buồn hoàn toàn bình thường – nó cho thấy bạn đang quan tâm đến điều gì đó có ý nghĩa. **Điều gì đã xảy ra khiến bạn cảm thấy như vậy?**\n\nNếu cảm giác này kéo dài nhiều ngày, hãy chia sẻ với cô giáo hoặc người thân nhé – họ luôn muốn đồng hành với bạn. 💛`;
    }
    if (lower.includes('bạn bè') || lower.includes('bị cô lập') || lower.includes('không có bạn') || lower.includes('bị ghét') || lower.includes('mâu thuẫn')) {
        return `Mối quan hệ với bạn bè rất quan trọng ở lứa tuổi này, và mình hiểu khi có điều gì đó không ổn thì thật sự rất khó chịu. 💙\n\n**Chuyện gì đang xảy ra với bạn bè của bạn?** Bạn có thể kể thêm không? Mình muốn hiểu đúng tình huống trước khi nói gì thêm.\n\nBạn không đơn độc trong điều này đâu nhé. 🌱`;
    }
    if (lower.includes('gia đình') || lower.includes('bố mẹ') || lower.includes('cha mẹ') || lower.includes('ba mẹ') || lower.includes('không được hiểu')) {
        return `Mối quan hệ với gia đình đôi khi thật phức tạp, nhất là ở tuổi teen – khi bạn đang muốn được độc lập hơn nhưng vẫn cần sự đồng hành. 💙\n\n**Điều gì đang khiến bạn cảm thấy không được hiểu?** Kể cho Lumi nghe nhé – mình sẽ cố gắng hiểu góc nhìn của bạn.`;
    }
    if (lower.includes('tự tin') || lower.includes('kém') || lower.includes('không giỏi') || lower.includes('thua kém') || lower.includes('vô dụng')) {
        return `Mình nghe thấy bạn đang cảm thấy thiếu tự tin, và điều đó thật sự không dễ chút nào. 💙\n\nNhưng mình muốn bạn biết: **Thiếu tự tin không có nghĩa là bạn kém** – nó chỉ có nghĩa là bạn đang so sánh bản thân với một tiêu chuẩn nào đó. Vậy bạn đang so sánh mình với ai hoặc điều gì?\n\nHãy kể thêm nhé – mình muốn giúp bạn nhìn thấy bức tranh đầy đủ hơn. 🌟`;
    }
    if (lower.includes('lo lắng') || lower.includes('sợ') || lower.includes('hồi hộp') || lower.includes('lo âu')) {
        return `Cảm giác lo lắng cho thấy bạn đang quan tâm đến một điều gì đó quan trọng với mình. Hoàn toàn bình thường! 💙\n\n**Hãy thử kỹ thuật thở 4-7-8:** Hít vào 4 giây, giữ 7 giây, thở ra 8 giây. Làm 3 lần, bạn sẽ cảm thấy bình tĩnh hơn.\n\nSau đó kể cho Lumi nghe: **Điều cụ thể nào đang khiến bạn lo nhất lúc này?** 🌱`;
    }
    if (lower.includes('thi') || lower.includes('điểm số') || lower.includes('học') || lower.includes('bài') || lower.includes('không tập trung')) {
        return `Áp lực học tập lớp 9 là thật, và mình không muốn nói giảm nói tránh với bạn. 📚\n\nNhưng mình cũng muốn hỏi: **Điều gì đang cản trở bạn nhiều nhất – là việc không hiểu bài, không có thời gian, hay cảm giác chưa có động lực?** Mỗi nguyên nhân có cách giải quyết khác nhau.\n\nBạn thấy điều nào đúng với mình hơn? 🎯`;
    }
    if (lower.includes('điểm mạnh') || lower.includes('giỏi gì') || lower.includes('tài năng') || lower.includes('bản thân')) {
        return `Câu hỏi tuyệt vời! Nhận ra điểm mạnh của mình là nền tảng để phát triển. 🌟\n\nThử nghĩ theo cách này: **Bạn bè thường nhờ bạn giúp chuyện gì?** Hoặc: **Khi nào bạn cảm thấy mình đang làm việc mà quên cả thời gian?** Đó thường là dấu hiệu của điểm mạnh tự nhiên.\n\nVào tính năng **Hiểu Mình** trên website để khám phá sâu hơn nhé! 🧭`;
    }
    if (lower.includes('cảm ơn') || lower.includes('hay lắm') || lower.includes('giúp ích') || lower.includes('đúng rồi')) {
        return `Mình vui khi được đồng hành với bạn! 😊✨\n\nNhớ rằng những bước nhỏ mỗi ngày đều có ý nghĩa. Bạn đang làm rất tốt khi tìm cách hiểu bản thân hơn.\n\nCòn điều gì bạn muốn chia sẻ hoặc khám phá thêm không? Lumi luôn ở đây! 🌱`;
    }
    return `Cảm ơn bạn đã chia sẻ với Lumi! 🌱\n\nMình đang lắng nghe và muốn hiểu hơn về điều bạn đang trải qua. **Bạn có thể kể thêm không?** Điều gì đang xảy ra với bạn lúc này?\n\nHoặc nếu bạn muốn khám phá một chủ đề cụ thể:\n🧠 Cảm xúc & sức khỏe tâm thần\n📚 Áp lực học tập\n💬 Mối quan hệ bạn bè, gia đình\n🧭 Khám phá bản thân & hướng nghiệp`;
};
// ─── ROUTE CHAT ───────────────────────────────────────────────────────────────
router.post('/chat', auth_1.authenticate, async (req, res) => {
    try {
        const { message, sessionId, previousMessages } = req.body;
        if (!message?.trim())
            return res.status(400).json({ error: 'Vui lòng nhập tin nhắn.' });
        const isSafetyRisk = SAFETY_KEYWORDS.some(kw => message.toLowerCase().includes(kw));
        let aiResponse;
        let isSafe = true;
        if (isSafetyRisk) {
            isSafe = false;
            aiResponse = `Mình rất lo khi nghe bạn nói điều này, và mình muốn bạn biết: **Bạn không phải đối mặt với điều này một mình**. 💙\n\n🚨 **Điều quan trọng nhất lúc này:** Hãy tìm ngay một người lớn đáng tin cậy:\n• **Cô giáo chủ nhiệm** của bạn\n• **Bố hoặc mẹ**, hoặc người thân trong gia đình\n• **Đường dây hỗ trợ trẻ em: 111** (miễn phí, 24/7)\n• **Hỗ trợ sức khỏe tâm thần: 1800 599 920** (miễn phí)\n\nBạn xứng đáng được giúp đỡ và được lắng nghe. Có người đang sẵn sàng đồng hành cùng bạn ngay lúc này. ❤️`;
            try {
                const student = await prisma.student.findUnique({
                    where: { userId: req.user.id },
                    include: { class: { include: { teacher: { include: { user: true } } } } }
                });
                if (student) {
                    await prisma.supportRequest.create({
                        data: { studentId: student.id, emotion: 'URGENT', content: message, visibility: 'URGENT', aiResponse }
                    });
                    if (student.class?.teacher) {
                        await prisma.notification.create({
                            data: {
                                userId: student.class.teacher.userId,
                                type: 'URGENT_SUPPORT',
                                title: '⚠️ Học sinh cần hỗ trợ khẩn cấp',
                                content: `Một học sinh trong lớp ${student.class.name} có thể cần sự giúp đỡ ngay lập tức. Vui lòng kiểm tra tab Hỗ trợ.`
                            }
                        });
                    }
                }
            }
            catch (e) {
                console.error('Safety alert error:', e);
            }
        }
        else {
            const apiKey = process.env.GEMINI_API_KEY;
            if (apiKey && apiKey.length > 20) {
                try {
                    const { GoogleGenAI } = require('@google/genai');
                    const client = new GoogleGenAI({ apiKey });
                    const msgs = (previousMessages || []);
                    // Build conversation history
                    const history = msgs.slice(-10).map(m => `${m.role === 'user' ? 'Học sinh' : 'Lumi'}: ${m.content}`).join('\n');
                    const fullInput = history ? `${history}\nHọc sinh: ${message}` : message;
                    const interaction = await client.interactions.create({
                        model: 'gemini-2.0-flash',
                        system_instruction: LUMI_SYSTEM_PROMPT,
                        input: fullInput,
                    });
                    aiResponse = interaction.output_text || getMockResponse(message);
                }
                catch (e) {
                    console.error('Gemini error:', e);
                    aiResponse = getMockResponse(message);
                }
            }
            else {
                aiResponse = getMockResponse(message);
            }
        }
        // Lưu hội thoại
        const sid = sessionId || `session_${Date.now()}`;
        try {
            const existing = await prisma.aiConversation.findFirst({ where: { userId: req.user.id, sessionId: sid } });
            const msgs = existing ? JSON.parse(existing.messages) : [];
            msgs.push({ role: 'user', content: message, timestamp: new Date().toISOString() });
            msgs.push({ role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() });
            if (existing) {
                await prisma.aiConversation.update({ where: { id: existing.id }, data: { messages: JSON.stringify(msgs) } });
            }
            else {
                await prisma.aiConversation.create({ data: { userId: req.user.id, sessionId: sid, messages: JSON.stringify(msgs) } });
            }
        }
        catch (e) {
            console.error('Conversation save error:', e);
        }
        res.json({ response: aiResponse, isSafe, sessionId: sid });
    }
    catch (error) {
        console.error('Lumi error:', error);
        res.status(500).json({ error: 'Lumi đang bận, vui lòng thử lại sau.' });
    }
});
router.get('/history', auth_1.authenticate, async (req, res) => {
    try {
        const conversations = await prisma.aiConversation.findMany({
            where: { userId: req.user.id },
            orderBy: { updatedAt: 'desc' },
            take: 10
        });
        res.json(conversations.map(c => ({ ...c, messages: JSON.parse(c.messages) })));
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
