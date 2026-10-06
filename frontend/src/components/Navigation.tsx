import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

const navItems = [
  { icon: '🏠', label: 'Trang chủ', path: '/dashboard' },
  { icon: '🧭', label: 'Bản thân', path: '/self-discovery' },
  { icon: '💼', label: 'Nghề nghiệp', path: '/careers' },
  { icon: '🏆', label: 'Thử thách', path: '/challenges' },
  { icon: '🎯', label: 'Mục tiêu', path: '/goals' },
  { icon: '📔', label: 'Nhật ký', path: '/journal' },
  { icon: '😊', label: 'Cảm xúc', path: '/mood' },
  { icon: '💬', label: 'Tâm sự với Cô', path: '/talk-teacher' },
  { icon: '🧠', label: 'Chuyên gia Tâm lý', path: '/talk-psych' },
  { icon: '📋', label: 'Hồ sơ Kỹ năng', path: '/skill-portfolio' },
  { icon: '👤', label: 'Hồ sơ', path: '/profile' },
];

const mobileNavItems = [
  { icon: '🏠', label: 'Trang chủ', path: '/dashboard' },
  { icon: '🧭', label: 'Bản thân', path: '/self-discovery' },
  { icon: '💬', label: 'Tâm sự', path: '/talk-teacher' },
  { icon: '🧠', label: 'Tâm lý', path: '/talk-psych' },
  { icon: '👤', label: 'Hồ sơ', path: '/profile' },
];

const teacherNavItems = [
  { icon: '📊', label: 'Tổng quan', path: '/teacher' },
  { icon: '👥', label: 'Học sinh', path: '/teacher/students' },
  { icon: '📈', label: 'Thống kê', path: '/teacher/statistics' },
  { icon: '💬', label: 'Tin nhắn HS', path: '/teacher/support' },
  { icon: '📢', label: 'Thông báo', path: '/teacher/announcements' },
];

// Chuyên gia tâm lý có menu riêng
const psychNavItems = [
  { icon: '🏠', label: 'Tổng quan', path: '/psych' },
  { icon: '🧠', label: 'Hộp thư Tâm lý', path: '/psych/inbox' },
  { icon: '👨‍🏫', label: 'Lớp chủ nhiệm', path: '/teacher' },
  { icon: '👤', label: 'Hồ sơ', path: '/profile' },
];

const adminNavItems = [
  { icon: '🏠', label: 'Tổng quan', path: '/admin' },
  { icon: '👨‍🏫', label: 'Lớp chủ nhiệm', path: '/teacher' },
  { icon: '👥', label: 'Người dùng', path: '/admin/users' },
  { icon: '💼', label: 'Nghề nghiệp', path: '/admin/careers' },
  { icon: '⚙️', label: 'Cài đặt', path: '/admin/settings' },
];

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Học sinh',
  TEACHER: 'Giáo viên',
  ADMIN: 'Quản trị',
  PSYCHOLOGIST: 'Chuyên gia Tâm lý',
};

export const Navigation: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [unreadTeacher, setUnreadTeacher] = useState(0);
  const [unreadPsych, setUnreadPsych] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchUnread = () => {
        api.get('/talk/unread-count').then(r => {
          setUnreadTeacher(r.data.unreadTeacher || 0);
          setUnreadPsych(r.data.unreadPsych || 0);
        }).catch(() => {});
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 15000); // Check every 15s
      const handleRefresh = () => fetchUnread();
      window.addEventListener('refreshUnread', handleRefresh);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('refreshUnread', handleRefresh);
      };
    }
  }, [user, location.pathname]); // re-fetch on route change as well

  if (!user) return null;

  const items =
    user.role === 'TEACHER' ? teacherNavItems :
    user.role === 'ADMIN' ? adminNavItems :
    user.role === 'PSYCHOLOGIST' ? psychNavItems :
    navItems;

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 h-screen overflow-y-auto bg-white border-r border-gray-100 p-6 shadow-sm fixed left-0 top-0 z-40">
        <Link to="/dashboard" className="flex items-center gap-3 mb-6 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">🌱</div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">La Bàn Tuổi Teen</div>
            <div className="text-xs text-gray-400">Hiểu mình – Chọn tương lai</div>
          </div>
        </Link>

        <div className="flex flex-col gap-1 flex-1">
          {items.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
            let badge = 0;
            if (item.path === '/talk-teacher' || item.path === '/teacher/support' || (item.path === '/teacher' && user.role !== 'TEACHER')) badge = unreadTeacher;
            if (item.path === '/talk-psych' || item.path === '/psych/inbox') badge = unreadPsych;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-green-50 text-green-700 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-xl relative">
                  {item.icon}
                </span>
                <span className="text-sm flex-1 flex justify-between items-center">
                  {item.label}
                  {badge > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{badge} tin nhắn</span>}
                </span>
                {isActive && <span className="ml-auto w-1.5 h-5 bg-green-500 rounded-full"></span>}
              </Link>
            );
          })}
        </div>

        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
              {user.profile?.avatar || user.fullName?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</div>
              <div className="text-xs text-gray-400">{ROLE_LABELS[user.role] || user.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <span>🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            {user.profile?.avatar || user.fullName?.charAt(0) || '?'}
          </div>
          <div className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">{user.fullName}</div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-colors text-xs font-bold border border-red-100 active:scale-95"
        >
          <span>🚪</span>
          <span>Đăng xuất</span>
        </button>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          {(user?.role === 'STUDENT' ? mobileNavItems : items.slice(0, 5)).map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
            let badge = 0;
            if (item.path === '/talk-teacher' || item.path === '/teacher/support' || (item.path === '/teacher' && user.role !== 'TEACHER')) badge = unreadTeacher;
            if (item.path === '/talk-psych' || item.path === '/psych/inbox') badge = unreadPsych;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all relative ${
                  isActive ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <span className="text-xl relative">
                  {item.icon}
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-bold px-1 rounded-full animate-pulse border-2 border-white">
                      {badge}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && <div className="w-1 h-1 bg-green-500 rounded-full"></div>}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
