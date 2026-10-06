"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parentRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
exports.parentRoutes = router;
const prisma = new client_1.PrismaClient();
router.get('/', async (req, res) => {
    try {
        const resources = await prisma.parentResource.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(resources);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const resource = await prisma.parentResource.findUnique({ where: { id: req.params.id } });
        if (!resource)
            return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
        res.json(resource);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
