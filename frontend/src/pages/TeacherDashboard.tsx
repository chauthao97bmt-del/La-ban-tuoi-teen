import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../lib/api';
import { TalkInbox } from '../components/TalkInbox';

type Tab = 'overview' | 'students' | 'inbox' | 'stats';
const tabFromPath = (p: string): Tab =>
  p.includes('/support') || p.includes('/inbox') ? 'inbox'
  : p.includes('/students') ? 'students'
  : p.includes('/statistics') ? 'stats'
  : 'overview';

export const TeacherDashboard: React.FC = () => {
  const location = useLocation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(tabFromPath(location.pathname));
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { setActiveTab(tabFromPath(location.pathname)); }, [location.pathname]);

  // Student management state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentUsername, setNewStudentUsername] = useState('');
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [emotionHistoryStudent, setEmotionHistoryStudent] = useState<any | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/teacher/overview'),
      api.get('/teacher/students'),
      api.get('/teacher/statistics'),
    ]).then(([ov, st, stats]) => {
      setData(ov.data);
      setStudents(st.data);
      setStats(stats.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // ─── Student management handlers ───
  const reloadStudents = async () => {
    const res = await api.get('/teacher/students');
    setStudents(res.data);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentUsername.trim()) return;
    setCreating(true);
    setCreateMsg(null);
    try {
      const res = await api.post('/teacher/students/create', {
        fullName: newStudentName.trim(),
        username: newStudentUsername.trim(),
      });
      setCreateMsg({ type: 'ok', text: `✅ ${res.data.message} — Đăng nhập: ${res.data.student.username} / Demo@123` });
      setNewStudentName('');
      setNewStudentUsername('');
      await reloadStudents();
    } catch (err: any) {
      setCreateMsg({ type: 'err', text: err.response?.data?.error || 'Có lỗi xảy ra.' });
    } finally {
      setCreating(false);
    }
  };

  const getNegScore = (chks) => chks?.filter(c=>['SAD','ANXIOUS','ANGRY'].includes(c.weather)).length||0; const getCardStyle = (s) => { if(s>=3) return 'border-red-500 bg-red-100 shadow-md'; if(s===2) return 'border-red-300 bg-red-50'; if(s===1) return 'border-orange-200 bg-orange-50'; return 'border-gray-100 bg-white'; };

  const handleEditStudent = async (studentId: string) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await api.put(`/teacher/students/${studentId}/update`, { fullName: editName.trim() });
      setEditingStudentId(null);
      setEditName('');
      await reloadStudents();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="text-4xl animate-bounce-gentle">👩‍🏫</div></div>;

  const overview = data;
  const cls = overview?.classes?.[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Trang Giáo Viên 👩‍🏫</h1>
        <p className="text-indigo-100 text-sm">Chào, {overview?.teacher?.fullName}! Hôm nay lớp bạn có gì mới?</p>
        {cls && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[
              { label: 'Học sinh', value: cls.stats?.totalStudents },
              { label: 'Có đánh giá', value: cls.stats?.studentsWithAssessments },
              { label: 'Khám phá nghề', value: cls.stats?.studentsWithCareers },
              { label: 'XP trung bình', value: cls.stats?.avgXp },
            ].map((s, i) => (
              <div key={i} className="bg-white/20 rounded-xl p-2 text-center">
                <div className="font-bold text-lg">{s.value}</div>
                <div className="text-xs text-indigo-100">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Tổng quan', icon: '📊' },
          { id: 'students', label: 'Học sinh', icon: '👥' },
          { id: 'inbox', label: 'Tin nhắn HS', icon: '💬' },
          { id: 'stats', label: 'Thống kê', icon: '📈' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600'}`}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && cls && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">🏫 Lớp {cls.name}</h2>
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-blue-100 text-blue-700">📋 Mã: {cls.classCode}</span>
              <span className="badge bg-green-100 text-green-700">👥 {cls.stats?.totalStudents} học sinh</span>
              <span className="badge bg-purple-100 text-purple-700">📊 {cls.stats?.studentsWithAssessments} đã làm đánh giá</span>
            </div>
          </div>
          {overview?.classes?.length > 0 && overview.classes[0]?.announcements?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-3">📢 Thông báo gần đây</h3>
              <div className="space-y-2">
                {overview.classes[0].announcements?.slice(0, 3).map((ann: any) => (
                  <div key={ann.id} className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="font-medium text-blue-800 text-sm">{ann.title}</p>
                    <p className="text-xs text-blue-500 mt-0.5">{new Date(ann.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Nút tạo học sinh */}
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">👥 Danh sách học sinh ({students.length})</h2>
            <button
              onClick={() => { setShowCreateForm(!showCreateForm); setCreateMsg(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${showCreateForm ? 'bg-gray-200 text-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'}`}>
              {showCreateForm ? '✕ Đóng' : '➕ Thêm học sinh'}
            </button>
          </div>

          {/* Form tạo học sinh */}
          {showCreateForm && (
            <form onSubmit={handleCreateStudent} className="card border-2 border-indigo-200 bg-indigo-50 space-y-3">
              <h3 className="font-bold text-indigo-800 text-sm">➕ Tạo tài khoản học sinh mới</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Họ và tên</label>
                  <input
                    value={newStudentName}
                    onChange={e => setNewStudentName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Tên đăng nhập (mã HS)</label>
                  <input
                    value={newStudentUsername}
                    onChange={e => setNewStudentUsername(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm"
                    placeholder="50952999"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-gray-400">🔒 Mật khẩu mặc định: Demo@123</p>
                <button
                  type="submit"
                  disabled={creating || !newStudentName.trim() || !newStudentUsername.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-sm font-bold transition-all">
                  {creating ? '⏳ Đang tạo...' : '✅ Tạo tài khoản'}
                </button>
              </div>
              {createMsg && (
                <div className={`rounded-xl px-4 py-2.5 text-sm font-medium ${createMsg.type === 'ok' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                  {createMsg.text}
                </div>
              )}
            </form>
          )}

          {/* Danh sách học sinh */}
          {students.map(student => (
            <div key={student.id} className={"card transition-colors " + getCardStyle(getNegScore(student.emotionCheckins))}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-xl flex-shrink-0">
                    {student.avatar || '🌱'}
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingStudentId === student.id ? (
                      /* Mode chỉnh sửa */
                      <div className="flex gap-2 items-center">
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:outline-none text-sm font-semibold bg-white min-w-0"
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') handleEditStudent(student.id); if (e.key === 'Escape') setEditingStudentId(null); }}
                        />
                        <button onClick={() => handleEditStudent(student.id)} disabled={saving || !editName.trim()}
                          className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-xs font-bold transition-all flex-shrink-0">
                          {saving ? '⏳' : '✅'}
                        </button>
                        <button onClick={() => setEditingStudentId(null)}
                          className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs font-bold transition-all flex-shrink-0">
                          ✕
                        </button>
                      </div>
                    ) : (
                      /* Mode xem */
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm truncate">{student.fullName}</p>
                        <button
                          onClick={() => { setEditingStudentId(student.id); setEditName(student.fullName); }}
                          className="flex-shrink-0 w-6 h-6 rounded-md bg-white/50 hover:bg-white flex items-center justify-center text-xs text-gray-500 hover:text-indigo-600 transition-colors shadow-sm"
                          title="Sửa tên">
                          ✏️
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="badge bg-white/60 text-gray-700 text-xs shadow-sm">⭐ {student.profile?.xp || 0} XP</span>
                      <span className="badge bg-white/60 text-gray-700 text-xs shadow-sm">📝 {student.assessments?.length || 0} bài</span>
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right flex-shrink-0 relative mt-2 sm:mt-0 bg-white/40 p-2 rounded-xl sm:bg-transparent sm:p-0 sm:rounded-none">
                  <div className="text-xs font-medium text-gray-600 mb-1">Cảm xúc 7 ngày</div>
                  <button 
                    onClick={() => setEmotionHistoryStudent(student)}
                    className="flex items-center sm:justify-end gap-1 bg-white/80 sm:bg-white/60 hover:bg-white p-1.5 rounded-xl cursor-pointer transition-colors shadow-sm border border-black/5 w-full sm:w-auto overflow-x-auto"
                    title="Bấm để xem chi tiết"
                  >
                    {student.emotionCheckins && student.emotionCheckins.length > 0 ? (
                      student.emotionCheckins.slice().reverse().map((chk: any, idx: number) => (
                        <span key={idx} className="text-lg">
                          {['HAPPY', 'CALM', 'NEUTRAL', 'SAD', 'ANXIOUS', 'ANGRY'].includes(chk.weather) 
                            ? ['😄', '😊', '😐', '😔', '😰', '😤'][['HAPPY', 'CALM', 'NEUTRAL', 'SAD', 'ANXIOUS', 'ANGRY'].indexOf(chk.weather)] 
                            : '❓'}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs px-2">Chưa có</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Tổng học sinh', value: stats.totalStudents, icon: '👥' },
              { label: 'Đã làm đánh giá', value: stats.studentsWithAssessments, icon: '📝' },
              { label: 'Khám phá nghề', value: stats.studentsWithCareerExploration, icon: '💼' },
            ].map((s, i) => (
              <div key={i} className="card text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          {stats.topCareers?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-3">🏆 Lĩnh vực nghề nghiệp được quan tâm</h3>
              <div className="space-y-2">
                {stats.topCareers.map(([name, count]: [string, number]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 flex-1">{name}</span>
                    <div className="w-32 bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-500 rounded-full h-2" style={{ width: `${Math.min((count / stats.totalStudents) * 100, 100)}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500 w-6">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(stats.moodDistribution || {}).length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-3">😊 Phân bố cảm xúc của lớp (7 ngày)</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.moodDistribution).map(([mood, count]) => {
                  const emojis: Record<string, string> = { GREAT: '😄', GOOD: '😊', NEUTRAL: '😐', SAD: '😢', ANXIOUS: '😰', ANGRY: '😤' };
                  return (
                    <div key={mood} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                      <span className="text-xl">{emojis[mood] || '😐'}</span>
                      <span className="font-bold text-gray-800">{count as number}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === TAB TIN NHẮN TÂM SỰ CỦA HỌC SINH === */}
      {activeTab === 'inbox' && <TalkInbox mode="teacher" />}

      <div className="h-20 md:h-4"></div>

      {emotionHistoryStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={() => setEmotionHistoryStudent(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-fade-in shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Cảm xúc của {emotionHistoryStudent.fullName}</h3>
              <button onClick={() => setEmotionHistoryStudent(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2">&times;</button>
            </div>
            <div className="p-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
              {emotionHistoryStudent.emotionCheckins && emotionHistoryStudent.emotionCheckins.length > 0 ? (
                emotionHistoryStudent.emotionCheckins.map((chk: any) => (
                  <div key={chk.id} className="flex justify-between items-center border border-gray-100 p-3 rounded-xl shadow-sm bg-white">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-700">{new Date(chk.checkinDate).toLocaleDateString('vi-VN')}</span>
                      {chk.note && <span className="text-xs text-gray-500 italic mt-1 max-w-[200px] truncate">{chk.note}</span>}
                    </div>
                    <div className="text-3xl bg-gray-50 rounded-full w-12 h-12 flex items-center justify-center border border-gray-100 shadow-inner">
                      {['HAPPY', 'CALM', 'NEUTRAL', 'SAD', 'ANXIOUS', 'ANGRY'].includes(chk.weather) 
                        ? ['😄', '😊', '😐', '😔', '😰', '😤'][['HAPPY', 'CALM', 'NEUTRAL', 'SAD', 'ANXIOUS', 'ANGRY'].indexOf(chk.weather)] 
                        : '❓'}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">Học sinh chưa điểm danh cảm xúc nào.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SupportRequestCard: React.FC<{ req: any; onRespond: (id: string, response: string) => void }> = ({ req, onRespond }) => {
  const [responding, setResponding] = useState(false);
  const [responseText, setResponseText] = useState('');

  const moodMap: Record<string, string> = { URGENT: '⚠️ KHẨN CẤP', ANXIOUS: '😰 Lo lắng', SAD: '😢 Buồn', ANGRY: '😤 Tức giận', NEUTRAL: '😐 Bình thường' };
  const urgentClass = req.visibility === 'URGENT' ? 'border-red-300 bg-red-50' : 'border-gray-200';

  return (
    <div className={`card border-2 ${urgentClass}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`badge ${req.visibility === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {moodMap[req.emotion] || req.emotion}
        </span>
        <span className="badge bg-gray-100 text-gray-600 text-xs">
          {req.status === 'RESPONDED' ? '✅ Đã trả lời' : '⏳ Chờ phản hồi'}
        </span>
      </div>
      <p className="text-gray-700 text-sm mb-2">"{req.content}"</p>
      <p className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleString('vi-VN')}</p>

      {req.status !== 'RESPONDED' && (
        <>
          {!responding ? (
            <button onClick={() => setResponding(true)} className="mt-3 text-sm text-indigo-600 font-medium hover:text-indigo-700">💬 Phản hồi học sinh →</button>
          ) : (
            <div className="mt-3 space-y-2">
              <textarea value={responseText} onChange={e => setResponseText(e.target.value)} className="input-field resize-none text-sm" rows={3} placeholder="Nhập phản hồi của bạn..." />
              <div className="flex gap-2">
                <button onClick={() => setResponding(false)} className="btn-secondary flex-1 py-2 text-sm">Hủy</button>
                <button onClick={() => { onRespond(req.id, responseText); setResponding(false); }} disabled={!responseText.trim()} className="btn-primary flex-1 py-2 text-sm">Gửi phản hồi</button>
              </div>
            </div>
          )}
        </>
      )}
      {req.teacherResponse && (
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs font-medium text-blue-600 mb-1">Phản hồi của bạn:</p>
          <p className="text-sm text-blue-800">{req.teacherResponse}</p>
        </div>
      )}
    </div>
  );
};
