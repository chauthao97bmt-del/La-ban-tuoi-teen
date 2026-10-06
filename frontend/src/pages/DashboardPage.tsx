import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { EmotionCheckinModal } from '../components/EmotionCheckinModal';

interface DashboardData {
  student: any;
  stats: { completedChallenges: number; totalChallenges: number; activeGoals: number; badges: number; xp: number; streak: number; level: number };
  nextChallenge: any;
  lumiQuestion: string;
  secretMission?: any;
}

const getLevelLabel = (level: number) => ['', 'Người Bắt Đầu 🌱', 'Người Khám Phá 🧭', 'Người Trưởng Thành 🌳', 'Người Dẫn Đầu ⭐', 'Nhà Tiên Phong 🚀'][Math.min(level, 5)] || 'Nhà Tiên Phong 🚀';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingMission, setCompletingMission] = useState(false);
  const [missionCompleteMsg, setMissionCompleteMsg] = useState('');

  // Emotion check-in state
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinAlert, setCheckinAlert] = useState<any>(null);
  const [todayWeather, setTodayWeather] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      Promise.all([
        api.get('/students/dashboard'),
        api.get('/missions/current').catch(() => ({ data: null })),
        api.get('/checkin/today').catch(() => ({ data: { todayCheckin: null } })),
      ]).then(([dbRes, missionRes, checkinRes]) => {
        setData({ ...dbRes.data, secretMission: missionRes.data });
        const todayCheckin = checkinRes.data?.todayCheckin;
        if (todayCheckin) {
          setTodayWeather(todayCheckin.weather);
        } else {
          // Chưa check-in hôm nay → hiện modal sau 1.5s
          setTimeout(() => setShowCheckin(true), 1500);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  const handleCompleteMission = async () => {
    if (!data?.secretMission?.id) return;
    setCompletingMission(true);
    try {
      const res = await api.post(`/missions/${data.secretMission.id}/complete`);
      setData({ ...data, secretMission: res.data.mission });
      setMissionCompleteMsg(res.data.message);
    } catch {
      // ignore
    } finally {
      setCompletingMission(false);
    }
  };

  if (user?.role === 'TEACHER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👩‍🏫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chào mừng, {user.fullName}!</h2>
          <p className="text-gray-500 mb-6">Trang tổng quan dành cho giáo viên</p>
          <Link to="/teacher" className="btn-primary">Vào trang giáo viên →</Link>
        </div>
      </div>
    );
  }

  if (user?.role === 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Xin chào, Quản trị viên!</h2>
          <Link to="/admin" className="btn-primary">Vào trang quản trị →</Link>
        </div>
      </div>
    );
  }

  if (user?.role === 'PSYCHOLOGIST') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chào mừng, {user.fullName}!</h2>
          <p className="text-gray-500 mb-6">Chuyên gia Tâm lý học đường</p>
          <Link to="/psych/inbox" className="btn-primary">Xem hộp thư →</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce-gentle">🌱</div>
          <p className="text-gray-500 mt-3">Đang tải...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const student = data?.student;
  const progressPct = stats ? Math.round((stats.completedChallenges / stats.totalChallenges) * 100) : 0;
  const xpToNextLevel = 500;
  const xpProgress = stats ? Math.min((stats.xp % xpToNextLevel) / xpToNextLevel * 100, 100) : 0;

  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'Chào buổi sáng' : hours < 17 ? 'Chào buổi chiều' : 'Chào buổi tối';

  const WEATHER_LABELS: Record<string, { emoji: string; label: string; color: string }> = {
    HAPPY:   { emoji: '😄', label: 'Vui vẻ',      color: 'bg-yellow-100 text-yellow-700' },
    CALM:    { emoji: '😊', label: 'Bình thường',  color: 'bg-green-100 text-green-700' },
    NEUTRAL: { emoji: '😐', label: 'Mơ hồ',        color: 'bg-gray-100 text-gray-600' },
    SAD:     { emoji: '😔', label: 'Buồn',          color: 'bg-blue-100 text-blue-700' },
    ANXIOUS: { emoji: '😰', label: 'Lo lắng',      color: 'bg-orange-100 text-orange-700' },
    ANGRY:   { emoji: '😤', label: 'Bực bội',      color: 'bg-red-100 text-red-700' },
  };

  const handleCheckinDone = (weather: string, badStreak: number, alert: any) => {
    setTodayWeather(weather);
    setShowCheckin(false);
    if (alert) setCheckinAlert(alert);
  };

  return (
    <div className="animate-fade-in space-y-5">
      {/* Emotion Check-in Modal */}
      {showCheckin && (
        <EmotionCheckinModal
          onClose={() => setShowCheckin(false)}
          onCheckinDone={handleCheckinDone}
        />
      )}

      {/* Alert sau check-in */}
      {checkinAlert && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 animate-fade-in">
          <p className="text-sm text-blue-800 font-medium leading-relaxed">{checkinAlert.message}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {checkinAlert.showPsychBtn && (
              <Link to="/talk-psych" className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-all shadow-sm">
                🧠 Nhắn tin Chuyên gia
              </Link>
            )}
            {checkinAlert.showTeacherBtn && (
              <Link to="/talk-teacher" className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-all shadow-sm">
                💬 Tâm sự với Cô
              </Link>
            )}
            <button onClick={() => setCheckinAlert(null)} className="px-4 py-2 rounded-xl text-gray-400 text-sm hover:text-gray-600">Đóng ✕</button>
          </div>
        </div>
      )}

      {/* ─── Header banner full width ─── */}
      <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/10 rounded-full translate-y-10 -translate-x-10" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: greeting */}
          <div className="flex-1">
            <p className="text-green-100 text-sm font-medium mb-1">{greeting}! 👋</p>
            <h1 className="text-2xl font-bold mb-2">{student?.fullName || user?.fullName}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">{getLevelLabel(stats?.level || 1)}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">🔥 {stats?.streak || 0} ngày liên tiếp</span>
              {todayWeather ? (
                <button onClick={() => setShowCheckin(true)} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-medium transition-colors">
                  {WEATHER_LABELS[todayWeather]?.emoji} {WEATHER_LABELS[todayWeather]?.label}
                </button>
              ) : (
                <button onClick={() => setShowCheckin(true)} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-medium transition-colors animate-pulse">
                  🌤️ Điểm danh cảm xúc
                </button>
              )}
            </div>
          </div>
          {/* Right: XP bar + stats mini */}
          <div className="md:w-72 flex-shrink-0">
            <div className="flex justify-between text-xs text-green-100 mb-1">
              <span>⭐ {stats?.xp || 0} XP</span>
              <span>Cấp {(stats?.level || 1) + 1}: {xpToNextLevel} XP</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5 mb-4">
              <div className="bg-white rounded-full h-2.5 progress-bar" style={{ width: `${xpProgress}%` }} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Thử thách', value: `${stats?.completedChallenges || 0}/21`, icon: '🏆' },
                { label: 'Mục tiêu', value: stats?.activeGoals || 0, icon: '🎯' },
                { label: 'Huy hiệu', value: stats?.badges || 0, icon: '🎖️' },
                { label: 'XP', value: stats?.xp || 0, icon: '⭐' },
              ].map((s, i) => (
                <div key={i} className="bg-white/15 rounded-xl p-2 text-center">
                  <div className="text-base">{s.icon}</div>
                  <div className="font-bold text-sm">{s.value}</div>
                  <div className="text-[10px] text-green-100">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2-column grid for desktop ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-5">

          {/* 21-Day Progress */}
          <div className="card h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">🏆 Hành trình 21 ngày</h2>
              <Link to="/challenges" className="text-green-600 text-sm font-medium">Xem tất cả →</Link>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
              <div className="bg-gradient-to-r from-green-400 to-teal-500 rounded-full h-3 progress-bar" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-4">
              <span>🌱 Bắt đầu</span>
              <span className="font-medium text-green-600">{progressPct}% hoàn thành</span>
              <span>🌳 Hoàn thành</span>
            </div>
            {data?.nextChallenge && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-green-600 mb-1">📅 Thử thách ngày {data.nextChallenge.dayNumber}</p>
                <p className="font-semibold text-gray-800 mb-1">{data.nextChallenge.title}</p>
                <p className="text-xs text-gray-600 mb-3">{data.nextChallenge.description}</p>
                <Link to="/challenges" className="btn-primary text-sm py-2 px-4 inline-block">Bắt đầu ngay ✨</Link>
              </div>
            )}
          </div>



          {/* Announcements */}
          {student?.class?.announcements?.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">📢 Thông báo lớp {student.class.name}</h2>
              <div className="space-y-3">
                {student.class.announcements.slice(0, 3).map((ann: any) => (
                  <div key={ann.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="font-semibold text-blue-800 text-sm mb-1">{ann.title}</p>
                    <p className="text-blue-600 text-xs">{ann.content.substring(0, 120)}...</p>
                    <p className="text-blue-400 text-xs mt-2">{new Date(ann.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-5">

          {/* Quick Actions - 3 cột trên desktop */}
          <div>
            <h2 className="font-bold text-gray-900 mb-4">⚡ Khám phá nhanh</h2>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {[
                { icon: '🧪', label: 'Khám phá bản thân', path: '/self-discovery', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700' },
                { icon: '💼', label: 'Thế giới nghề nghiệp', path: '/careers', color: 'bg-green-50 border-green-200', textColor: 'text-green-700' },
                { icon: '🎯', label: 'Mục tiêu của tôi', path: '/goals', color: 'bg-orange-50 border-orange-200', textColor: 'text-orange-700' },
                { icon: '📔', label: 'Nhật ký cảm xúc', path: '/mood', color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700' },
                { icon: '📋', label: 'Hồ sơ Kỹ năng', path: '/skill-portfolio', color: 'bg-indigo-50 border-indigo-200', textColor: 'text-indigo-700' },
                { icon: '🏆', label: 'Thử thách 21 ngày', path: '/challenges', color: 'bg-pink-50 border-pink-200', textColor: 'text-pink-700' },
                { icon: '📓', label: 'Nhật ký', path: '/journal', color: 'bg-sky-50 border-sky-200', textColor: 'text-sky-700' },
              ].map((item, i) => (
                <Link key={i} to={item.path} className={`flex items-center gap-2 p-3 rounded-xl border ${item.color} hover:shadow-md transition-all`}>
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <span className={`text-xs font-semibold ${item.textColor} leading-tight`}>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Tính năng nổi bật */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">🌟 Tính năng đặc biệt</h2>
            <div className="space-y-3">
              <Link to="/talk-psych" className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">🧠</div>
                <div>
                  <p className="font-bold text-indigo-800 text-sm">Trò chuyện với Chuyên gia Tâm lý</p>
                  <p className="text-xs text-indigo-600 mt-0.5">Ẩn danh hoặc để tên — luôn được lắng nghe</p>
                </div>
              </Link>
              <Link to="/skill-portfolio" className="flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-200 rounded-xl hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">📋</div>
                <div>
                  <p className="font-bold text-violet-800 text-sm">Hồ sơ Kỹ năng của tôi</p>
                  <p className="text-xs text-violet-600 mt-0.5">CV học sinh - tổng hợp tự động</p>
                </div>
              </Link>
              <Link to="/talk-teacher" className="flex items-center gap-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">💬</div>
                <div>
                  <p className="font-bold text-sky-800 text-sm">Tâm sự với GVCN</p>
                  <p className="text-xs text-sky-600 mt-0.5">Gửi tâm sự đến cô chủ nhiệm</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom padding & Logout */}
      <div className="h-6 md:h-2" />
      
      {/* Nút đăng xuất ở cuối trang cho mobile dễ dùng */}
      <div className="md:hidden mt-8 mb-6 flex justify-center">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors text-sm font-bold border border-red-100 active:scale-95 shadow-sm"
        >
          <span className="text-xl">🚪</span>
          <span>Đăng xuất tài khoản</span>
        </button>
      </div>
    </div>
  );
};
