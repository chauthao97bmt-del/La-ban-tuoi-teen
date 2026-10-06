"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.goalRoutes = router;
const prisma = new client_1.PrismaClient();
router.get('/my', auth_1.authenticate, async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student)
            return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
        const goals = await prisma.goal.findMany({ where: { studentId: student.id }, orderBy: { createdAt: 'desc' } });
        res.json(goals);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student)
            return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
        const { category, title, description, targetValue, currentValue, dueDate } = req.body;
        if (!title || !category)
            return res.status(400).json({ error: 'Vui lòng điền tiêu đề và loại mục tiêu.' });
        const goal = await prisma.goal.create({
            data: {
                studentId: student.id, category, title, description,
                targetValue, currentValue,
                dueDate: dueDate ? new Date(dueDate) : undefined
            }
        });
        res.json(goal);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student)
            return res.status(403).json({ error: 'Không có quyền.' });
        const goal = await prisma.goal.findFirst({ where: { id: req.params.id, studentId: student.id } });
        if (!goal)
            return res.status(404).json({ error: 'Không tìm thấy mục tiêu.' });
        const { title, description, currentValue, targetValue, status, dueDate } = req.body;
        const updated = await prisma.goal.update({
            where: { id: req.params.id },
            data: { title, description, currentValue, targetValue, status, dueDate: dueDate ? new Date(dueDate) : undefined }
        });
        if (status === 'COMPLETED') {
            await prisma.studentProfile.update({
                where: { studentId: student.id },
                data: { xp: { increment: 200 } }
            });
        }
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student)
            return res.status(403).json({ error: 'Không có quyền.' });
        await prisma.goal.deleteMany({ where: { id: req.params.id, studentId: student.id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
