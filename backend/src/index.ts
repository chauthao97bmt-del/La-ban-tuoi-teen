import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { onRequest } from 'firebase-functions/v2/https';

dotenv.config();

// Luôn đảm bảo dùng đường dẫn IPv4 của Supabase Pooler để tránh lỗi IPv6 trên Render
const POOLER_URL = 'postgresql://postgres.ozddlqdmkmhxhamvjgla:Kawaiioo%40%23113@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('db.ozddlqdmkmhxhamvjgla.supabase.co')) {
  process.env.DATABASE_URL = POOLER_URL;
}

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

let isRoutesReady = false;
let routesPromise: Promise<void> | null = null;

async function setupRoutes() {
  const { authRoutes } = await import('./routes/auth');
  const { studentRoutes } = await import('./routes/students');
  const { careerRoutes } = await import('./routes/careers');
  const { assessmentRoutes } = await import('./routes/assessments');
  const { moodRoutes } = await import('./routes/mood');
  const { journalRoutes } = await import('./routes/journal');
  const { goalRoutes } = await import('./routes/goals');
  const { challengeRoutes } = await import('./routes/challenges');
  const { lumiRoutes } = await import('./routes/lumi');
  const { supportRoutes } = await import('./routes/support');
  const { teacherRoutes } = await import('./routes/teacher');
  const { adminRoutes } = await import('./routes/admin');
  const { notificationRoutes } = await import('./routes/notifications');
  const { classRoutes } = await import('./routes/classes');
  const { profileRoutes } = await import('./routes/profile');
  const { parentRoutes } = await import('./routes/parent');
  const { anonymousRoutes } = await import('./routes/anonymous');
  const { missionRoutes } = await import('./routes/missions');
  const { checkinRoutes } = await import('./routes/checkin');
  const { portfolioRoutes } = await import('./routes/portfolio');
  const { flipAiRoutes } = await import('./routes/flipai');
  const { talkRoutes } = await import('./routes/talk');

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'La Bàn Tuổi Teen', version: '1.0.0', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/careers', careerRoutes);
  app.use('/api/assessments', assessmentRoutes);
  app.use('/api/mood', moodRoutes);
  app.use('/api/journal', journalRoutes);
  app.use('/api/goals', goalRoutes);
  app.use('/api/challenges', challengeRoutes);
  app.use('/api/lumi', lumiRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/teacher', teacherRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/classes', classRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/parent', parentRoutes);
  app.use('/api/anonymous', anonymousRoutes);
  app.use('/api/missions', missionRoutes);
  app.use('/api/checkin', checkinRoutes);
  app.use('/api/portfolio', portfolioRoutes);
  app.use('/api/flipai', flipAiRoutes);
  app.use('/api/talk', talkRoutes);

  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Lỗi máy chủ, vui lòng thử lại sau.' });
  });

  isRoutesReady = true;
}

routesPromise = setupRoutes();

// Firebase Cloud Function 'api'
export const api = onRequest({
  cors: true,
  region: 'asia-southeast1',
  maxInstances: 10
}, async (req, res) => {
  if (!isRoutesReady && routesPromise) await routesPromise;
  app(req, res);
});

// Chạy server khi ở môi trường local hoặc container
if (!process.env.FUNCTION_TARGET && !process.env.K_SERVICE) {
  app.listen(PORT, () => {
    console.log(`🌱 La Bàn Tuổi Teen API running on http://localhost:${PORT}`);
  });
}

export default app;
