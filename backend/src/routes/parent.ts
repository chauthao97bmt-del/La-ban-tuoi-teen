import { Router, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  try {
    const resources = await prisma.parentResource.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(resources);
  } catch (error) { res.status(500).json({ error: 'Lỗi server.' }); }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const resource = await prisma.parentResource.findUnique({ where: { id: req.params.id } });
    if (!resource) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    res.json(resource);
  } catch (error) { res.status(500).json({ error: 'Lỗi server.' }); }
});

export { router as parentRoutes };
