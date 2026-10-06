"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portfolioRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.portfolioRoutes = router;
const prisma = new client_1.PrismaClient();
// GET /api/portfolio — Hồ sơ Kỹ năng của học sinh
router.get('/', auth_1.authenticate, (0, auth_1.requireRole)(['STUDENT']), async (req, res) => {
    try {
        const student = await prisma.student.findUnique({
            where: { userId: req.user.id },
            include: {
                profile: true,
                assessments: { orderBy: { completedAt: 'desc' }, take: 1 },
                studentBadges: { include: { badge: true } },
                challengeProgress: { where: { completed: true }, include: { challenge: true } },
                careerExplorations: { include: { career: { include: { category: true } } } },
                goals: { where: { status: 'COMPLETED' } },
                journalEntries: { orderBy: { createdAt: 'desc' }, take: 3 },
                class: true,
            }
        });
        if (!student)
            return res.status(404).json({ error: 'Không tìm thấy.' });
        const profile = student.profile;
        const strengths = profile?.strengths ? JSON.parse(profile.strengths) : [];
        const riasec = profile?.riasecScores ? JSON.parse(profile.riasecScores) : {};
        // Xác định top RIASEC
        const riasecLabels = {
            R: 'Thực tế & Kỹ thuật', I: 'Nghiên cứu & Phân tích',
            A: 'Sáng tạo & Nghệ thuật', S: 'Xã hội & Hỗ trợ',
            E: 'Kinh doanh & Lãnh đạo', C: 'Ngăn nắp & Chi tiết'
        };
        const topRiasec = Object.entries(riasec)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([key]) => ({ code: key, label: riasecLabels[key] || key }));
        // Kỹ năng tự động từ hoạt động
        const autoSkills = [];
        if (student.challengeProgress.length >= 7) {
            autoSkills.push({ skill: 'Kiên trì & Bền bỉ', evidence: `Hoàn thành ${student.challengeProgress.length}/21 thử thách`, icon: '🏆' });
        }
        if (student.goals.length >= 2) {
            autoSkills.push({ skill: 'Lập kế hoạch & Quản lý mục tiêu', evidence: `Đã hoàn thành ${student.goals.length} mục tiêu`, icon: '🎯' });
        }
        if (student.journalEntries.length >= 5) {
            autoSkills.push({ skill: 'Tự nhận thức & Phản chiếu bản thân', evidence: 'Duy trì viết nhật ký thường xuyên', icon: '📔' });
        }
        if (student.careerExplorations.length >= 3) {
            autoSkills.push({ skill: 'Tư duy mở & Khám phá', evidence: `Đã khám phá ${student.careerExplorations.length} lĩnh vực nghề nghiệp`, icon: '🧭' });
        }
        if (student.assessments.length >= 1) {
            autoSkills.push({ skill: 'Tự đánh giá & Hiểu bản thân', evidence: 'Đã hoàn thành bài trắc nghiệm RIASEC', icon: '🧠' });
        }
        if (strengths.length >= 3) {
            autoSkills.push({ skill: 'Nhận diện điểm mạnh cá nhân', evidence: `Xác định được ${strengths.length} điểm mạnh`, icon: '⭐' });
        }
        // Huy hiệu → kỹ năng tương ứng
        const badgeSkillMap = {
            'Người Khám Phá': 'Tư duy mở & Tò mò',
            'Nhà Chiến lược': 'Tư duy chiến lược',
            'Người Chia Sẻ': 'Giao tiếp & Kết nối',
            'Người Kiên Nhẫn': 'Kiên nhẫn & Kiên trì',
        };
        student.studentBadges.forEach(sb => {
            const skill = badgeSkillMap[sb.badge.name];
            if (skill) {
                autoSkills.push({ skill, evidence: `Nhận huy hiệu "${sb.badge.name}"`, icon: sb.badge.icon || '🎖️' });
            }
        });
        // Top nghề nghiệp quan tâm
        const careerCounts = {};
        student.careerExplorations.forEach(e => {
            const cat = e.career.category.name;
            careerCounts[cat] = (careerCounts[cat] || 0) + 1;
        });
        const topCareers = Object.entries(careerCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, count]) => ({ name, count }));
        res.json({
            student: {
                id: student.id,
                fullName: student.fullName,
                avatar: student.avatar,
                className: student.class?.name,
                xp: profile?.xp || 0,
                level: profile?.level || 1,
                streak: profile?.streak || 0,
            },
            badges: student.studentBadges.map(sb => ({ name: sb.badge.name, icon: sb.badge.icon, earnedAt: sb.earnedAt })),
            strengths,
            topRiasec,
            autoSkills,
            topCareers,
            completedChallenges: student.challengeProgress.length,
            completedGoals: student.goals.length,
            stats: {
                assessments: student.assessments.length,
                journalEntries: student.journalEntries.length,
                careerExplorations: student.careerExplorations.length,
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
