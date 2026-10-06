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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';
// CORS: cho phép mọi origin trong production (domain Render)
app.use((0, cors_1.default)({
    origin: isProd
        ? true
        : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Serve frontend static files (production only)
// __dirname trong dist/ → ../../frontend/dist là đúng
const frontendDist = path_1.default.join(__dirname, '../../frontend/dist');
if (isProd) {
    app.use(express_1.default.static(frontendDist));
}
// Lazy-load routes to avoid circular deps
async function setupRoutes() {
    const { authRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/auth')));
    const { studentRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/students')));
    const { careerRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/careers')));
    const { assessmentRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/assessments')));
    const { moodRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/mood')));
    const { journalRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/journal')));
    const { goalRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/goals')));
    const { challengeRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/challenges')));
    const { lumiRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/lumi')));
    const { supportRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/support')));
    const { teacherRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/teacher')));
    const { adminRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/admin')));
    const { notificationRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/notifications')));
    const { classRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/classes')));
    const { profileRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/profile')));
    const { parentRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/parent')));
    const { anonymousRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/anonymous')));
    const { missionRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/missions')));
    const { checkinRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/checkin')));
    const { portfolioRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/portfolio')));
    const { flipAiRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/flipai')));
    const { talkRoutes } = await Promise.resolve().then(() => __importStar(require('./routes/talk')));
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
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: 'Lỗi máy chủ, vui lòng thử lại sau.' });
    });
    // SPA fallback — phải đặt SAU tất cả API routes
    if (isProd) {
        app.get('*', (req, res) => {
            res.sendFile(path_1.default.join(frontendDist, 'index.html'));
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
exports.default = app;
