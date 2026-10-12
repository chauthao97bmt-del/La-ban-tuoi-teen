import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Đổi mật khẩu
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) {
      setPwMsg({ type: 'err', text: 'Vui lòng điền đầy đủ các ô mật khẩu.' });
      return;
    }
    if (newPw.length < 4) {
      setPwMsg({ type: 'err', text: 'Mật khẩu mới phải có ít nhất 4 ký tự.' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'err', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp nhau.' });
      return;
    }

    setChangingPw(true);
    setPwMsg(null);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: currentPw,
        newPassword: newPw,
      });
      setPwMsg({ type: 'ok', text: `✅ ${res.data.message || 'Đổi mật khẩu thành công!'}` });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err: any) {
      setPwMsg({ type: 'err', text: err.response?.data?.error || 'Có lỗi xảy ra khi đổi mật khẩu.' });
    } finally {
      setChangingPw(false);
    }
  };

  useEffect(() => {
    api.get('/profile/my').then(r => {
      setProfile(r.data);
      setBadges(r.data.studentBadges || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="text-4xl animate-bounce-gentle">👤</div></div>;

  const levelNames = ['', 'Người Bắt Đầu', 'Người Khám Phá', 'Người Trưởng Thành', 'Người Dẫn Đầu', 'Nhà Tiên Phong'];
  const xp = profile?.profile?.xp || 0;
  const level = profile?.profile?.level || 1;
  const xpToNext = 500;
  const xpProgress = Math.min((xp % xpToNext) / xpToNext * 100, 100);
  const riasecScores = profile?.profile?.riasecScores || {};
  const strengths = profile?.profile?.strengths || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl shadow-lg">
            {profile?.avatar || '🌱'}
          </div>
          <div>
            <h1 className="text-xl font-bold">{profile?.fullName}</h1>
            <p className="text-green-100 text-sm">@{user?.username}</p>
            {profile?.class && (
              <p className="text-green-100 text-xs mt-1">🏫 Lớp {profile.class.name} • {profile.class.teacher?.fullName}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <div className="bg-white/20 rounded-xl px-3 py-2 text-center flex-1">
            <div className="text-lg font-bold">{xp}</div>
            <div className="text-xs text-green-100">XP</div>
          </div>
          <div className="bg-white/20 rounded-xl px-3 py-2 text-center flex-1">
            <div className="text-lg font-bold">Cấp {level}</div>
            <div className="text-xs text-green-100">{levelNames[Math.min(level, 5)]}</div>
          </div>
          <div className="bg-white/20 rounded-xl px-3 py-2 text-center flex-1">
            <div className="text-lg font-bold">{profile?.profile?.streak || 0}</div>
            <div className="text-xs text-green-100">🔥 Streak</div>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs text-green-100 mb-1">
            <span>XP hiện tại: {xp}</span>
            <span>Cấp {level + 1}: {(Math.floor(xp / xpToNext) + 1) * xpToNext} XP</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white rounded-full h-2 progress-bar" style={{ width: `${xpProgress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">🎖️ Huy Hiệu Đã Đạt</h2>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((sb: any) => (
              <div key={sb.id} className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center text-xl shadow-sm">{sb.badge.icon}</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{sb.badge.name}</p>
                  <p className="text-xs text-gray-500">{sb.badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RIASEC Results */}
      {Object.keys(riasecScores).length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">🧭 Kiểu Nhân Cách Của Tôi</h2>
          <div className="space-y-2">
            {Object.entries(riasecScores).sort(([,a],[,b]) => (b as number) - (a as number)).map(([key, score]) => {
              const labels: Record<string, { label: string; color: string }> = {
                R: { label: '🔧 Thực hành', color: 'from-orange-400 to-red-400' },
                I: { label: '🔬 Nghiên cứu', color: 'from-blue-400 to-cyan-400' },
                A: { label: '🎨 Sáng tạo', color: 'from-purple-400 to-pink-400' },
                S: { label: '🤝 Xã hội', color: 'from-green-400 to-teal-400' },
                E: { label: '💼 Doanh nhân', color: 'from-yellow-400 to-amber-400' },
                C: { label: '📋 Tỉ mỉ', color: 'from-gray-400 to-slate-400' },
              };
              const info = labels[key] || { label: key, color: 'from-gray-400 to-gray-500' };
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-gray-600 flex-shrink-0">{info.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3">
                    <div className={`bg-gradient-to-r ${info.color} rounded-full h-3 progress-bar`} style={{ width: `${Math.min(((score as number) / 18) * 100, 100)}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-6">{score as number}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">💪 Điểm Mạnh Của Tôi</h2>
          <div className="flex flex-wrap gap-2">
            {strengths.map((s: string, i: number) => (
              <span key={i} className="badge bg-green-100 text-green-700 px-3 py-2 text-sm">✨ {s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Career Explorations */}
      {profile?.careerExplorations?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">🧭 Nghề Đã Khám Phá</h2>
          <div className="flex flex-wrap gap-2">
            {profile.careerExplorations.map((ce: any) => (
              <span key={ce.id} className="badge bg-blue-100 text-blue-700 px-3 py-1.5">{ce.career?.category?.icon} {ce.career?.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Mục tiêu', value: profile?.goals?.length || 0, icon: '🎯' },
          { label: 'Nghề khám phá', value: profile?.careerExplorations?.length || 0, icon: '💼' },
          { label: 'Huy hiệu', value: badges.length, icon: '🏅' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Đổi mật khẩu */}
      <div className="card border border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>🔒</span> Đổi Mật Khẩu
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Bạn có thể chủ động đổi mật khẩu để bảo vệ tài khoản cá nhân.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              placeholder="Nhập mật khẩu đang dùng (mặc định: Demo@123)"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-green-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="Tối thiểu 4 ký tự"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          {pwMsg && (
            <div className={`p-3 rounded-xl text-xs font-medium ${pwMsg.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {pwMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={changingPw || !currentPw || !newPw || !confirmPw}
            className="px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-xs font-bold transition-all shadow-sm"
          >
            {changingPw ? '⏳ Đang lưu...' : '🔑 Cập nhật mật khẩu'}
          </button>
        </form>
      </div>

      <div className="h-20 md:h-4"></div>
    </div>
  );
};
