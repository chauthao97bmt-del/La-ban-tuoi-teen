"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Bắt đầu tạo dữ liệu demo...');
    // Clean
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.classAnnouncement.deleteMany();
    await prisma.supportRequest.deleteMany();
    await prisma.aiConversation.deleteMany();
    await prisma.studentBadge.deleteMany();
    await prisma.challengeProgress.deleteMany();
    await prisma.challenge.deleteMany();
    await prisma.badge.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.journalEntry.deleteMany();
    await prisma.moodEntry.deleteMany();
    await prisma.careerExploration.deleteMany();
    await prisma.assessment.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.career.deleteMany();
    await prisma.careerCategory.deleteMany();
    await prisma.parentResource.deleteMany();
    await prisma.student.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.class.deleteMany();
    await prisma.user.deleteMany();
    await prisma.setting.deleteMany();
    const demoHash = await bcryptjs_1.default.hash('Demo@123', 10);
    const adminHash = await bcryptjs_1.default.hash('Admin@123', 10);
    // Admin
    await prisma.user.create({ data: { username: 'admin', passwordHash: adminHash, role: 'ADMIN' } });
    // Teacher
    const teacherUser = await prisma.user.create({ data: { username: 'giaovien', passwordHash: demoHash, role: 'TEACHER' } });
    const teacher = await prisma.teacher.create({ data: { userId: teacherUser.id, fullName: 'Nguyễn Thị Hoa', subject: 'Ngữ Văn', avatar: '👩‍🏫' } });
    // Class
    const cls = await prisma.class.create({ data: { name: '9A1', year: 2024, classCode: 'LBT15-9A1', teacherId: teacher.id } });
    // Students
    const studentData = [
        { name: 'Trần Minh Khoa', avatar: '🌱', username: 'hocsinh01' },
        { name: 'Nguyễn Thị Lan Anh', avatar: '🌸', username: 'hocsinh02' },
        { name: 'Lê Văn Đức', avatar: '⚡', username: 'hocsinh03' },
        { name: 'Phạm Thị Thu', avatar: '🌺', username: 'hocsinh04' },
        { name: 'Hoàng Minh Tuấn', avatar: '🚀', username: 'hocsinh05' },
        { name: 'Vũ Thị Hương', avatar: '🦋', username: 'hocsinh06' },
        { name: 'Đặng Văn Long', avatar: '🌟', username: 'hocsinh07' },
        { name: 'Bùi Thị Ngọc', avatar: '💎', username: 'hocsinh08' },
        { name: 'Trịnh Văn Hùng', avatar: '🔥', username: 'hocsinh09' },
        { name: 'Lý Thị Mai', avatar: '🌈', username: 'hocsinh10' },
    ];
    const students = [];
    for (const sd of studentData) {
        const user = await prisma.user.create({ data: { username: sd.username, passwordHash: demoHash, role: 'STUDENT' } });
        const student = await prisma.student.create({ data: { userId: user.id, fullName: sd.name, classId: cls.id, avatar: sd.avatar } });
        await prisma.studentProfile.create({
            data: {
                studentId: student.id,
                riasecScores: JSON.stringify({ R: Math.floor(Math.random() * 8) + 2, I: Math.floor(Math.random() * 8) + 2, A: Math.floor(Math.random() * 8) + 2, S: Math.floor(Math.random() * 8) + 2, E: Math.floor(Math.random() * 8) + 2, C: Math.floor(Math.random() * 8) + 2 }),
                strengths: JSON.stringify(['Sáng tạo', 'Kiên trì'].slice(0, Math.floor(Math.random() * 2) + 1)),
                xp: Math.floor(Math.random() * 400) + 50,
                level: Math.floor(Math.random() * 3) + 1,
                streak: Math.floor(Math.random() * 8)
            }
        });
        // Welcome notification
        await prisma.notification.create({
            data: { userId: user.id, type: 'WELCOME', title: '🌱 Chào mừng đến với La Bàn Tuổi 15!', content: `Chào ${sd.name}! Hành trình khám phá bản thân của bạn bắt đầu từ đây. 🧭` }
        });
        students.push({ student, userId: user.id });
    }
    // Badges
    const badges = await Promise.all([
        prisma.badge.create({ data: { name: 'Người Bắt Đầu', description: 'Hoàn thành thử thách đầu tiên', icon: '🌱', condition: 'FIRST_CHALLENGE' } }),
        prisma.badge.create({ data: { name: 'Nhà Thám Hiểm', description: 'Khám phá 5 nghề nghiệp', icon: '🧭', condition: 'EXPLORE_5_CAREERS' } }),
        prisma.badge.create({ data: { name: 'Người Kiên Trì', description: 'Streak 7 ngày', icon: '🔥', condition: 'STREAK_7' } }),
        prisma.badge.create({ data: { name: 'Nhà Tự Nhận Thức', description: 'Hoàn thành khám phá bản thân', icon: '🌟', condition: 'COMPLETE_SELF_DISCOVERY' } }),
        prisma.badge.create({ data: { name: 'Người Chia Sẻ', description: 'Viết 10 nhật ký', icon: '📔', condition: 'JOURNAL_10' } }),
        prisma.badge.create({ data: { name: 'Người Hoàn Thành', description: 'Hoàn thành 21 ngày thử thách', icon: '🏆', condition: 'COMPLETE_21_DAYS' } }),
        prisma.badge.create({ data: { name: 'Người Kiến Tạo', description: 'Đặt và hoàn thành 3 mục tiêu', icon: '🎯', condition: 'COMPLETE_3_GOALS' } }),
        prisma.badge.create({ data: { name: 'Người Trò Chuyện', description: 'Trò chuyện với Lumi 10 lần', icon: '🤖', condition: 'LUMI_10_CHATS' } }),
        prisma.badge.create({ data: { name: 'Nhà Thử Nghề', description: 'Thử nghề 3 lần', icon: '⚗️', condition: 'TRY_3_CAREERS' } }),
        prisma.badge.create({ data: { name: 'Người Trưởng Thành', description: 'Đạt level 3', icon: '🌳', condition: 'REACH_LEVEL_3' } }),
    ]);
    // Award first student some badges for demo
    const firstStudent = students[0].student;
    await prisma.studentBadge.create({ data: { studentId: firstStudent.id, badgeId: badges[0].id } });
    await prisma.studentBadge.create({ data: { studentId: firstStudent.id, badgeId: badges[3].id } });
    // 21 Challenges
    const challengeData = [
        { day: 1, title: 'Ba Điều Tôi Làm Tốt', description: 'Viết ra 3 điều bạn đã làm tốt hôm nay. Không cần phải là thành tích lớn – điều nhỏ cũng đáng trân trọng! ✍️', xp: 50 },
        { day: 2, title: 'Lời Cảm Ơn Chân Thành', description: 'Nói lời cảm ơn với một người đã giúp đỡ bạn. Có thể là lời nói trực tiếp, tin nhắn, hoặc ghi vào đây. 💛', xp: 50 },
        { day: 3, title: '30 Phút Không Điện Thoại', description: 'Thử dành 30 phút không dùng điện thoại. Dùng thời gian đó để đọc sách, vẽ, hoặc chỉ đơn giản là nhìn ra cửa sổ. 📵', xp: 60 },
        { day: 4, title: 'Hỏi Bố Mẹ Về Công Việc', description: 'Hỏi bố hoặc mẹ về công việc của họ. Điều gì khiến họ thích? Điều gì khó khăn? Ghi lại những điều thú vị. 👨‍👩‍👧', xp: 70 },
        { day: 5, title: 'Khám Phá Một Nghề Mới', description: 'Tìm hiểu về một nghề bạn chưa biết nhiều. Xem video, đọc bài viết, hoặc hỏi người thân. Ghi lại 3 điều thú vị. 🔍', xp: 60 },
        { day: 6, title: 'Giúp Đỡ Một Người', description: 'Tìm một việc nhỏ để giúp đỡ ai đó hôm nay – bạn bè, gia đình. Cảm giác như thế nào? 🤝', xp: 50 },
        { day: 7, title: 'Điều Tôi Đang Lo Lắng', description: 'Viết về một điều bạn đang lo lắng. Chỉ cần đặt nó ra trên giấy – bạn không cần giải quyết nó ngay. 😮‍💨', xp: 60 },
        { day: 8, title: 'Kỹ Năng Muốn Học', description: 'Nghĩ về 3 kỹ năng bạn muốn học trong năm nay. Tại sao bạn muốn học chúng? Chúng sẽ giúp bạn thế nào? 📚', xp: 70 },
        { day: 9, title: 'Người Truyền Cảm Hứng', description: 'Ai là người truyền cảm hứng cho bạn? Có thể là người thật hay nhân vật sách. Điều gì ở họ khiến bạn ngưỡng mộ? ⭐', xp: 60 },
        { day: 10, title: 'Điều Khiến Tôi Tự Hào', description: 'Viết về một khoảnh khắc trong năm nay khiến bạn tự hào về bản thân. Dù nhỏ đến đâu cũng được! 🌟', xp: 70 },
        { day: 11, title: 'Bữa Sáng Chánh Niệm', description: 'Ngày mai, khi ăn sáng, hãy ăn chậm và chú ý. Không điện thoại, không TV. Chỉ là bữa ăn và bạn. 🍳', xp: 50 },
        { day: 12, title: 'Viết Thư Cho Tương Lai', description: 'Viết một đoạn thư ngắn cho phiên bản 16 tuổi của bạn. Bạn muốn nói gì với "bạn tương lai"? ✉️', xp: 80 },
        { day: 13, title: 'Điểm Mạnh Của Bạn Bè', description: 'Quan sát bạn bè hôm nay. Nhận ra 3 điểm mạnh của 3 người bạn khác nhau và nói với họ hoặc ghi lại. 💫', xp: 70 },
        { day: 14, title: 'Thử Điều Mới', description: 'Hôm nay thử làm một điều bạn chưa bao giờ làm – món ăn mới, hoạt động mới, hay đi con đường khác. 🌈', xp: 80 },
        { day: 15, title: 'Ranh Giới Cá Nhân', description: 'Nghĩ về một điều bạn không thoải mái khi người khác làm với bạn. Đó là ranh giới của bạn – hoàn toàn bình thường! 🛡️', xp: 70 },
        { day: 16, title: 'Danh Sách Biết Ơn', description: 'Viết 5 điều bạn biết ơn trong cuộc sống hiện tại. Chú ý những điều nhỏ bạn thường bỏ qua. 🌻', xp: 60 },
        { day: 17, title: 'Chăm Sóc Bản Thân', description: 'Dành 10 phút hôm nay làm một điều chăm sóc bản thân: thiền, đi bộ, nghe nhạc yêu thích, hay chỉ nghỉ ngơi. 💆', xp: 50 },
        { day: 18, title: 'Câu Chuyện Của Tôi', description: 'Viết một đoạn ngắn về cuộc sống của bạn – những kỷ niệm, bước ngoặt, và điều quan trọng với bạn. 📖', xp: 80 },
        { day: 19, title: 'Kết Nối Với Thiên Nhiên', description: 'Dành ít nhất 15 phút ở ngoài trời – đi bộ, ngồi trong vườn, hay nhìn bầu trời. Quan sát và cảm nhận. 🌿', xp: 60 },
        { day: 20, title: 'Thói Quen Tôi Muốn Thay Đổi', description: 'Chọn một thói quen muốn thay đổi và viết kế hoạch: tại sao, như thế nào, và bao giờ bắt đầu. 🎯', xp: 80 },
        { day: 21, title: 'Thư Gửi Tôi Ở Tuổi 18', description: 'Viết bức thư cho phiên bản 18 tuổi của bạn. Bạn hy vọng điều gì? Cảm ơn bản thân vì hành trình 21 ngày này! 🌱✨', xp: 100 },
    ];
    for (const c of challengeData) {
        await prisma.challenge.create({ data: { dayNumber: c.day, title: c.title, description: c.description, xpReward: c.xp } });
    }
    // Career categories
    const categoryMap = {};
    const catData = [
        { name: 'Công Nghệ', icon: '💻', color: '#3B82F6' },
        { name: 'Y Tế & Sức Khỏe', icon: '🏥', color: '#EF4444' },
        { name: 'Giáo Dục', icon: '📚', color: '#8B5CF6' },
        { name: 'Kinh Doanh', icon: '💼', color: '#F59E0B' },
        { name: 'Nghệ Thuật & Thiết Kế', icon: '🎨', color: '#EC4899' },
        { name: 'Khoa Học', icon: '🔬', color: '#10B981' },
        { name: 'Luật & Xã Hội', icon: '⚖️', color: '#6366F1' },
        { name: 'Môi Trường', icon: '🌿', color: '#22C55E' },
        { name: 'Truyền Thông', icon: '📡', color: '#F97316' },
        { name: 'Thể Thao', icon: '⚽', color: '#06B6D4' },
    ];
    for (const cat of catData) {
        categoryMap[cat.name] = await prisma.careerCategory.create({ data: cat });
    }
    // Careers
    const careers = [
        { cat: 'Công Nghệ', name: 'Lập Trình Viên', slug: 'lap-trinh-vien', desc: 'Lập trình viên viết code để tạo ra phần mềm, ứng dụng và website – "nói chuyện" với máy tính bằng ngôn ngữ lập trình.', daily: 'Họp nhóm ngắn, viết code, giải quyết lỗi, xem xét code đồng nghiệp, gặp khách hàng.', env: 'Văn phòng hoặc làm từ xa. Ngồi máy tính nhiều.', ai: 'AI hỗ trợ viết code nhanh hơn (GitHub Copilot). Nhưng thiết kế hệ thống, hiểu yêu cầu người dùng vẫn cần con người.', riasec: ['I', 'R', 'C'], skills: ['Tư duy logic', 'Kiên nhẫn', 'Học liên tục', 'Làm việc nhóm'], subjects: ['Toán', 'Tin học', 'Vật lý'], human: ['Sáng tạo', 'Giao tiếp', 'Đồng cảm với người dùng'], explore: ['Thử viết code đơn giản', 'Chơi Scratch.org', 'Xây website bằng HTML'], challenge: { title: 'Tư Duy Lập Trình', desc: 'Mô tả bằng lời thật chi tiết các bước để làm một tô phở – như đang "lập trình" cho robot. Bước nào trước? Sau? Cần kiểm tra điều kiện gì? Viết ít nhất 10 bước!' } },
        { cat: 'Công Nghệ', name: 'Nhà Thiết Kế UI/UX', slug: 'thiet-ke-ui-ux', desc: 'Tạo ra giao diện đẹp và dễ sử dụng cho app và website. Đứng giữa người dùng và lập trình viên.', daily: 'Nghiên cứu người dùng, phác thảo ý tưởng, tạo prototype, kiểm thử, hợp tác với lập trình viên.', env: 'Văn phòng sáng tạo hoặc remote. Năng động, cởi mở.', ai: 'AI tạo hình ảnh gợi ý, nhưng hiểu cảm xúc người dùng và kể chuyện qua thiết kế vẫn cần con người.', riasec: ['A', 'I', 'S'], skills: ['Tư duy sáng tạo', 'Đồng cảm', 'Kỹ năng trực quan', 'Giao tiếp'], subjects: ['Mỹ thuật', 'Tin học', 'Ngữ văn'], human: ['Sáng tạo', 'Kể chuyện', 'Hiểu văn hóa'], explore: ['Thiết kế poster bằng Canva', 'Phân tích app bạn thích', 'Phác thảo ý tưởng giao diện'], challenge: { title: 'Thiết Kế Cho Người Dùng', desc: 'Phác thảo (trên giấy) giao diện app giúp học sinh lớp 9 quản lý lịch học. Bạn sẽ đặt những gì trên màn hình chính? Tại sao?' } },
        { cat: 'Y Tế & Sức Khỏe', name: 'Bác Sĩ', slug: 'bac-si', desc: 'Chẩn đoán bệnh và điều trị cho bệnh nhân. Nghề đòi hỏi kiến thức chuyên sâu và trách nhiệm cao.', daily: 'Khám bệnh, đọc xét nghiệm, kê đơn, tư vấn bệnh nhân, hội chẩn, cập nhật kiến thức y khoa.', env: 'Bệnh viện, phòng khám. Làm theo ca, áp lực cao.', ai: 'AI hỗ trợ chẩn đoán hình ảnh. Nhưng thăm khám lâm sàng và giao tiếp với bệnh nhân vẫn cần bác sĩ.', riasec: ['I', 'S', 'R'], skills: ['Kiến thức y khoa', 'Giao tiếp', 'Đồng cảm', 'Quyết định dưới áp lực'], subjects: ['Sinh học', 'Hóa học', 'Vật lý', 'Toán'], human: ['Đồng cảm', 'Đạo đức', 'Giao tiếp khó'], explore: ['Đọc sách y khoa phổ thông', 'Tìm hiểu cơ thể người', 'Học sơ cứu cơ bản'], challenge: { title: 'Thám Tử Sức Khỏe', desc: 'Bạn là bác sĩ. Bệnh nhân đến với: mệt mỏi, đau đầu, khó ngủ. Bạn sẽ hỏi thêm những câu gì? Liệt kê ít nhất 5 câu hỏi bác sĩ cần hỏi.' } },
        { cat: 'Giáo Dục', name: 'Giáo Viên', slug: 'giao-vien', desc: 'Truyền đạt kiến thức, kỹ năng và giá trị sống cho học sinh. Nghề có tác động sâu sắc đến xã hội.', daily: 'Soạn bài, dạy học, chấm bài, họp giáo viên, gặp phụ huynh, hỗ trợ học sinh.', env: 'Trường học. Giờ làm việc cố định nhưng nhiều việc chuẩn bị ở nhà.', ai: 'AI cá nhân hóa việc học và chấm bài tự động. Nhưng kết nối cảm xúc và truyền cảm hứng chỉ giáo viên mới làm được.', riasec: ['S', 'A', 'E'], skills: ['Giao tiếp', 'Kiên nhẫn', 'Sáng tạo', 'Tổ chức'], subjects: ['Tất cả môn học', 'Tâm lý học'], human: ['Truyền cảm hứng', 'Đồng cảm', 'Xây dựng niềm tin'], explore: ['Dạy kèm em nhỏ', 'Giải thích bài cho bạn', 'Làm gia sư'], challenge: { title: 'Tôi Là Giáo Viên', desc: 'Chọn một khái niệm trong môn bạn thích nhất. Giải thích nó cho học sinh lớp 5 – dùng ví dụ thực tế, không dùng thuật ngữ khó. Bạn sẽ giải thích thế nào?' } },
        { cat: 'Kinh Doanh', name: 'Doanh Nhân / Khởi Nghiệp', slug: 'doanh-nhan', desc: 'Tạo ra và phát triển doanh nghiệp, giải quyết vấn đề thực tế và tạo ra giá trị cho xã hội.', daily: 'Họp nhóm, gặp đối tác, ra quyết định chiến lược, giải quyết vấn đề, quản lý tài chính.', env: 'Văn phòng và đi công tác. Giờ làm linh hoạt nhưng thường dài.', ai: 'AI phân tích thị trường và tự động hóa quy trình. Nhưng tầm nhìn và lãnh đạo con người vẫn cần doanh nhân.', riasec: ['E', 'S', 'C'], skills: ['Lãnh đạo', 'Dám chịu rủi ro', 'Sáng tạo', 'Tư duy chiến lược'], subjects: ['Toán', 'Ngữ văn', 'Địa lý', 'GDCD'], human: ['Tầm nhìn', 'Lãnh đạo', 'Xây dựng mối quan hệ'], explore: ['Lập kế hoạch kinh doanh nhỏ', 'Tham gia cuộc thi khởi nghiệp', 'Nghiên cứu case study'], challenge: { title: 'Ý Tưởng Kinh Doanh', desc: 'Nghĩ về một vấn đề nhỏ trong trường hoặc khu vực bạn sống. Mô tả ý tưởng kinh doanh giải quyết vấn đề đó: Sản phẩm/dịch vụ là gì? Ai là khách hàng? Tại sao họ trả tiền?' } },
        { cat: 'Nghệ Thuật & Thiết Kế', name: 'Kiến Trúc Sư', slug: 'kien-truc-su', desc: 'Thiết kế công trình xây dựng – từ nhà ở đến tòa nhà ấn tượng. Kết hợp nghệ thuật với kỹ thuật.', daily: 'Gặp khách hàng, phác thảo ý tưởng, vẽ bản thiết kế, làm mô hình 3D, kiểm tra công trình.', env: 'Văn phòng thiết kế và công trường xây dựng.', ai: 'AI hỗ trợ mô hình 3D và tính toán kết cấu. Nhưng sáng tạo và hiểu văn hóa địa phương vẫn cần kiến trúc sư.', riasec: ['A', 'I', 'R'], skills: ['Tư duy không gian', 'Sáng tạo', 'Kỹ thuật', 'Chú ý chi tiết'], subjects: ['Mỹ thuật', 'Toán', 'Vật lý'], human: ['Sáng tạo không gian', 'Kể chuyện qua thiết kế'], explore: ['Phác thảo ngôi nhà mơ ước', 'Chụp ảnh công trình đẹp', 'Tham quan triển lãm'], challenge: { title: 'Phòng Học Lý Tưởng', desc: 'Phác thảo (bằng lời hoặc hình vẽ) một phòng học lý tưởng cho học sinh lớp 9. Cần có những khu vực nào? Ánh sáng, màu sắc ra sao? Tại sao bạn chọn như vậy?' } },
        { cat: 'Khoa Học', name: 'Nhà Khoa Học Môi Trường', slug: 'nha-khoa-hoc-moi-truong', desc: 'Nghiên cứu và tìm giải pháp cho biến đổi khí hậu, ô nhiễm và mất đa dạng sinh học.', daily: 'Thu thập mẫu thiên nhiên, phân tích dữ liệu, viết báo cáo, tư vấn chính sách.', env: 'Phòng thí nghiệm, thực địa ngoài trời, văn phòng.', ai: 'AI phân tích dữ liệu khí hậu lớn. Nhưng đặt câu hỏi nghiên cứu và thuyết phục cộng đồng thay đổi vẫn cần con người.', riasec: ['I', 'R', 'S'], skills: ['Nghiên cứu', 'Phân tích', 'Tư duy hệ thống', 'Viết lách'], subjects: ['Sinh học', 'Hóa học', 'Địa lý', 'Vật lý'], human: ['Đam mê thiên nhiên', 'Truyền thông', 'Vận động chính sách'], explore: ['Quan sát thiên nhiên', 'Tham gia hoạt động môi trường', 'Đo nhiệt độ địa phương theo tuần'], challenge: { title: 'Thám Tử Môi Trường', desc: 'Quan sát khu vực quanh nhà hoặc trường. Liệt kê 3 vấn đề môi trường bạn nhận thấy. Với mỗi vấn đề, đề xuất một giải pháp đơn giản học sinh có thể thực hiện.' } },
        { cat: 'Truyền Thông', name: 'Nhà Báo / Người Sáng Tạo Nội Dung', slug: 'nha-bao', desc: 'Tìm kiếm, kiểm chứng và chia sẻ thông tin đến cộng đồng. Người sáng tạo nội dung cũng là hướng đi thời digital.', daily: 'Nghiên cứu đề tài, phỏng vấn, viết bài, quay và dựng video, tương tác với độc giả.', env: 'Tòa soạn, thực địa, làm việc tự do. Nhịp độ nhanh.', ai: 'AI viết bài đơn giản và phân tích dữ liệu. Nhưng điều tra sự thật và kể chuyện có chiều sâu vẫn cần nhà báo.', riasec: ['A', 'S', 'E'], skills: ['Viết lách', 'Tư duy phản biện', 'Kể chuyện', 'Nghiên cứu'], subjects: ['Ngữ văn', 'Lịch sử', 'Địa lý', 'GDCD'], human: ['Đạo đức nghề nghiệp', 'Đồng cảm', 'Xây dựng niềm tin'], explore: ['Viết blog cá nhân', 'Tạo video ngắn', 'Phỏng vấn người thân về công việc'], challenge: { title: 'Kể Một Câu Chuyện', desc: 'Chọn một người trong gia đình hoặc khu xóm. Phỏng vấn họ 5 phút về công việc hay cuộc sống. Viết đoạn văn ngắn (100 chữ) kể về họ theo cách hấp dẫn nhất.' } },
        { cat: 'Y Tế & Sức Khỏe', name: 'Chuyên Viên Tâm Lý', slug: 'chuyen-vien-tam-ly', desc: 'Hỗ trợ con người vượt qua khó khăn tâm lý, phát triển bản thân và cải thiện chất lượng cuộc sống.', daily: 'Tiếp nhận ca, đánh giá, tư vấn cá nhân hoặc nhóm, viết báo cáo, học tập thường xuyên.', env: 'Phòng khám, bệnh viện, trường học, hành nghề tư.', ai: 'AI hỗ trợ sàng lọc ban đầu. Nhưng kết nối cảm xúc thực sự và đồng hành qua hành trình phức tạp chỉ nhà tâm lý làm được.', riasec: ['S', 'I', 'A'], skills: ['Lắng nghe', 'Đồng cảm', 'Không phán xét', 'Kiến thức tâm lý'], subjects: ['Sinh học', 'Văn học', 'GDCD'], human: ['Đồng cảm sâu sắc', 'Xây dựng niềm tin', 'Hiện diện trọn vẹn'], explore: ['Đọc sách tâm lý học', 'Tập lắng nghe bạn bè', 'Tham gia nhóm hỗ trợ'], challenge: { title: 'Lắng Nghe Thực Sự', desc: 'Nói chuyện với một người bạn hoặc thành viên gia đình 10 phút. Nhưng lần này: chỉ lắng nghe – không ngắt lời, không đưa lời khuyên, không nhìn điện thoại. Sau đó ghi lại cảm nhận.' } },
        { cat: 'Kinh Doanh', name: 'Chuyên Viên Phân Tích Dữ Liệu', slug: 'phan-tich-du-lieu', desc: 'Phân tích dữ liệu để tìm ra insights giúp doanh nghiệp đưa ra quyết định tốt hơn.', daily: 'Thu thập và làm sạch dữ liệu, phân tích bằng công cụ, tạo biểu đồ và báo cáo, trình bày kết quả.', env: 'Văn phòng hoặc remote. Môi trường ổn định, làm nhiều với máy tính.', ai: 'AI tự động hóa nhiều phân tích đơn giản. Nhưng đặt câu hỏi đúng và truyền đạt insights cho người không chuyên vẫn cần con người.', riasec: ['I', 'C', 'R'], skills: ['Toán thống kê', 'Tư duy phân tích', 'Excel/SQL', 'Giao tiếp'], subjects: ['Toán', 'Tin học', 'Vật lý'], human: ['Đặt câu hỏi đúng', 'Kể chuyện bằng dữ liệu', 'Hiểu bối cảnh'], explore: ['Phân tích điểm số lớp mình', 'Lập bảng theo dõi chi tiêu', 'Tạo biểu đồ từ dữ liệu thực tế'], challenge: { title: 'Phân Tích Dữ Liệu Thực Tế', desc: 'Thu thập điểm số của bạn trong học kỳ này. Tìm ra: Môn nào bạn tiến bộ nhất? Môn nào cần cải thiện? Xu hướng điểm số như thế nào? Trình bày bằng số liệu cụ thể.' } },
        { cat: 'Công Nghệ', name: 'Chuyên Gia An Ninh Mạng', slug: 'an-ninh-mang', desc: 'Bảo vệ hệ thống máy tính và dữ liệu khỏi các cuộc tấn công mạng. Ngày càng quan trọng trong thế giới số.', daily: 'Kiểm tra lỗ hổng bảo mật, giám sát hệ thống, phản ứng với sự cố, đào tạo nhân viên.', env: 'Văn phòng, trung tâm điều hành. Đôi khi làm theo ca.', ai: 'AI phát hiện mối đe dọa nhanh hơn. Nhưng tư duy sáng tạo tìm cách tấn công mới và chiến lược bảo mật tổng thể vẫn cần con người.', riasec: ['I', 'R', 'C'], skills: ['Tư duy như hacker', 'Kỹ năng kỹ thuật', 'Phân tích', 'Cập nhật liên tục'], subjects: ['Tin học', 'Toán'], human: ['Tư duy sáng tạo', 'Đạo đức', 'Phán đoán'], explore: ['Thử thách CTF', 'Học cơ bản về mạng máy tính', 'Tìm hiểu bảo mật thông tin'], challenge: { title: 'Bảo Vệ Thông Tin', desc: 'Kiểm tra "độ bảo mật" cuộc sống số của bạn: Mật khẩu có mạnh không? Bạn dùng cùng mật khẩu cho nhiều tài khoản? Bạn có chia sẻ thông tin cá nhân không cần thiết? Liệt kê 3 cách cải thiện bảo mật cá nhân.' } },
        { cat: 'Nghệ Thuật & Thiết Kế', name: 'Nghệ Sĩ / Nhạc Sĩ', slug: 'nghe-si', desc: 'Sáng tác và biểu diễn nghệ thuật để truyền đạt cảm xúc và kết nối con người.', daily: 'Luyện tập, sáng tác, biểu diễn, thu âm, gặp khán giả, hợp tác với nghệ sĩ khác.', env: 'Studio, sân khấu, ngoài trời. Linh hoạt nhưng không ổn định.', ai: 'AI tạo nhạc và hình ảnh, nhưng nghệ thuật chứa đựng cảm xúc và câu chuyện cá nhân là điều không thể thay thế.', riasec: ['A', 'E', 'S'], skills: ['Tài năng nghệ thuật', 'Kiên trì luyện tập', 'Sáng tạo', 'Giao tiếp qua nghệ thuật'], subjects: ['Âm nhạc', 'Mỹ thuật', 'Văn học'], human: ['Cảm xúc thực', 'Câu chuyện cá nhân', 'Kết nối với khán giả'], explore: ['Học một nhạc cụ', 'Tham gia câu lạc bộ nghệ thuật', 'Thử vẽ hoặc sáng tác thơ'], challenge: { title: 'Nghệ Thuật Trong 5 Phút', desc: 'Viết một đoạn thơ 4 câu về cảm xúc bạn đang có lúc này. Không cần hoàn hảo – chỉ cần thật. Hoặc vẽ một hình đơn giản thể hiện cảm xúc đó.' } },
        { cat: 'Thể Thao', name: 'Huấn Luyện Viên Thể Thao', slug: 'huan-luyen-vien', desc: 'Giúp vận động viên và người tập luyện đạt được mục tiêu thể chất và tinh thần.', daily: 'Lên kế hoạch tập luyện, hướng dẫn kỹ thuật, theo dõi tiến độ, động viên học viên.', env: 'Sân tập, phòng gym, ngoài trời.', ai: 'AI phân tích kỹ thuật và tối ưu kế hoạch. Nhưng động viên tinh thần và hiểu tâm lý từng người chỉ HLV thực sự làm được.', riasec: ['S', 'E', 'R'], skills: ['Kiến thức thể thao', 'Giao tiếp', 'Động viên', 'Lên kế hoạch'], subjects: ['Thể dục', 'Sinh học'], human: ['Truyền cảm hứng', 'Đồng cảm', 'Xây dựng tinh thần đội'], explore: ['Tập một môn thể thao', 'Tham gia câu lạc bộ', 'Hướng dẫn bạn bè tập'], challenge: { title: 'Kế Hoạch Tập Luyện', desc: 'Thiết kế kế hoạch tập luyện 1 tuần cho một người bạn muốn khỏe hơn. Tính đến thời gian họ có, thể lực hiện tại, mục tiêu và cách giữ động lực. Kế hoạch cụ thể từng ngày.' } },
        { cat: 'Luật & Xã Hội', name: 'Luật Sư', slug: 'luat-su', desc: 'Bảo vệ quyền lợi khách hàng trong các vụ kiện hoặc tư vấn pháp lý.', daily: 'Nghiên cứu pháp luật, tư vấn khách hàng, soạn hợp đồng, tranh luận tại tòa.', env: 'Văn phòng luật, tòa án. Áp lực cao, giờ làm việc dài.', ai: 'AI tóm tắt án lệ và soạn hợp đồng mẫu. Nhưng tranh luận tại tòa và xây dựng chiến lược vẫn cần luật sư.', riasec: ['E', 'I', 'S'], skills: ['Tư duy logic', 'Tranh luận', 'Nghiên cứu', 'Viết lách'], subjects: ['Ngữ văn', 'Lịch sử', 'GDCD', 'Toán'], human: ['Tranh luận có đạo đức', 'Đồng cảm', 'Phán đoán phức tạp'], explore: ['Tham dự phiên tòa giả định', 'Đọc về các vụ án nổi tiếng', 'Học về quyền trẻ em'], challenge: { title: 'Tranh Luận Có Căn Cứ', desc: 'Chọn một vấn đề bạn quan tâm (ví dụ: học sinh có nên dùng điện thoại trong giờ học?). Trình bày 3 lý lẽ ủng hộ VÀ 3 lý lẽ phản đối – cả hai phía đều cần căn cứ và logic.' } },
        { cat: 'Giáo Dục', name: 'Chuyên Viên Hướng Nghiệp', slug: 'huong-nghiep', desc: 'Giúp học sinh và người lớn khám phá bản thân, định hướng nghề nghiệp và đưa ra lựa chọn phù hợp.', daily: 'Tư vấn cá nhân, tổ chức workshop, phân tích kết quả test, kết nối với doanh nghiệp.', env: 'Trường học, trung tâm tư vấn, doanh nghiệp.', ai: 'AI phân tích sở thích và đề xuất nghề. Nhưng đồng hành với từng người trong hành trình khám phá bản thân là điều AI chưa thay thế được.', riasec: ['S', 'E', 'A'], skills: ['Lắng nghe', 'Đồng cảm', 'Kiến thức nghề', 'Giao tiếp'], subjects: ['Ngữ văn', 'GDCD', 'Sinh học'], human: ['Đồng hành', 'Động viên', 'Xây dựng niềm tin'], explore: ['Giúp bạn khám phá sở thích', 'Tổ chức hoạt động nhóm', 'Nghiên cứu thị trường lao động'], challenge: { title: 'Tư Vấn Cho Bạn', desc: 'Chọn một người bạn. Hỏi họ 5 câu về sở thích, điểm mạnh và ước mơ (bạn tự đặt câu). Dựa trên câu trả lời, đề xuất 2-3 nghề phù hợp và giải thích tại sao.' } },
        { cat: 'Môi Trường', name: 'Kỹ Sư Năng Lượng Tái Tạo', slug: 'ky-su-nang-luong', desc: 'Thiết kế và phát triển hệ thống năng lượng sạch như điện mặt trời, gió và thủy điện.', daily: 'Thiết kế hệ thống, giám sát lắp đặt, phân tích hiệu suất, tư vấn khách hàng.', env: 'Văn phòng kết hợp công trường. Đi nhiều nơi.', ai: 'AI tối ưu vận hành hệ thống. Nhưng thiết kế phù hợp địa lý cụ thể và tư vấn cho khách hàng vẫn cần kỹ sư.', riasec: ['R', 'I', 'C'], skills: ['Kỹ thuật điện', 'Toán học', 'Tư duy phân tích', 'Bảo vệ môi trường'], subjects: ['Vật lý', 'Toán', 'Hóa học'], human: ['Sáng tạo kỹ thuật', 'Giải quyết vấn đề thực tế', 'Tư vấn'], explore: ['Tìm hiểu điện mặt trời', 'Làm thí nghiệm về năng lượng', 'Tham quan nhà máy điện'], challenge: { title: 'Nhà Tiết Kiệm Năng Lượng', desc: 'Quan sát nhà bạn và liệt kê 5 điểm có thể tiết kiệm năng lượng hơn. Với mỗi điểm, đề xuất giải pháp cụ thể và ước tính tiết kiệm được bao nhiêu.' } },
        { cat: 'Công Nghệ', name: 'Kỹ Sư AI / Machine Learning', slug: 'ky-su-ai', desc: 'Xây dựng các hệ thống AI và machine learning giải quyết vấn đề thực tế.', daily: 'Thu thập dữ liệu, xây dựng và huấn luyện model, đánh giá kết quả, triển khai vào sản phẩm.', env: 'Văn phòng công ty công nghệ hoặc lab nghiên cứu. Năng động.', ai: 'Đây là nghề trong lĩnh vực AI. Điều không thể thay thế là đặt câu hỏi đúng và hiểu vấn đề con người.', riasec: ['I', 'R', 'C'], skills: ['Lập trình Python', 'Toán học (thống kê)', 'Tư duy phân tích', 'Học liên tục'], subjects: ['Toán', 'Tin học', 'Vật lý'], human: ['Đặt câu hỏi đúng', 'Hiểu vấn đề con người', 'Đạo đức AI'], explore: ['Tương tác với AI và đặt câu hỏi hay', 'Học Python cơ bản', 'Xem video AI cho beginners'], challenge: { title: 'Dạy AI Phân Biệt', desc: 'Nếu muốn dạy AI phân biệt ảnh mèo và chó, bạn cần làm gì? Mô tả các bước: Thu thập dữ liệu thế nào? Cần bao nhiêu ảnh? Làm sao biết AI học tốt? AI có thể sai không và khi nào?' } },
        { cat: 'Truyền Thông', name: 'Chuyên Viên Marketing', slug: 'marketing', desc: 'Xây dựng thương hiệu và kết nối sản phẩm với khách hàng qua các chiến dịch sáng tạo.', daily: 'Nghiên cứu thị trường, lên chiến lược, tạo nội dung, chạy quảng cáo, phân tích kết quả.', env: 'Văn phòng năng động. Áp lực deadline, môi trường thay đổi nhanh.', ai: 'AI cá nhân hóa quảng cáo và tạo nội dung cơ bản. Nhưng chiến lược sáng tạo và xây dựng câu chuyện thương hiệu vẫn cần con người.', riasec: ['E', 'A', 'S'], skills: ['Sáng tạo', 'Phân tích dữ liệu', 'Giao tiếp', 'Kể chuyện'], subjects: ['Ngữ văn', 'Toán', 'Địa lý'], human: ['Kể chuyện', 'Sáng tạo chiến lược', 'Hiểu văn hóa'], explore: ['Phân tích quảng cáo bạn thích', 'Tạo poster sự kiện', 'Quản lý trang mạng xã hội nhỏ'], challenge: { title: 'Chiến Dịch Marketing Trường Học', desc: 'Thiết kế chiến dịch nhỏ khuyến khích học sinh trong trường đọc sách nhiều hơn. Bạn dùng kênh nào? Thông điệp là gì? Làm sao đo được hiệu quả?' } },
        { cat: 'Y Tế & Sức Khỏe', name: 'Điều Dưỡng', slug: 'dieu-duong', desc: 'Chăm sóc bệnh nhân trực tiếp, là người đồng hành gần nhất với bệnh nhân.', daily: 'Kiểm tra sức khỏe, thực hiện y lệnh, chăm sóc vết thương, hỗ trợ bệnh nhân và gia đình.', env: 'Bệnh viện, phòng khám. Làm theo ca.', ai: 'AI theo dõi sinh hiệu và cảnh báo bất thường. Nhưng sự chăm sóc nhân ái chỉ điều dưỡng mới làm được.', riasec: ['S', 'R', 'I'], skills: ['Chăm sóc', 'Kiên nhẫn', 'Nhanh nhẹn', 'Kiến thức y tế'], subjects: ['Sinh học', 'Hóa học'], human: ['Chăm sóc tận tình', 'Đồng cảm', 'Kiên nhẫn'], explore: ['Học sơ cứu cơ bản', 'Tình nguyện tại bệnh viện', 'Chăm sóc người thân khi ốm'], challenge: { title: 'Chăm Sóc Toàn Diện', desc: 'Nghĩ về một người thân hoặc bạn bè đang không khỏe. Nếu bạn là điều dưỡng chăm sóc họ, bạn sẽ chú ý đến những điều gì ngoài triệu chứng thể chất? (Tâm lý, nhu cầu, sở thích...)' } },
        { cat: 'Khoa Học', name: 'Nhà Nghiên Cứu Sinh Học / Dược', slug: 'nghien-cuu-sinh-hoc', desc: 'Nghiên cứu sinh vật sống và phát triển thuốc, vaccine để cải thiện sức khỏe con người.', daily: 'Thiết kế thí nghiệm, thực hiện trong lab, phân tích kết quả, viết báo cáo.', env: 'Phòng thí nghiệm. Môi trường ổn định, yên tĩnh.', ai: 'AI đang cách mạng hóa phát triển thuốc bằng dự đoán cấu trúc protein. Nhưng thiết kế thí nghiệm sáng tạo vẫn cần nhà khoa học.', riasec: ['I', 'R', 'C'], skills: ['Nghiên cứu', 'Kiên nhẫn', 'Chú ý chi tiết', 'Tư duy khoa học'], subjects: ['Sinh học', 'Hóa học', 'Toán'], human: ['Tò mò khoa học', 'Kiên trì', 'Tư duy sáng tạo'], explore: ['Làm thí nghiệm sinh học đơn giản', 'Nuôi cây hoặc sinh vật nhỏ', 'Đọc tin tức khoa học'], challenge: { title: 'Nhà Khoa Học Tí Hon', desc: 'Thiết kế một thí nghiệm đơn giản để trả lời: "Ánh sáng ảnh hưởng thế nào đến sự phát triển của cây?". Mô tả: Giả thuyết, thiết bị cần, các bước tiến hành, và cách đo kết quả.' } },
    ];
    for (const c of careers) {
        const cat = categoryMap[c.cat];
        if (!cat)
            continue;
        await prisma.career.create({
            data: {
                categoryId: cat.id, name: c.name, slug: c.slug,
                description: c.desc, dailyWork: c.daily,
                keySkills: JSON.stringify(c.skills),
                relatedSubjects: JSON.stringify(c.subjects),
                workEnvironment: c.env, aiImpact: c.ai,
                humanSkills: JSON.stringify(c.human),
                explorationActivities: JSON.stringify(c.explore),
                miniChallenge: JSON.stringify({ title: c.challenge.title, description: c.challenge.desc }),
                riasecMatch: JSON.stringify(c.riasec),
            }
        });
    }
    // Parent resources
    const parentResources = [
        { title: 'Làm sao nói chuyện với con tuổi 15?', cat: 'GIAO_TIEP', content: 'Tuổi 15 là giai đoạn con đang xây dựng bản sắc riêng. Thay vì hỏi "Con học bài chưa?", hãy thử "Hôm nay ở trường có gì vui không?". Lắng nghe không phán xét là bước đầu tiên. Hãy chia sẻ câu chuyện của bạn thời trẻ – con sẽ thấy bạn cũng đã từng như vậy và vượt qua được.' },
        { title: 'Khi con bị điểm thấp nên nói gì?', cat: 'HOC_TAP', content: 'Câu đầu tiên không nên là "Tại sao con được điểm thấp?". Hãy thử: "Con cảm thấy thế nào về bài kiểm tra này?" Điểm số quan trọng nhưng không phải tất cả. Hãy giúp con tìm hiểu nguyên nhân và lên kế hoạch cải thiện – không phải chỉ trích.' },
        { title: 'Làm thế nào để đồng hành với con trước kỳ thi vào 10?', cat: 'THI_CU', content: 'Áp lực thi vào lớp 10 rất lớn. Điều con cần nhất: không gian yên tĩnh để học, bữa ăn đủ dinh dưỡng, và được nghe câu "Con đã cố gắng rất nhiều rồi". Đừng so sánh con với bạn bè. Hãy ăn mừng những tiến bộ nhỏ.' },
        { title: 'Có nên ép con chọn nghề không?', cat: 'HUONG_NGHIEP', content: 'Nghề nghiệp tương lai là hành trình dài. Ở tuổi 15, con chưa cần quyết định ngay. Điều quan trọng là con được khám phá, thử sai và hiểu bản thân. Hỗ trợ con khám phá nhiều lĩnh vực sẽ giúp ích hơn là ép chọn sớm.' },
        { title: 'Vì sao con càng lớn càng ít chia sẻ?', cat: 'GIAO_TIEP', content: 'Đây là điều bình thường. Con đang xây dựng không gian riêng tư và bản sắc cá nhân. Thay vì ép con kể chuyện, tạo cơ hội tự nhiên: cùng nấu ăn, đi siêu thị. Đôi khi con sẽ nói vào những lúc bạn không ngờ.' },
        { title: 'AI đang thay đổi nghề nghiệp như thế nào?', cat: 'HUONG_NGHIEP', content: 'AI sẽ thay đổi hầu hết ngành nghề trong 10-15 năm tới. Nhưng kỹ năng AI khó thay thế: tư duy sáng tạo, đồng cảm, giải quyết vấn đề phức tạp, làm việc với con người. Hãy khuyến khích con phát triển những kỹ năng này.' },
        { title: 'Con đang dùng điện thoại quá nhiều, phải làm sao?', cat: 'SK_TINH_THAN', content: 'Thay vì cấm đoán, hãy nói chuyện về tác động của màn hình. Đặt ra "giờ không điện thoại" cho cả gia đình. Hỏi con "Con đang xem gì vậy?" với thái độ tò mò thay vì phán xét.' },
        { title: 'Làm sao nhận biết con đang căng thẳng quá mức?', cat: 'SK_TINH_THAN', content: 'Dấu hiệu cần chú ý: Ăn hoặc ngủ thay đổi, rút lui khỏi hoạt động yêu thích, dễ cáu kỉnh, hay đau đầu/đau bụng, kết quả học tập giảm đột ngột. Nếu lo lắng, hãy hỏi thẳng và lắng nghe không phán xét. Đừng ngại tìm chuyên gia tâm lý học đường.' },
        { title: 'Bạn bè ảnh hưởng thế nào đến con ở tuổi này?', cat: 'XA_HOI', content: 'Ở tuổi 15, bạn bè có ảnh hưởng rất lớn. Đây là điều bình thường. Hãy tìm hiểu về nhóm bạn của con, mời bạn con về nhà. Xây dựng mối quan hệ tin tưởng để khi có vấn đề, con sẽ tìm đến bạn.' },
        { title: 'Làm thế nào để khen con đúng cách?', cat: 'GIAO_TIEP', content: 'Thay vì "Con thông minh quá!", hãy khen nỗ lực: "Con đã cố gắng rất nhiều cho bài này". Khen cụ thể hiệu quả hơn khen chung chung. Trẻ được khen nỗ lực sẽ kiên trì hơn khi gặp thách thức.' },
    ];
    for (const r of parentResources) {
        await prisma.parentResource.create({ data: { title: r.title, category: r.cat, content: r.content } });
    }
    // Sample data for demo students
    const demoStudent = students[0].student;
    const demoUserId = students[0].userId;
    // Mood entries
    const moods = ['GREAT', 'GOOD', 'NEUTRAL', 'SAD', 'ANXIOUS', 'GOOD', 'GREAT'];
    const moodNotes = [
        'Hôm nay ôn thi được nhiều bài, cảm thấy khá ổn!',
        'Buổi học vui lắm, cô giáo khen cả lớp.',
        'Bình thường thôi.',
        'Bài kiểm tra Toán không được tốt lắm.',
        'Lo lắng về kỳ thi sắp tới.',
        'Đi chơi với bạn bè về.',
        'Hoàn thành bài tập sớm, vui lắm!',
    ];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        await prisma.moodEntry.create({ data: { studentId: demoStudent.id, mood: moods[6 - i], note: moodNotes[6 - i], createdAt: date } });
    }
    // Journal entries
    await prisma.journalEntry.create({ data: { studentId: demoStudent.id, title: 'Ngày đầu tiên', content: 'Hôm nay mình thử dùng La Bàn Tuổi 15. Có vẻ thú vị! Mình muốn tìm hiểu về bản thân và định hướng tương lai. Chưa biết mình muốn làm gì nhưng sẽ từng bước khám phá.' } });
    await prisma.journalEntry.create({ data: { studentId: demoStudent.id, title: 'Về kỳ thi vào lớp 10', content: 'Mình đang lo lắng về kỳ thi. Nhưng mình nghĩ mình sẽ cố gắng từng ngày. Không cần hoàn hảo, chỉ cần tiến bộ mỗi ngày là đủ.' } });
    // Goals
    await prisma.goal.create({ data: { studentId: demoStudent.id, category: 'STUDY', title: 'Cải thiện điểm Toán', description: 'Nâng điểm Toán từ 7 lên 8.5 trong học kỳ này', targetValue: '8.5', currentValue: '7.0', status: 'ACTIVE' } });
    await prisma.goal.create({ data: { studentId: demoStudent.id, category: 'SKILL', title: 'Tự tin nói trước lớp', description: 'Xung phong phát biểu ít nhất 1 lần mỗi tuần', status: 'ACTIVE' } });
    await prisma.goal.create({ data: { studentId: demoStudent.id, category: 'CAREER', title: 'Khám phá 5 nghề', description: 'Tìm hiểu ít nhất 5 nghề khác nhau trong năm nay', targetValue: '5', currentValue: '1', status: 'ACTIVE' } });
    // Class announcement
    await prisma.classAnnouncement.create({ data: { classId: cls.id, teacherId: teacher.id, title: 'Chào mừng đến với La Bàn Tuổi 15! 🌱', content: 'Các em thân mến! Cô rất vui khi chúng ta có không gian này để khám phá, chia sẻ và phát triển. Hãy dùng nó như "nhật ký số" – nơi các em có thể là chính mình. Cô luôn ở đây nếu các em cần hỗ trợ! ❤️', type: 'INFO' } });
    await prisma.classAnnouncement.create({ data: { classId: cls.id, teacherId: teacher.id, title: '📅 Lịch kiểm tra tháng 10', content: 'Tuần 1: Toán (thứ 3), Ngữ văn (thứ 5)\nTuần 2: Lịch sử (thứ 2), Địa lý (thứ 4)\nTuần 3: Tiếng Anh (thứ 6)\nCác em nhớ ôn bài và ngủ đủ giấc nhé!', type: 'EXAM' } });
    // Settings
    await prisma.setting.createMany({ data: [{ key: 'APP_NAME', value: 'La Bàn Tuổi 15' }, { key: 'APP_VERSION', value: '1.0.0' }, { key: 'AI_MODEL', value: 'gemini-3.8-flash' }] });
    console.log('\n✅ Tạo dữ liệu demo thành công!');
    console.log('\n📋 Tài khoản demo:');
    console.log('  Admin:      admin    / Admin@123');
    console.log('  Giáo viên: giaovien / Demo@123');
    console.log('  Học sinh:  hocsinh01→10 / Demo@123');
    console.log('  Mã lớp:    LBT15-9A1\n');
}
main().catch(console.error).finally(() => prisma.$disconnect());
