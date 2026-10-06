import React, { useEffect, useState } from 'react';
import api from '../lib/api';

export const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const loadEntries = () => api.get('/journal/my').then(r => setEntries(r.data)).catch(() => {});
  useEffect(() => { loadEntries(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/journal', { title, content, isPrivate });
      await loadEntries();
      setShowForm(false);
      setTitle('');
      setContent('');
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa nhật ký này?')) return;
    await api.delete(`/journal/${id}`);
    await loadEntries();
    setSelected(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">📔 Nhật Ký Cá Nhân</h1>
        <p className="text-emerald-100 text-sm">Không gian riêng để suy nghĩ, chia sẻ và trưởng thành. Mỗi trang là một bước tiến.</p>
      </div>

      <button onClick={() => setShowForm(!showForm)} className="btn-primary w-full">
        {showForm ? '✕ Đóng' : '✏️ Viết nhật ký mới (+20 XP)'}
      </button>

      {showForm && (
        <div className="card border-2 border-teal-200">
          <h3 className="font-bold text-gray-900 mb-4">✏️ Nhật ký hôm nay</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="Tiêu đề (tùy chọn)" />
            <textarea value={content} onChange={e => setContent(e.target.value)} className="input-field resize-none min-h-40" placeholder="Hôm nay bạn muốn chia sẻ điều gì?..." required />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-10 h-6 rounded-full transition-colors ${isPrivate ? 'bg-green-500' : 'bg-gray-300'}`} onClick={() => setIsPrivate(!isPrivate)}>
                  <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${isPrivate ? 'translate-x-5' : 'translate-x-1'}`}></div>
                </div>
                <span className="text-sm text-gray-600">{isPrivate ? '🔒 Chỉ mình tôi' : '👀 Giáo viên thấy'}</span>
              </label>
              <button type="submit" disabled={!content.trim() || submitting} className="btn-primary px-6 py-2 text-sm">
                {submitting ? '⟳' : '💾 Lưu'}
              </button>
            </div>
          </form>
        </div>
      )}

      {entries.length === 0 && !showForm ? (
        <div className="card text-center py-10">
          <div className="text-4xl mb-3">📔</div>
          <p className="text-gray-500 mb-4">Chưa có trang nhật ký nào. Hãy bắt đầu viết nhé!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {entries.map(entry => (
            <button key={entry.id} onClick={() => setSelected(selected?.id === entry.id ? null : entry)} className="card text-left hover:shadow-md transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {entry.title && <h3 className="font-bold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">{entry.title}</h3>}
                  <p className="text-gray-600 text-sm line-clamp-2">{entry.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    <span className="text-xs text-gray-400">{entry.isPrivate ? '🔒' : '👀'}</span>
                  </div>
                </div>
                <span className="text-gray-300 group-hover:text-teal-400 ml-3">▼</span>
              </div>
              {selected?.id === entry.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{entry.content}</p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }} className="text-xs text-red-500 hover:text-red-700 px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                      🗑 Xóa
                    </button>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="h-20 md:h-4"></div>
    </div>
  );
};
