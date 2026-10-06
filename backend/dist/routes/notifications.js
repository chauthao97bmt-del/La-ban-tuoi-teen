"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.notificationRoutes = router;
const prisma = new client_1.PrismaClient();
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.get('/unread-count', auth_1.authenticate, async (req, res) => {
    try {
        const count = await prisma.notification.count({ where: { userId: req.user.id, isRead: false } });
        res.json({ count });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.put('/:id/read', auth_1.authenticate, async (req, res) => {
    try {
        await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: { isRead: true } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.put('/mark-all-read', auth_1.authenticate, async (req, res) => {
    try {
        await prisma.notification.updateMany({ where: { userId: req.user.id }, data: { isRead: true } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
