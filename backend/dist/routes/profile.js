"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.profileRoutes = router;
const prisma = new client_1.PrismaClient();
router.get('/my', auth_1.authenticate, async (req, res) => {
    try {
        const student = await prisma.student.findUnique({
            where: { userId: req.user.id },
            include: {
                profile: true,
                class: { include: { teacher: true } },
                studentBadges: { include: { badge: true }, orderBy: { earnedAt: 'desc' } },
                goals: { orderBy: { createdAt: 'desc' } },
                careerExplorations: { include: { career: { include: { category: true } } }, orderBy: { exploredAt: 'desc' } }
            }
        });
        if (!student)
            return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
        const profile = student.profile;
        res.json({
            ...student,
            profile: profile ? {
                ...profile,
                riasecScores: JSON.parse(profile.riasecScores),
                strengths: JSON.parse(profile.strengths),
                values: JSON.parse(profile.values),
                interests: JSON.parse(profile.interests),
                learningStyles: JSON.parse(profile.learningStyles),
            } : null
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.put('/update', auth_1.authenticate, async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student)
            return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
        const { fullName, avatar } = req.body;
        const updated = await prisma.student.update({
            where: { id: student.id },
            data: { fullName, avatar }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
