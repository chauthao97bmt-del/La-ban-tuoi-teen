"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkinRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.checkinRoutes = router;
const prisma = new client_1.PrismaClient();
const BAD_EMOTIONS = ['SAD', 'ANXIOUS', 'ANGRY'];
const BAD_STREAK_NOTIFY = 5; // 5 lần liên tiếp → thông báo
// POST /api/checkin — Check-in cảm xúc hôm nay
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)(['STUDENT']), async (req, res) => {
    try {
        const { weather, note } = req.body;
        const validEmotions = ['HAPPY', 'CALM', 'NEUTRAL', 'SAD', 'ANXIOUS', 'ANGRY'];
        if (!validEmotions.includes(weather)) {
            return res.status(400).json({ error: 'Cảm xúc không hợp lệ.' });
        }
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student)
            return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
        const today = new Date().toISOString().split('T')[0];
        const checkin = await prisma.emotionCheckin.upsert({
            where: { studentId_checkinDate: { studentId: student.id, checkinDate: today } },
            create: { studentId: student.id, weather, note: note?.trim() || null, checkinDate: today },
            update: { weather, note: note?.trim() || null },
        });
        // Tính streak tiêu cực (liên tiếp)
        const last10 = await prisma.emotionCheckin.findMany({
            where: { studentId: student.id },
            orderBy: { checkinDate: 'desc' },
            take: 10,
        });
        let badStreak = 0;
        for (const c of last10) {
            if (BAD_EMOTIONS.includes(c.weather))
                badStreak++;
            else
                break;
        }
        let alert = null;
        if (badStreak >= 3) {
            alert = {
                streak: badStreak,
                message: badStreak >= BAD_STREAK_NOTIFY
                    ? `Bạn đã trải qua ${badStreak} ngày khó khăn. Thầy/cô rất muốn lắng nghe bạn — hãy liên hệ với chuyên gia tâm lý nhé! 💙`
                    : `Có vẻ thời gian gần đây bạn đang không ổn. Bạn không đơn độc đâu! 💙`,
                showTeacherBtn: badStreak >= 3,
                showPsychBtn: badStreak >= BAD_STREAK_NOTIFY,
            };
        }
        // Nếu đủ 5 ngày → gửi thông báo cho GVCN
        if (badStreak === 5) {
            try {
                const studentFull = await prisma.student.findUnique({
                    where: { id: student.id },
                    include: { class: { include: { teacher: true } } }
                });
                if (studentFull?.class?.teacher) {
                    await prisma.notification.create({
                        data: {
                            userId: studentFull.class.teacher.userId,
                            type: 'URGENT_SUPPORT',
                            title: '⚠️ Học sinh cần được quan tâm',
                            content: `${studentFull.fullName} (${studentFull.class.name}) có 5 ngày liên tiếp cảm xúc tiêu cực. Cô nên hỏi thăm em.`,
                        }
                    });
                }
            }
            catch (e) { /* ignore */ }
        }
        // Nếu đủ 7 ngày → gửi thông báo cho chuyên gia tâm lý
        if (badStreak === 7) {
            try {
                const studentFull = await prisma.student.findUnique({
                    where: { id: student.id },
                    include: { class: true }
                });
                const psychologists = await prisma.user.findMany({ where: { role: 'PSYCHOLOGIST' } });
                for (const psych of psychologists) {
                    await prisma.notification.create({
                        data: {
                            userId: psych.id,
                            type: 'URGENT_SUPPORT',
                            title: '🧠 Cần hỗ trợ tâm lý gấp',
                            content: `Học sinh ${studentFull?.fullName || 'ẩn danh'} (Lớp ${studentFull?.class?.name || '—'}) có 7 ngày liên tiếp cảm xúc tiêu cực. Xin hãy chú ý và hỗ trợ.`,
                        }
                    });
                }
            }
            catch (e) { /* ignore */ }
        }
        res.json({ checkin, badStreak, alert });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
// GET /api/checkin/today
router.get('/today', auth_1.authenticate, (0, auth_1.requireRole)(['STUDENT']), async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student)
            return res.status(404).json({ error: 'Không tìm thấy.' });
        const today = new Date().toISOString().split('T')[0];
        const todayCheckin = await prisma.emotionCheckin.findUnique({
            where: { studentId_checkinDate: { studentId: student.id, checkinDate: today } }
        });
        const last10 = await prisma.emotionCheckin.findMany({
            where: { studentId: student.id },
            orderBy: { checkinDate: 'desc' },
            take: 10,
        });
        let badStreak = 0;
        for (const c of last10) {
            if (BAD_EMOTIONS.includes(c.weather))
                badStreak++;
            else
                break;
        }
        res.json({ todayCheckin, badStreak });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
// GET /api/checkin/history
router.get('/history', auth_1.authenticate, (0, auth_1.requireRole)(['STUDENT']), async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student)
            return res.status(404).json({ error: 'Không tìm thấy.' });
        const history = await prisma.emotionCheckin.findMany({
            where: { studentId: student.id },
            orderBy: { checkinDate: 'desc' },
            take: 30,
        });
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
