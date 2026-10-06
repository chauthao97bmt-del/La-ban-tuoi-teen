import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const username = String(req.body.username || '').trim();
    if (!username || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }

    // Tìm không phân biệt hoa/thường (VD: 9a101 = 9A101, Co.Ha = co.ha)
    let user = await prisma.user.findUnique({ where: { username } })
      || await prisma.user.findUnique({ where: { username: username.toUpperCase() } })
      || await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
    if (!user) {
      const rows: any[] = await prisma.$queryRaw`SELECT id FROM User WHERE LOWER(username) = LOWER(${username}) LIMIT 1`;
      if (rows.length) user = await prisma.user.findUnique({ where: { id: rows[0].id } });
    }
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    );

    let profile: any = null;
    let fullName = username;

    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
        include: { class: { include: { teacher: true } }, profile: true }
      });
      profile = student;
      fullName = student?.fullName || username;
    } else if (user.role === 'TEACHER' || user.role === 'PSYCHOLOGIST') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
        include: { classes: true }
      });
      profile = teacher;
      fullName = teacher?.fullName || username;
    } else if (user.role === 'ADMIN') {
      fullName = 'Quản Trị Viên';
    }

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName,
        profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Lỗi đăng nhập, vui lòng thử lại.' });
  }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, fullName, classCode } = req.body;
    if (!username || !password || !fullName) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại, vui lòng chọn tên khác.' });
    }

    let classId: string | undefined;
    if (classCode) {
      const cls = await prisma.class.findUnique({ where: { classCode } });
      if (!cls) return res.status(400).json({ error: 'Mã lớp không hợp lệ.' });
      classId = cls.id;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, passwordHash, role: 'STUDENT' } });
    const student = await prisma.student.create({
      data: { userId: user.id, fullName, classId }
    });
    await prisma.studentProfile.create({ data: { studentId: student.id } });

    // Welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'WELCOME',
        title: '🌱 Chào mừng đến với La Bàn Tuổi Teen!',
        content: `Chào ${fullName}! Hành trình khám phá bản thân của bạn bắt đầu từ đây. Hãy thử làm bài Khám Phá Bản Thân đầu tiên nhé! 🧭`
      }
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' } as any
    );

    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, role: user.role, fullName, profile: student }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Lỗi đăng ký, vui lòng thử lại.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng.' });

    let profile: any = null;
    let fullName = user.username;

    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
        include: { class: { include: { teacher: true } }, profile: true }
      });
      if (student?.profile) {
        (student as any).profile = {
          ...student.profile,
          riasecScores: JSON.parse(student.profile.riasecScores),
          strengths: JSON.parse(student.profile.strengths),
          values: JSON.parse(student.profile.values),
          interests: JSON.parse(student.profile.interests),
          learningStyles: JSON.parse(student.profile.learningStyles),
        };
      }
      profile = student;
      fullName = student?.fullName || user.username;
    } else if (user.role === 'TEACHER' || user.role === 'PSYCHOLOGIST') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
        include: { classes: true }
      });
      profile = teacher;
      fullName = teacher?.fullName || user.username;
    } else if (user.role === 'ADMIN') {
      fullName = 'Quản Trị Viên';
    }

    res.json({ id: user.id, username: user.username, role: user.role, fullName, profile });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

export { router as authRoutes };
