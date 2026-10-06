"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moodRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.moodRoutes = router;
const prisma = new client_1.PrismaClient();
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student)
            return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
        const { mood, note, isPrivate } = req.body;
        if (!mood)
            return res.status(400).json({ error: 'Vui lòng chọn cảm xúc.' });
        const entry = await prisma.moodEntry.create({
            data: { studentId: student.id, mood, note, isPrivate: isPrivate !== false }
        });
        // Update streak and XP
        await prisma.studentProfile.update({
            where: { studentId: student.id },
            data: {
                lastActiveAt: new Date(),
                xp: { increment: 10 },
                streak: { increment: 1 }
            }
        });
        res.json(entry);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.get('/my', auth_1.authenticate, async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student)
            return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
        const entries = await prisma.moodEntry.findMany({
            where: { studentId: student.id },
            orderBy: { createdAt: 'desc' },
            take: 30
        });
        res.json(entries);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
