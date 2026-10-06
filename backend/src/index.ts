import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// CORS: cho phép mọi origin trong production (domain Render)
app.use(cors({
  origin: isProd
    ? true
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files (production only)
// __dirname trong dist/ → ../../frontend/dist là đúng
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (isProd) {
  app.use(express.static(frontendDist));
}

// Lazy-load routes to avoid circular deps
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

  // SPA fallback — phải đặt SAU tất cả API routes
  if (isProd) {
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`\n🌱 La Bàn Tuổi Teen API đang chạy tại http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    if (!isProd) {
      console.log(`\n📋 Tài khoản demo:`);
      console.log(`   Admin: admin / Admin@123`);
      console.log(`   Giáo viên: giaovien / Demo@123`);
      console.log(`   Học sinh: 9A101 / Demo@123\n`);
    }
  });
}

setupRoutes().catch(console.error);

export default app;
