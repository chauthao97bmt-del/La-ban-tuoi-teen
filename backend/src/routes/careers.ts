import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

function parseCareer(career: any) {
  return {
    ...career,
    keySkills: JSON.parse(career.keySkills),
    relatedSubjects: JSON.parse(career.relatedSubjects),
    humanSkills: JSON.parse(career.humanSkills),
    explorationActivities: JSON.parse(career.explorationActivities),
    miniChallenge: JSON.parse(career.miniChallenge),
    riasecMatch: JSON.parse(career.riasecMatch),
  };
}

// GET /api/careers - List all careers
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, riasec } = req.query;
    let careers = await prisma.career.findMany({
      include: { category: true },
      orderBy: { name: 'asc' }
    });

    if (category) {
      careers = careers.filter(c => c.category.name === category);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      careers = careers.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    if (riasec) {
      careers = careers.filter(c => {
        const match = JSON.parse(c.riasecMatch) as string[];
        return match.includes(riasec as string);
      });
    }

    res.json(careers.map(parseCareer));
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// GET /api/careers/categories
router.get('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.careerCategory.findMany({
      include: { _count: { select: { careers: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// GET /api/careers/:slug
router.get('/:slug', async (req: AuthRequest, res: Response) => {
  try {
    const career = await prisma.career.findUnique({
      where: { slug: req.params.slug as string },
      include: { category: true }
    });
    if (!career) return res.status(404).json({ error: 'Không tìm thấy nghề này.' });
    res.json(parseCareer(career));
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// POST /api/careers/:careerId/explore
router.post('/:careerId/explore', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });

    const { challengeResponse, reflection } = req.body;

    const existing = await prisma.careerExploration.findFirst({
      where: { studentId: student.id, careerId: req.params.careerId as string }
    });

    let exploration;
    if (existing) {
      exploration = await prisma.careerExploration.update({
        where: { id: existing.id },
        data: {
          completedChallenge: true,
          challengeResponse: JSON.stringify(challengeResponse),
          reflection: JSON.stringify(reflection)
        }
      });
    } else {
      exploration = await prisma.careerExploration.create({
        data: {
          studentId: student.id,
          careerId: req.params.careerId as string,
          completedChallenge: true,
          challengeResponse: JSON.stringify(challengeResponse),
          reflection: JSON.stringify(reflection)
        }
      });
    }

    // Award XP
    await prisma.studentProfile.update({
      where: { studentId: student.id },
      data: { xp: { increment: 50 } }
    });

    res.json({ success: true, exploration, xpEarned: 50 });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

// GET /api/careers/my/explored
router.get('/my/explored', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });

    const explorations = await prisma.careerExploration.findMany({
      where: { studentId: student.id },
      include: { career: { include: { category: true } } },
      orderBy: { exploredAt: 'desc' }
    });

    res.json(explorations.map(e => ({
      ...e,
      career: parseCareer(e.career)
    })));
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server.' });
  }
});

export { router as careerRoutes };
