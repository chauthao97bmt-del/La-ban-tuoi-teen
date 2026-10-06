"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.adminRoutes = router;
const prisma = new client_1.PrismaClient();
router.use(auth_1.authenticate, (0, auth_1.requireRole)(['ADMIN']));
router.get('/stats', async (req, res) => {
    try {
        const [totalUsers, totalStudents, totalTeachers, totalCareers, totalAssessments, totalClasses] = await Promise.all([
            prisma.user.count(),
            prisma.student.count(),
            prisma.teacher.count(),
            prisma.career.count(),
            prisma.assessment.count(),
            prisma.class.count(),
        ]);
        res.json({ totalUsers, totalStudents, totalTeachers, totalCareers, totalAssessments, totalClasses });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
// GET /admin/users — danh sách tất cả với tên đầy đủ
router.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true, username: true, email: true, role: true, isActive: true, createdAt: true,
                student: { select: { id: true, fullName: true, class: { select: { name: true } } } },
                teacher: { select: { id: true, fullName: true } },
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users.map(u => ({
            ...u,
            fullName: u.student?.fullName || u.teacher?.fullName || u.username,
            className: u.student?.class?.name || null,
        })));
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.put('/users/:id/toggle', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.params.id } });
        if (!user)
            return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
        const updated = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: !user.isActive } });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
// PUT /admin/users/:id/password — đổi mật khẩu
router.put('/users/:id/password', async (req, res) => {
    try {
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự.' });
        }
        const user = await prisma.user.findUnique({ where: { id: req.params.id } });
        if (!user)
            return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
        const hash = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash: hash } });
        res.json({ success: true, message: `Đã đổi mật khẩu cho ${user.username}` });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
// PUT /admin/users/:id/rename — đổi tên
router.put('/users/:id/rename', async (req, res) => {
    try {
        const { fullName } = req.body;
        if (!fullName?.trim())
            return res.status(400).json({ error: 'Tên không được trống.' });
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: { student: true, teacher: true }
        });
        if (!user)
            return res.status(404).json({ error: 'Không tìm thấy.' });
        if (user.student) {
            await prisma.student.update({ where: { id: user.student.id }, data: { fullName: fullName.trim() } });
        }
        else if (user.teacher) {
            await prisma.teacher.update({ where: { id: user.teacher.id }, data: { fullName: fullName.trim() } });
        }
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
// POST /admin/create-teacher — tạo tài khoản giáo viên
router.post('/create-teacher', async (req, res) => {
    try {
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
        const { fullName, username, password } = req.body;
        if (!fullName?.trim())
            return res.status(400).json({ error: 'Tên GV không được trống.' });
        if (!username?.trim())
            return res.status(400).json({ error: 'Tên đăng nhập không được trống.' });
        const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
        if (existing)
            return res.status(400).json({ error: `Tên đăng nhập "${username}" đã tồn tại.` });
        const hash = await bcrypt.hash(password || 'Demo@123', 10);
        const user = await prisma.user.create({ data: { username: username.trim(), passwordHash: hash, role: 'TEACHER' } });
        await prisma.teacher.create({ data: { userId: user.id, fullName: fullName.trim(), subject: 'Chủ nhiệm', avatar: '👩‍🏫' } });
        res.json({ success: true, message: `Tạo GV ${fullName.trim()} thành công!` });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
// POST /admin/create-student — tạo tài khoản học sinh
router.post('/create-student', async (req, res) => {
    try {
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
        const { fullName, username, password, classId } = req.body;
        if (!fullName?.trim())
            return res.status(400).json({ error: 'Tên HS không được trống.' });
        if (!username?.trim())
            return res.status(400).json({ error: 'Tên đăng nhập không được trống.' });
        const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
        if (existing)
            return res.status(400).json({ error: `Tên đăng nhập "${username}" đã tồn tại.` });
        const hash = await bcrypt.hash(password || 'Demo@123', 10);
        const user = await prisma.user.create({ data: { username: username.trim(), passwordHash: hash, role: 'STUDENT' } });
        const student = await prisma.student.create({ data: { userId: user.id, fullName: fullName.trim(), classId: classId || null, avatar: '🌱' } });
        await prisma.studentProfile.create({ data: { studentId: student.id, xp: 0, level: 1, streak: 0 } });
        res.json({ success: true, message: `Tạo HS ${fullName.trim()} thành công!` });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.get('/classes', async (req, res) => {
    try {
        const classes = await prisma.class.findMany({
            include: { teacher: true, _count: { select: { students: true } } },
            orderBy: { name: 'asc' }
        });
        res.json(classes);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
// Career Management
router.post('/careers', auth_1.authenticate, (0, auth_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const { name, categoryId, description, dailyWork, keySkills, relatedSubjects, workEnvironment, aiImpact, humanSkills, explorationActivities, riasecMatch } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let cid = categoryId;
        if (!cid) {
            const firstCat = await prisma.careerCategory.findFirst();
            if (firstCat)
                cid = firstCat.id;
        }
        const career = await prisma.career.create({
            data: {
                name, slug, description, dailyWork: dailyWork || '', workEnvironment: workEnvironment || '', aiImpact: aiImpact || '',
                categoryId: cid,
                keySkills: JSON.stringify(keySkills || []),
                relatedSubjects: JSON.stringify(relatedSubjects || []),
                humanSkills: JSON.stringify(humanSkills || []),
                explorationActivities: JSON.stringify(explorationActivities || []),
                riasecMatch: JSON.stringify(riasecMatch || [])
            }
        });
        res.json(career);
    }
    catch (error) {
        res.status(500).json({ error: 'L�i server.' });
    }
});
router.put('/careers/:id', auth_1.authenticate, (0, auth_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const { name, description, dailyWork, keySkills, relatedSubjects, workEnvironment, aiImpact, humanSkills, explorationActivities, riasecMatch } = req.body;
        const data = {};
        if (name) {
            data.name = name;
            data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }
        if (description)
            data.description = description;
        if (dailyWork)
            data.dailyWork = dailyWork;
        if (workEnvironment)
            data.workEnvironment = workEnvironment;
        if (aiImpact)
            data.aiImpact = aiImpact;
        if (keySkills)
            data.keySkills = JSON.stringify(keySkills);
        if (relatedSubjects)
            data.relatedSubjects = JSON.stringify(relatedSubjects);
        if (humanSkills)
            data.humanSkills = JSON.stringify(humanSkills);
        if (explorationActivities)
            data.explorationActivities = JSON.stringify(explorationActivities);
        if (riasecMatch)
            data.riasecMatch = JSON.stringify(riasecMatch);
        const career = await prisma.career.update({ where: { id: req.params.id }, data });
        res.json(career);
    }
    catch (error) {
        res.status(500).json({ error: 'L�i server.' });
    }
});
router.delete('/careers/:id', auth_1.authenticate, (0, auth_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        await prisma.careerExploration.deleteMany({ where: { careerId: req.params.id } });
        await prisma.career.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'L�i server.' });
    }
});
exports.default = router;
