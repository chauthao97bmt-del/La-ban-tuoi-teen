import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navigation } from './components/Navigation';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SelfDiscoveryPage } from './pages/SelfDiscoveryPage';
import { CareersPage } from './pages/CareersPage';
import { CareerDetailPage } from './pages/CareerDetailPage';

import { ProfilePage } from './pages/ProfilePage';
import { MoodPage } from './pages/MoodPage';
import { JournalPage } from './pages/JournalPage';
import { GoalsPage } from './pages/GoalsPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminCareersPage } from './pages/AdminCareersPage';
import { SkillPortfolioPage } from './pages/SkillPortfolioPage';
import { TalkTeacherPage } from './pages/TalkTeacherPage';
import { TalkPsychPage } from './pages/TalkPsychPage';
import { SOSPage } from './pages/SOSPage';
import { PsychDashboard } from './pages/PsychDashboard';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return <>{children}</>;
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-full overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      {/* SOS floating button moved to MoodPage */}
    </div>
  );
};

function App() {
  const { user, token, refreshUser } = useAuthStore();

  useEffect(() => {
    if (token && !user) refreshUser();
  }, [token]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />

          {/* Student routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/self-discovery" element={<ProtectedRoute roles={['STUDENT']}><SelfDiscoveryPage /></ProtectedRoute>} />
          <Route path="/careers" element={<ProtectedRoute><CareersPage /></ProtectedRoute>} />
          <Route path="/careers/:slug" element={<ProtectedRoute><CareerDetailPage /></ProtectedRoute>} />

          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/mood" element={<ProtectedRoute roles={['STUDENT']}><MoodPage /></ProtectedRoute>} />
          <Route path="/journal" element={<ProtectedRoute roles={['STUDENT']}><JournalPage /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute roles={['STUDENT']}><GoalsPage /></ProtectedRoute>} />
          <Route path="/challenges" element={<ProtectedRoute roles={['STUDENT']}><ChallengesPage /></ProtectedRoute>} />
          <Route path="/talk-teacher" element={<ProtectedRoute roles={['STUDENT']}><TalkTeacherPage /></ProtectedRoute>} />
          <Route path="/talk-psych" element={<ProtectedRoute roles={['STUDENT']}><TalkPsychPage /></ProtectedRoute>} />
          <Route path="/sos" element={<ProtectedRoute roles={['STUDENT']}><SOSPage /></ProtectedRoute>} />
          <Route path="/skill-portfolio" element={<ProtectedRoute roles={['STUDENT']}><SkillPortfolioPage /></ProtectedRoute>} />
          {/* Removed features -> redirect to dashboard */}
          {['/classroom','/parent-resources','/anonymous-mail','/flip-problem','/support'].map(p => <Route key={p} path={p} element={<Navigate to="/dashboard" replace />} />)}


          {/* Teacher routes */}
          <Route path="/teacher" element={<ProtectedRoute roles={['TEACHER', 'ADMIN', 'PSYCHOLOGIST']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/*" element={<ProtectedRoute roles={['TEACHER', 'ADMIN', 'PSYCHOLOGIST']}><TeacherDashboard /></ProtectedRoute>} />

          {/* Psychologist routes */}
          <Route path="/psych" element={<ProtectedRoute roles={['PSYCHOLOGIST', 'ADMIN']}><PsychDashboard /></ProtectedRoute>} />
          <Route path="/psych/inbox" element={<ProtectedRoute roles={['PSYCHOLOGIST', 'ADMIN']}><PsychDashboard /></ProtectedRoute>} />
          <Route path="/psych/*" element={<ProtectedRoute roles={['PSYCHOLOGIST', 'ADMIN']}><PsychDashboard /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/careers" element={<ProtectedRoute roles={['ADMIN']}><AdminCareersPage /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="text-6xl mb-4">🌱</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Trang không tồn tại</h1>
                <p className="text-gray-500 mb-6">Hình như bạn đi lạc rồi!</p>
                <a href="/dashboard" className="btn-primary">🏠 Về trang chủ</a>
              </div>
            </div>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
