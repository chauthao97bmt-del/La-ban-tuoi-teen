import React, { useEffect, useState } from 'react';
import api from '../lib/api';

type Tab = 'overview' | 'users' | 'create';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Password change
  const [pwUserId, setPwUserId] = useState<string | null>(null);
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  // Edit name
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState('');

  // Create account
  const [createType, setCreateType] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [cName, setCName] = useState('');
  const [cUsername, setCUsername] = useState('');
  const [cPassword, setCPassword] = useState('Demo@123');
  const [cClassId, setCClassId] = useState('');
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const loadData = async () => {
    try {
      const [s, u, c] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/classes'),
      ]);
      setStats(s.data);
      setUsers(u.data);
      setClasses(c.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const toggleUser = async (id: string) => {
    await api.put(`/admin/users/${id}/toggle`);
    await loadData();
  };

  const changePassword = async (id: string) => {
    if (!newPw || newPw.length < 6) { setPwMsg('Mật khẩu tối thiểu 6 ký tự!'); return; }
    try {
      const res = await api.put(`/admin/users/${id}/password`, { newPassword: newPw });
      setPwMsg(`✅ ${res.data.message}`);
      setNewPw('');
      setTimeout(() => { setPwUserId(null); setPwMsg(''); }, 2000);
    } catch (err: any) { setPwMsg(err.response?.data?.error || 'Lỗi'); }
  };

  const renameUser = async (id: string) => {
    if (!editFullName.trim()) return;
    try {
      await api.put(`/admin/users/${id}/rename`, { fullName: editFullName.trim() });
      setEditUserId(null);
      await loadData();
    } catch { /* ignore */ }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim() || !cUsername.trim()) return;
    setCreating(true);
    setCreateMsg(null);
    try {
      const endpoint = createType === 'TEACHER' ? '/admin/create-teacher' : '/admin/create-student';
      const body: any = { fullName: cName.trim(), username: cUsername.trim(), password: cPassword || 'Demo@123' };
      if (createType === 'STUDENT' && cClassId) body.classId = cClassId;
      const res = await api.post(endpoint, body);
      setCreateMsg({ type: 'ok', text: `✅ ${res.data.message} — Đăng nhập: ${cUsername.trim()} / ${cPassword || 'Demo@123'}` });
      setCName(''); setCUsername(''); setCPassword('Demo@123'); setCClassId('');
      await loadData();
    } catch (err: any) {
      setCreateMsg({ type: 'err', text: err.response?.data?.error || 'Có lỗi xảy ra.' });
    } finally { setCreating(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="text-4xl animate-bounce-gentle">⚙️</div></div>;

  // Filtered users
  const filtered = users.filter(u => {
    const matchSearch = !search || u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">⚙️ Quản Trị Hệ Thống</h1>
        <p className="text-gray-400 text-sm">La Bàn Tuổi Teen – Bảng điều khiển quản trị</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Tổng người dùng', value: stats?.totalUsers, icon: '👥', color: 'from-blue-400 to-cyan-400' },
          { label: 'Học sinh', value: stats?.totalStudents, icon: '🌱', color: 'from-green-400 to-teal-400' },
          { label: 'Giáo viên', value: stats?.totalTeachers, icon: '👩‍🏫', color: 'from-purple-400 to-indigo-400' },
          { label: 'Lớp học', value: stats?.totalClasses, icon: '🏫', color: 'from-orange-400 to-amber-400' },
          { label: 'Nghề nghiệp', value: stats?.totalCareers, icon: '💼', color: 'from-pink-400 to-rose-400' },
          { label: 'Bài đánh giá', value: stats?.totalAssessments, icon: '📝', color: 'from-indigo-400 to-violet-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'overview' as Tab, label: 'Tổng quan', icon: '📊' },
          { id: 'users' as Tab, label: `Quản lý tài khoản (${users.length})`, icon: '👥' },
          { id: 'create' as Tab, label: 'Tạo tài khoản', icon: '➕' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-gray-800 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600'}`}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* === TAB TỔNG QUAN === */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">🏫 Danh sách lớp</h2>
            <div className="space-y-2">
              {classes.map((cls: any) => (
                <div key={cls.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                  <div>
                    <span className="font-semibold text-gray-800">Lớp {cls.name}</span>
                    <span className="text-xs text-gray-400 ml-2">GVCN: {cls.teacher?.fullName}</span>
                  </div>
                  <span className="badge bg-blue-100 text-blue-700 text-xs">👥 {cls._count?.students || 0} HS</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === TAB QUẢN LÝ TÀI KHOẢN === */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-gray-400 focus:outline-none text-sm"
              placeholder="🔍 Tìm theo tên hoặc tên đăng nhập..."
            />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm bg-white">
              <option value="ALL">Tất cả vai trò</option>
              <option value="STUDENT">🌱 Học sinh</option>
              <option value="TEACHER">👩‍🏫 Giáo viên</option>
              <option value="ADMIN">⚙️ Admin</option>
            </select>
          </div>

          <p className="text-xs text-gray-400">Hiển thị {filtered.length}/{users.length} tài khoản</p>

          {/* User list */}
          <div className="space-y-2">
            {filtered.slice(0, 50).map(user => (
              <div key={user.id} className="card py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${user.role === 'ADMIN' ? 'bg-red-100' : user.role === 'TEACHER' ? 'bg-purple-100' : 'bg-green-100'}`}>
                    {user.role === 'ADMIN' ? '⚙️' : user.role === 'TEACHER' ? '👩‍🏫' : '🌱'}
                  </div>
                  <div className="flex-1 min-w-0">
                    {editUserId === user.id ? (
                      <div className="flex gap-2 items-center">
                        <input value={editFullName} onChange={e => setEditFullName(e.target.value)}
                          className="flex-1 px-2 py-1 rounded-lg border-2 border-indigo-300 focus:outline-none text-sm font-semibold" autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') renameUser(user.id); if (e.key === 'Escape') setEditUserId(null); }} />
                        <button onClick={() => renameUser(user.id)} className="text-green-600 text-xs font-bold">✅</button>
                        <button onClick={() => setEditUserId(null)} className="text-gray-400 text-xs font-bold">✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm truncate">{user.fullName}</p>
                        <button onClick={() => { setEditUserId(user.id); setEditFullName(user.fullName); }}
                          className="text-gray-300 hover:text-indigo-500 text-xs transition-colors" title="Sửa tên">✏️</button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-400">@{user.username}</span>
                      {user.className && <span className="badge bg-blue-50 text-blue-600 text-xs">🏫 {user.className}</span>}
                      <span className={`badge text-xs ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : user.role === 'TEACHER' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                        {user.role === 'ADMIN' ? 'Admin' : user.role === 'TEACHER' ? 'GV' : 'HS'}
                      </span>
                      {!user.isActive && <span className="badge bg-red-100 text-red-600 text-xs">Vô hiệu</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => { setPwUserId(pwUserId === user.id ? null : user.id); setNewPw(''); setPwMsg(''); }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${pwUserId === user.id ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600'}`}
                      title="Đổi mật khẩu">🔑</button>
                    {user.role !== 'ADMIN' && (
                      <button onClick={() => toggleUser(user.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${user.isActive ? 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500' : 'bg-green-50 text-green-600'}`}
                        title={user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                        {user.isActive ? '🚫' : '✅'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Password change inline */}
                {pwUserId === user.id && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    <span className="text-xs font-semibold text-amber-700 flex-shrink-0">🔑 Đổi mật khẩu:</span>
                    <input value={newPw} onChange={e => setNewPw(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-amber-200 focus:outline-none text-sm"
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      onKeyDown={e => { if (e.key === 'Enter') changePassword(user.id); }} />
                    <button onClick={() => changePassword(user.id)}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all">Lưu</button>
                    {pwMsg && <span className="text-xs text-amber-700 font-medium">{pwMsg}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === TAB TẠO TÀI KHOẢN === */}
      {activeTab === 'create' && (
        <div className="space-y-4">
          <div className="card border-2 border-gray-200">
            <h2 className="font-bold text-gray-900 mb-4">➕ Tạo tài khoản mới</h2>

            {/* Chọn loại */}
            <div className="flex gap-3 mb-5">
              <button onClick={() => setCreateType('STUDENT')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${createType === 'STUDENT' ? 'bg-green-100 text-green-700 border-2 border-green-300 shadow-sm' : 'bg-gray-100 text-gray-500 border-2 border-transparent'}`}>
                🌱 Học sinh
              </button>
              <button onClick={() => setCreateType('TEACHER')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${createType === 'TEACHER' ? 'bg-purple-100 text-purple-700 border-2 border-purple-300 shadow-sm' : 'bg-gray-100 text-gray-500 border-2 border-transparent'}`}>
                👩‍🏫 Giáo viên
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Họ và tên *</label>
                  <input value={cName} onChange={e => setCName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm"
                    placeholder={createType === 'TEACHER' ? 'Nguyễn Thị Hoa' : 'Trần Văn A'} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Tên đăng nhập *</label>
                  <input value={cUsername} onChange={e => setCUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm"
                    placeholder={createType === 'TEACHER' ? 'nguyenthi.hoa' : '50952999'} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Mật khẩu</label>
                  <input value={cPassword} onChange={e => setCPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm"
                    placeholder="Demo@123" />
                </div>
                {createType === 'STUDENT' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Lớp</label>
                    <select value={cClassId} onChange={e => setCClassId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm bg-white">
                      <option value="">— Chọn lớp —</option>
                      {classes.map((cls: any) => (
                        <option key={cls.id} value={cls.id}>Lớp {cls.name} ({cls._count?.students || 0} HS)</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {createType === 'TEACHER' ? '👩‍🏫 Tài khoản giáo viên mới' : '🌱 Tài khoản học sinh mới'}
                </p>
                <button type="submit" disabled={creating || !cName.trim() || !cUsername.trim()}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-sm font-bold transition-all shadow-md">
                  {creating ? '⏳ Đang tạo...' : '✅ Tạo tài khoản'}
                </button>
              </div>

              {createMsg && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium ${createMsg.type === 'ok' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                  {createMsg.text}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      <div className="h-20 md:h-4"></div>
    </div>
  );
};
