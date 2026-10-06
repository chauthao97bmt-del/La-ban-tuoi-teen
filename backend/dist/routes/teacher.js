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
exports.teacherRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.teacherRoutes = router;
const prisma = new client_1.PrismaClient();
router.use(auth_1.authenticate, (0, auth_1.requireRole)(['TEACHER', 'ADMIN', 'PSYCHOLOGIST']));
router.get('/overview', async (req, res) => {
    try {
        const teacher = await prisma.teacher.findUnique({
            where: { userId: req.user.id },
            include: {
                classes: {
                    include: {
                        students: {
                            include: {
                                profile: true,
                                assessments: true,
                                careerExplorations: true,
                                challengeProgress: { where: { completed: true } },
                                moodEntries: { orderBy: { createdAt: 'desc' }, take: 1 }
                            }
                        }
                    }
                }
            }
        });
        if (!teacher)
            return res.status(404).json({ error: 'Không tìm thấy giáo viên.' });
        const classes = teacher.classes.map(cls => {
            const students = cls.students;
            const totalStudents = students.length;
            const studentsWithAssessments = students.filter(s => s.assessments.length > 0).length;
            const studentsWithCareers = students.filter(s => s.careerExplorations.length > 0).length;
            const avgXp = totalStudents > 0 ? Math.round(students.reduce((s, st) => s + (st.profile?.xp || 0), 0) / totalStudents) : 0;
            return {
                ...cls,
                stats: { totalStudents, studentsWithAssessments, studentsWithCareers, avgXp }
            };
        });
        res.json({ teacher, classes });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.get('/support-requests', async (req, res) => {
    try {
        const teacher = await prisma.teacher.findUnique({
            where: { userId: req.user.id },
            include: { classes: true }
        });
        if (!teacher)
            return res.status(404).json({ error: 'Không tìm thấy giáo viên.' });
        const classIds = teacher.classes.map(c => c.id);
        const students = await prisma.student.findMany({ where: { classId: { in: classIds } } });
        const studentIds = students.map(s => s.id);
        const requests = await prisma.supportRequest.findMany({
            where: { studentId: { in: studentIds }, visibility: { in: ['TEACHER', 'URGENT'] } },
            include: { student: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.put('/support-requests/:id/respond', async (req, res) => {
    try {
        const updated = await prisma.supportRequest.update({
            where: { id: req.params.id },
            data: { teacherResponse: req.body.response, status: 'RESPONDED' }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.get('/statistics', async (req, res) => {
    try {
        const teacher = await prisma.teacher.findUnique({
            where: { userId: req.user.id },
            include: { classes: true }
        });
        if (!teacher)
            return res.status(404).json({ error: 'Không tìm thấy giáo viên.' });
        const classIds = teacher.classes.map(c => c.id);
        const students = await prisma.student.findMany({
            where: { classId: { in: classIds } },
            include: {
                profile: true,
                assessments: true,
                careerExplorations: { include: { career: { include: { category: true } } } },
                moodEntries: { orderBy: { createdAt: 'desc' }, take: 7 }
            }
        });
        const totalStudents = students.length;
        const studentsWithAssessments = students.filter(s => s.assessments.length > 0).length;
        const studentsWithCareerExploration = students.filter(s => s.careerExplorations.length > 0).length;
        // Career interests
        const careerCounts = {};
        students.forEach(s => {
            s.careerExplorations.forEach(e => {
                const cat = e.career.category.name;
                careerCounts[cat] = (careerCounts[cat] || 0) + 1;
            });
        });
        const topCareers = Object.entries(careerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        // Mood distribution
        const moodCounts = {};
        students.forEach(s => {
            s.moodEntries.forEach(m => {
                moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
            });
        });
        res.json({
            totalStudents,
            studentsWithAssessments,
            studentsWithCareerExploration,
            topCareers,
            moodDistribution: moodCounts,
            classes: teacher.classes
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.get('/students', async (req, res) => {
    try {
        const teacher = await prisma.teacher.findUnique({
            where: { userId: req.user.id },
            include: { classes: true }
        });
        if (!teacher)
            return res.status(404).json({ error: 'Không tìm thấy giáo viên.' });
        const classIds = teacher.classes.map(c => c.id);
        const students = await prisma.student.findMany({
            where: { classId: { in: classIds } },
            include: {
                profile: true,
                class: true,
                assessments: true,
                careerExplorations: true,
                challengeProgress: { where: { completed: true } },
                studentBadges: true,
                moodEntries: { orderBy: { createdAt: 'desc' }, take: 3 },
                emotionCheckins: { orderBy: { checkinDate: 'desc' }, take: 7 }
            }
        });
        res.json(students.map(s => ({
            ...s,
            profile: s.profile ? {
                ...s.profile,
                riasecScores: JSON.parse(s.profile.riasecScores),
                strengths: JSON.parse(s.profile.strengths),
            } : null,
        })));
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
router.post('/announcements', async (req, res) => {
    try {
        const teacher = await prisma.teacher.findUnique({ where: { userId: req.user.id } });
        if (!teacher)
            return res.status(403).json({ error: 'Không có quyền.' });
        const { classId, title, content, type } = req.body;
        const announcement = await prisma.classAnnouncement.create({
            data: { classId, teacherId: teacher.id, title, content, type: type || 'INFO' }
        });
        // Notify all students in class
        const students = await prisma.student.findMany({ where: { classId }, include: { user: true } });
        await Promise.all(students.map(s => prisma.notification.create({
            data: { userId: s.userId, type: 'CLASS_ANNOUNCEMENT', title: `📢 ${title}`, content: content.substring(0, 100) + '...' }
        })));
        res.json(announcement);
    }
    catch (error) {
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
// ─── QUẢN LÝ HỌC SINH ────────────────────────────────────────────────
// POST /api/teacher/students/create — Tạo tài khoản học sinh mới
router.post('/students/create', async (req, res) => {
    try {
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
        const teacher = await prisma.teacher.findUnique({
            where: { userId: req.user.id },
            include: { classes: true }
        });
        if (!teacher)
            return res.status(403).json({ error: 'Không có quyền.' });
        const { fullName, username, classId } = req.body;
        if (!fullName?.trim())
            return res.status(400).json({ error: 'Tên học sinh không được trống.' });
        if (!username?.trim())
            return res.status(400).json({ error: 'Tên đăng nhập không được trống.' });
        // Kiểm tra classId thuộc lớp của giáo viên
        const validClassIds = teacher.classes.map(c => c.id);
        if (classId && !validClassIds.includes(classId)) {
            return res.status(403).json({ error: 'Lớp không thuộc quyền quản lý của bạn.' });
        }
        const targetClassId = classId || teacher.classes[0]?.id;
        if (!targetClassId)
            return res.status(400).json({ error: 'Không tìm thấy lớp.' });
        // Kiểm tra trùng username
        const existingUser = await prisma.user.findUnique({ where: { username: username.trim() } });
        if (existingUser)
            return res.status(400).json({ error: `Tên đăng nhập "${username}" đã tồn tại. Hãy chọn tên khác.` });
        const passwordHash = await bcrypt.hash('Demo@123', 10);
        const user = await prisma.user.create({
            data: { username: username.trim(), passwordHash, role: 'STUDENT' }
        });
        const student = await prisma.student.create({
            data: { userId: user.id, fullName: fullName.trim(), classId: targetClassId, avatar: '🌱' }
        });
        await prisma.studentProfile.create({
            data: { studentId: student.id, xp: 0, level: 1, streak: 0 }
        });
        await prisma.notification.create({
            data: {
                userId: user.id,
                type: 'WELCOME',
                title: '🌱 Chào mừng đến với La Bàn Tuổi Teen!',
                content: `Chào ${fullName.trim()}! Hành trình khám phá bản thân bắt đầu từ đây. 🧭`,
            }
        });
        res.json({
            success: true,
            message: `Tạo tài khoản thành công cho ${fullName.trim()}!`,
            student: { id: student.id, fullName: student.fullName, username: username.trim() },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
// PUT /api/teacher/students/:id/update — Sửa tên học sinh
router.put('/students/:id/update', async (req, res) => {
    try {
        const teacher = await prisma.teacher.findUnique({
            where: { userId: req.user.id },
            include: { classes: true }
        });
        if (!teacher)
            return res.status(403).json({ error: 'Không có quyền.' });
        const { fullName } = req.body;
        if (!fullName?.trim())
            return res.status(400).json({ error: 'Tên không được trống.' });
        // Tìm học sinh
        const student = await prisma.student.findUnique({ where: { id: req.params.id } });
        if (!student)
            return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
        // Kiểm tra học sinh thuộc lớp của giáo viên
        const validClassIds = teacher.classes.map(c => c.id);
        if (student.classId && !validClassIds.includes(student.classId)) {
            return res.status(403).json({ error: 'Học sinh không thuộc lớp của bạn.' });
        }
        const updated = await prisma.student.update({
            where: { id: req.params.id },
            data: { fullName: fullName.trim() }
        });
        res.json({ success: true, student: updated });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server.' });
    }
});
