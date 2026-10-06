import React, { useEffect, useState } from 'react';
import api from '../lib/api';

const EMOTIONS = [
  { key: 'ANXIOUS', label: 'Lo lắng', emoji: '😰', color: 'border-orange-300 bg-orange-50' },
  { key: 'SAD', label: 'Buồn', emoji: '😢', color: 'border-purple-300 bg-purple-50' },
  { key: 'ANGRY', label: 'Tức giận', emoji: '😤', color: 'border-red-300 bg-red-50' },
  { key: 'NEUTRAL', label: 'Khó nói', emoji: '🤔', color: 'border-gray-300 bg-gray-50' },
  { key: 'URGENT', label: 'Cần giúp đỡ ngay', emoji: '🆘', color: 'border-red-400 bg-red-100' },
];

export const SupportPage: React.FC = () => {
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState('');
  const [visibility, setVisibility] = useState<'PRIVATE' | 'TEACHER'>('PRIVATE');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadRequests = () => api.get('/support/my').then(r => setMyRequests(r.data)).catch(() => {});
  useEffect(() => { loadRequests(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !emotion) return;
    setSubmitting(true);
    try {
      await api.post('/support', {
        content,
        emotion,
        visibility: emotion === 'URGENT' ? 'URGENT' : visibility,
      });
      setSubmitted(true);
      setContent('');
      setEmotion('');
      await loadRequests();
      setTimeout(() => { setSubmitted(false); setShowForm(false); }, 3000);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-400 to-pink-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">💙 Góc Tâm Sự</h1>
        <p className="text-rose-100 text-sm">Đây là nơi an toàn để bạn chia sẻ. Giáo viên của bạn luôn lắng nghe.</p>
      </div>

      {/* Emergency Button */}
      <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 text-center">
        <p className="font-bold text-red-800 text-lg mb-1">🆘 Cần được giúp đỡ ngay?</p>
        <p className="text-red-600 text-sm mb-4">Nếu bạn đang trong tình huống nguy hiểm hoặc có ý định tự làm hại bản thân — hãy nói với người lớn ngay bây giờ.</p>
        <button
          onClick={() => { setEmotion('URGENT'); setVisibility('TEACHER'); setShowForm(true); document.getElementById('support-form')?.scrollIntoView({ behavior: 'smooth' }); }}
          className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95"
        >
          🆘 Mình Cần Người Lớn Giúp Đỡ Ngay
        </button>
        <p className="text-xs text-red-400 mt-3">Tin nhắn khẩn cấp sẽ được gửi ngay cho giáo viên của bạn</p>
      </div>

      {/* Share Button */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="btn-primary w-full flex items-center justify-center gap-2">
          <span>💬</span>
          <span>Chia sẻ điều đang làm bạn băn khoăn</span>
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div id="support-form" className="card border-2 border-rose-200 animate-slide-up">
          {submitted ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">💙</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Đã gửi thành công!</h3>
              <p className="text-gray-600 text-sm">
                {emotion === 'URGENT' ? '🚨 Giáo viên đã được thông báo và sẽ liên hệ với bạn sớm nhất.' : 'Giáo viên sẽ đọc và phản hồi sớm nhé. Bạn không đơn độc! 💙'}
              </p>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-gray-900 mb-4">✍️ Chia sẻ với giáo viên</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Bạn đang cảm thấy thế nào? *</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {EMOTIONS.map(em => (
                      <button type="button" key={em.key}
                        onClick={() => setEmotion(em.key)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${emotion === em.key ? em.color + ' shadow-md scale-105' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                        <span className="text-xl flex-shrink-0">{em.emoji}</span>
                        <span className="text-sm font-medium text-gray-700">{em.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Bạn muốn chia sẻ gì? *</label>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="input-field resize-none min-h-32"
                    placeholder="Viết ra những điều đang làm bạn khó chịu, lo lắng, hay băn khoăn... Đây là nơi an toàn."
                    required
                  />
                </div>

                {emotion && emotion !== 'URGENT' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Ai có thể đọc?</label>
                    <div className="flex gap-3">
                      {[
                        { v: 'PRIVATE', label: '🔒 Chỉ mình tôi', desc: 'Giáo viên không thấy' },
                        { v: 'TEACHER', label: '👩‍🏫 Gửi cho giáo viên', desc: 'Giáo viên sẽ phản hồi' },
                      ].map(opt => (
                        <button type="button" key={opt.v}
                          onClick={() => setVisibility(opt.v as 'PRIVATE' | 'TEACHER')}
                          className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${visibility === opt.v ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                          <div className="font-medium text-sm text-gray-800">{opt.label}</div>
                          <div className="text-xs text-gray-500">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Hủy</button>
                  <button type="submit" disabled={!content.trim() || !emotion || submitting} className="btn-primary flex-1">
                    {submitting ? '⟳ Đang gửi...' : '💙 Gửi chia sẻ'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {/* History */}
      {myRequests.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-gray-900">📜 Lịch sử chia sẻ</h2>
          {myRequests.map(req => {
            const em = EMOTIONS.find(e => e.key === req.emotion) || EMOTIONS[3];
            return (
              <div key={req.id} className={`rounded-xl border-2 p-4 ${em.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{em.emoji}</span>
                    <span className="font-semibold text-gray-800 text-sm">{em.label}</span>
                  </div>
                  <span className={`badge text-xs ${req.status === 'RESPONDED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {req.status === 'RESPONDED' ? '✅ Đã phản hồi' : '⏳ Chờ phản hồi'}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{req.content}</p>
                {req.teacherResponse && (
                  <div className="mt-3 bg-white/70 rounded-xl p-3 border border-white">
                    <p className="text-xs font-semibold text-blue-700 mb-1">💬 Giáo viên phản hồi:</p>
                    <p className="text-sm text-gray-800">{req.teacherResponse}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">{new Date(req.createdAt).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="h-20 md:h-4"></div>
    </div>
  );
};
