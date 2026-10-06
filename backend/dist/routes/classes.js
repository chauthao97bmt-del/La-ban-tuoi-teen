"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.classRoutes = router;
const prisma = new client_1.PrismaClient();
router.get('/my-class', auth_1.authenticate, async (req, res) => {
    try {
        const student = await prisma.student.findUnique({
            where: { userId: req.user.id },
            include: {
                class: {
                    include: {
                        teacher: true,
                        announcements: { orderBy: { createdAt: 'desc' }, take: 20 },
                        _count: { select: { students: true } }
                    }
                }
            }
        });
        if (!student?.class)
            return res.json(null);
        res.json(student.class);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.post('/announcements', auth_1.authenticate, async (req, res) => {
    try {
        const teacher = await prisma.teacher.findUnique({ where: { userId: req.user.id } });
        if (!teacher)
            return res.status(403).json({ error: 'Không có quyền.' });
        const { classId, title, content, type } = req.body;
        const announcement = await prisma.classAnnouncement.create({
            data: { classId, teacherId: teacher.id, title, content, type: type || 'INFO' }
        });
        res.json(announcement);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
