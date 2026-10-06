"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.studentRoutes = router;
const prisma = new client_1.PrismaClient();
// GET /api/students/dashboard
router.get('/dashboard', auth_1.authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'STUDENT') {
            return res.status(403).json({ error: 'Chỉ học sinh mới có thể truy cập.' });
        }
        const student = await prisma.student.findUnique({
            where: { userId: req.user.id },
            include: {
                profile: true,
                goals: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' }, take: 3 },
                challengeProgress: { where: { completed: true } },
                studentBadges: { include: { badge: true }, orderBy: { earnedAt: 'desc' }, take: 5 },
                moodEntries: { orderBy: { createdAt: 'desc' }, take: 7 },
                class: { include: { teacher: true, announcements: { orderBy: { createdAt: 'desc' }, take: 3 } } }
            }
        });
        if (!student)
            return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
        const profile = student.profile;
        const parsedProfile = profile ? {
            ...profile,
            riasecScores: JSON.parse(profile.riasecScores),
            strengths: JSON.parse(profile.strengths),
            values: JSON.parse(profile.values),
            interests: JSON.parse(profile.interests),
            learningStyles: JSON.parse(profile.learningStyles),
        } : null;
        const completedChallenges = student.challengeProgress.length;
        const totalChallenges = 21;
        // Get today's challenge
        const nextChallenge = await prisma.challenge.findFirst({
            where: {
                dayNumber: completedChallenges + 1
            }
        });
        // Lumi question of the day
        const lumiQuestions = [
            'Nếu được thử bất kỳ một công việc nào trong một ngày, bạn muốn thử nghề gì?',
            'Điều gì khiến bạn cảm thấy tự hào về bản thân nhất trong tuần này?',
            'Nếu bạn có thể học một kỹ năng mới trong 30 ngày, bạn sẽ chọn kỹ năng gì?',
            'Người bạn ngưỡng mộ nhất là ai và tại sao?',
            'Điều gì khiến bạn cảm thấy hứng khởi nhất khi nghĩ đến tương lai?',
            'Nếu trường học cho phép bạn dạy một môn học, bạn sẽ dạy môn gì?',
            'Ba điều bạn muốn thay đổi về bản thân là gì?',
        ];
        const dayOfWeek = new Date().getDay();
        const lumiQuestion = lumiQuestions[dayOfWeek];
        res.json({
            student: { ...student, profile: parsedProfile },
            stats: {
                completedChallenges,
                totalChallenges,
                activeGoals: student.goals.length,
                badges: student.studentBadges.length,
                xp: parsedProfile?.xp || 0,
                streak: parsedProfile?.streak || 0,
                level: parsedProfile?.level || 1,
            },
            nextChallenge,
            lumiQuestion,
        });
    }
    catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
