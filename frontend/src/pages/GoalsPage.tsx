import React, { useEffect, useState } from 'react';
import api from '../lib/api';

const CATEGORIES = ['STUDY', 'SKILL', 'HEALTH', 'CAREER', 'SOCIAL', 'PERSONAL'];
const CAT_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  STUDY: { label: 'Học tập', icon: '📚', color: 'bg-blue-100 text-blue-700' },
  SKILL: { label: 'Kỹ năng', icon: '💡', color: 'bg-purple-100 text-purple-700' },
  HEALTH: { label: 'Sức khỏe', icon: '🏃', color: 'bg-green-100 text-green-700' },
  CAREER: { label: 'Hướng nghiệp', icon: '🧭', color: 'bg-orange-100 text-orange-700' },
  SOCIAL: { label: 'Kết nối', icon: '🤝', color: 'bg-pink-100 text-pink-700' },
  PERSONAL: { label: 'Cá nhân', icon: '⭐', color: 'bg-yellow-100 text-yellow-700' },
};

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'STUDY', title: '', description: '', targetValue: '', currentValue: '', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ACTIVE');

  const loadGoals = () => api.get('/goals/my').then(r => setGoals(r.data)).catch(() => {});
  useEffect(() => { loadGoals(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/goals', form);
      await loadGoals();
      setShowForm(false);
      setForm({ category: 'STUDY', title: '', description: '', targetValue: '', currentValue: '', dueDate: '' });
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await api.put(`/goals/${id}`, { status });
    await loadGoals();
  };

  const filtered = goals.filter(g => g.status === activeFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">🎯 Mục Tiêu Của Tôi</h1>
        <p className="text-orange-100 text-sm">Đặt mục tiêu rõ ràng, theo dõi tiến độ và đạt được ước mơ</p>
        <div className="mt-4 flex gap-4">
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-bold">{goals.filter(g => g.status === 'ACTIVE').length}</div>
            <div className="text-xs text-orange-100">Đang thực hiện</div>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-bold">{goals.filter(g => g.status === 'COMPLETED').length}</div>
            <div className="text-xs text-orange-100">Hoàn thành</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['ACTIVE', 'COMPLETED', 'PAUSED'].map(status => (
          <button key={status} onClick={() => setActiveFilter(status)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === status ? 'bg-orange-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {status === 'ACTIVE' ? '🔥 Đang thực hiện' : status === 'COMPLETED' ? '✅ Hoàn thành' : '⏸ Tạm dừng'}
          </button>
        ))}
      </div>

      {/* Goals List */}
      {filtered.length === 0 ? (
        <div className="card text-center py-10">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-gray-500">{activeFilter === 'ACTIVE' ? 'Chưa có mục tiêu nào. Hãy thêm mục tiêu đầu tiên!' : 'Chưa có mục tiêu trong danh sách này.'}</p>
          {activeFilter === 'ACTIVE' && (
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4">+ Thêm mục tiêu</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(goal => {
            const cat = CAT_LABELS[goal.category] || CAT_LABELS.PERSONAL;
            const hasProgress = goal.targetValue && goal.currentValue;
            const pct = hasProgress ? Math.min((parseFloat(goal.currentValue) / parseFloat(goal.targetValue)) * 100, 100) : 0;
            return (
              <div key={goal.id} className="card">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <span className={`badge ${cat.color} text-xs`}>{cat.label}</span>
                  </div>
                  {goal.status === 'ACTIVE' && (
                    <button onClick={() => handleUpdateStatus(goal.id, 'COMPLETED')}
                      className="text-xs text-green-600 hover:text-green-700 font-medium border border-green-300 px-3 py-1 rounded-full hover:bg-green-50">
                      ✓ Đánh dấu hoàn thành
                    </button>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{goal.title}</h3>
                {goal.description && <p className="text-sm text-gray-500 mb-2">{goal.description}</p>}
                {hasProgress && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Hiện tại: {goal.currentValue}</span>
                      <span>Mục tiêu: {goal.targetValue}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-orange-400 rounded-full h-2 progress-bar" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                )}
                {goal.dueDate && (
                  <p className="text-xs text-gray-400 mt-2">📅 Hạn: {new Date(goal.dueDate).toLocaleDateString('vi-VN')}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Button */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="btn-primary w-full">
          + Thêm mục tiêu mới
        </button>
      )}

      {/* Goal Form */}
      {showForm && (
        <div className="card border-2 border-orange-200">
          <h3 className="font-bold text-gray-900 mb-4">✏️ Tạo mục tiêu mới</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Loại mục tiêu</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => {
                  const c = CAT_LABELS[cat];
                  return (
                    <button type="button" key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-sm transition-all ${form.category === cat ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                      <span>{c.icon}</span>
                      <span className="text-xs">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tên mục tiêu *</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="VD: Cải thiện điểm Toán lên 8.5" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Mô tả chi tiết</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field resize-none" rows={2} placeholder="Kế hoạch cụ thể?" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Giá trị hiện tại</label>
                <input type="text" value={form.currentValue} onChange={e => setForm(f => ({ ...f, currentValue: e.target.value }))} className="input-field" placeholder="VD: 7.0" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Giá trị mục tiêu</label>
                <input type="text" value={form.targetValue} onChange={e => setForm(f => ({ ...f, targetValue: e.target.value }))} className="input-field" placeholder="VD: 8.5" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Hạn chót (tùy chọn)</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input-field" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Hủy</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? '⟳ Đang lưu...' : '🎯 Thêm mục tiêu'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="h-20 md:h-4"></div>
    </div>
  );
};
