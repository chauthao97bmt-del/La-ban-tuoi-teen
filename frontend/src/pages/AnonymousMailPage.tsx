import React, { useEffect, useState } from 'react';
import api from '../lib/api';

const CATEGORIES = [
  { key: 'GENERAL', label: '💌 Điều em muốn nói', desc: 'Điều gì đó em muốn cô biết nhưng chưa dám nói trực tiếp' },
  { key: 'EMOTION', label: '😔 Cảm xúc', desc: 'Cảm xúc, tâm trạng, những điều đang làm em khó chịu' },
  { key: 'STUDY', label: '📚 Học tập', desc: 'Khó khăn trong học tập, bài vở, áp lực điểm số' },
  { key: 'FRIEND', label: '👫 Bạn bè', desc: 'Chuyện bạn bè, nhóm bạn, xung đột, cô đơn' },
  { key: 'FAMILY', label: '🏠 Gia đình', desc: 'Chuyện ở nhà, ba mẹ, anh chị em' },
  { key: 'OTHER', label: '✨ Khác', desc: 'Góp ý cho lớp, đề xuất, hoặc bất cứ điều gì khác' },
];

const PROMPTS = [
  'Điều em lo lắng nhất trong học kỳ này là…',
  'Em ước gì cô có thể biết rằng…',
  'Trong lớp, em cảm thấy…',
  'Dạo này em đang gặp khó khăn với…',
  'Em muốn lớp mình thay đổi…',
  'Điều em không dám nói với ai là…',
];

export const AnonymousMailPage: React.FC = () => {
  const [tab, setTab] = useState<'write' | 'replies'>('write');
  const [category, setCategory] = useState('GENERAL');
  const [content, setContent] = useState('');
  const [allowReply, setAllowReply] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  useEffect(() => {
    if (tab === 'replies') {
      setLoadingReplies(true);
      api.get('/anonymous/my-replies')
        .then(r => setReplies(r.data))
        .catch(() => {})
        .finally(() => setLoadingReplies(false));
    }
  }, [tab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 5) return;
    setSubmitting(true);
    try {
      const res = await api.post('/anonymous', { content, category, allowReply });
      setSent(res.data.message);
      setContent('');
      setAllowReply(false);
      setCategory('GENERAL');
    } catch (err: any) {
      setSent(err.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 text-8xl opacity-10 -mr-4 -mt-4">💌</div>
        <h1 className="text-2xl font-bold mb-1">💌 Hộp Thư Không Tên</h1>
        <p className="text-purple-100 text-sm leading-relaxed">
          "Điều em muốn nói với cô nhưng chưa dám nói…"
        </p>
        <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2 text-xs">
          <span>🔒</span>
          <span>Danh tính của bạn được bảo mật tuyệt đối. Giáo viên chỉ biết thư đến từ lớp, không biết ai gửi.</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
        <button onClick={() => setTab('write')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === 'write' ? 'bg-white shadow-sm text-violet-700' : 'text-gray-500'}`}>
          ✏️ Viết thư
        </button>
        <button onClick={() => setTab('replies')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === 'replies' ? 'bg-white shadow-sm text-violet-700' : 'text-gray-500'}`}>
          📬 Phản hồi từ cô
        </button>
      </div>

      {/* === TAB VIẾT THƯ === */}
      {tab === 'write' && (
        <>
          {sent ? (
            <div className="card text-center py-10 border-2 border-violet-200 animate-fade-in">
              <div className="text-6xl mb-4">💌</div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Thư đã được gửi!</h2>
              <p className="text-gray-600 text-sm max-w-xs mx-auto leading-relaxed">{sent}</p>
              <button onClick={() => setSent(null)} className="mt-6 btn-primary bg-violet-600 hover:bg-violet-700">
                ✏️ Viết thêm một thư khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Gợi ý */}
              <div className="card border-violet-100 bg-violet-50">
                <p className="text-xs font-semibold text-violet-600 mb-2 uppercase tracking-wide">💡 Gợi ý bắt đầu</p>
                <div className="flex flex-wrap gap-2">
                  {PROMPTS.map((p, i) => (
                    <button type="button" key={i}
                      onClick={() => setContent(prev => prev ? prev + ' ' + p : p)}
                      className="text-xs px-3 py-1.5 bg-white border border-violet-200 rounded-full text-violet-700 hover:bg-violet-100 transition-colors text-left">
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chủ đề */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">📌 Chủ đề</label>
                <div className="grid gap-2">
                  {CATEGORIES.map(cat => (
                    <button type="button" key={cat.key}
                      onClick={() => setCategory(cat.key)}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${category === cat.key ? 'border-violet-400 bg-violet-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <span className="text-xl flex-shrink-0">{cat.label.split(' ')[0]}</span>
                      <div>
                        <div className="font-semibold text-sm text-gray-800">{cat.label.split(' ').slice(1).join(' ')}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{cat.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nội dung */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">💬 Nội dung thư</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:outline-none resize-none text-sm text-gray-800 placeholder-gray-300 transition-colors"
                  placeholder="Viết bất cứ điều gì bạn muốn nói… Không ai biết đây là của bạn."
                  required
                  minLength={5}
                />
                <div className={`text-right text-xs mt-1 ${content.length > 500 ? 'text-red-400' : 'text-gray-400'}`}>
                  {content.length}/500
                </div>
              </div>

              {/* Cho phép phản hồi */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Cho phép giáo viên phản hồi ẩn danh?</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {allowReply
                        ? '✅ Giáo viên sẽ trả lời và bạn thấy phản hồi trong tab "Phản hồi từ cô" mà không ai biết thư đó của bạn.'
                        : '🔒 Giáo viên chỉ đọc, không phản hồi. Bí mật tuyệt đối.'}
                    </p>
                  </div>
                  <div
                    onClick={() => setAllowReply(!allowReply)}
                    className={`flex-shrink-0 w-12 h-6 rounded-full cursor-pointer transition-colors relative ${allowReply ? 'bg-violet-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${allowReply ? 'translate-x-7' : 'translate-x-1'}`}></div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!content.trim() || content.trim().length < 5 || submitting || content.length > 500}
                className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 text-white font-bold text-sm transition-all active:scale-95 shadow-lg disabled:shadow-none">
                {submitting ? '⟳ Đang gửi...' : '💌 Gửi thư ẩn danh'}
              </button>

              <p className="text-center text-xs text-gray-400">
                🛡️ Hệ thống không lưu tên của bạn. Danh tính được bảo mật tuyệt đối.
              </p>
            </form>
          )}
        </>
      )}

      {/* === TAB PHẢN HỒI === */}
      {tab === 'replies' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-700">
            <p className="font-semibold mb-1">📬 Về tab này</p>
            <p>Đây là nơi hiển thị các phản hồi ẩn danh của giáo viên cho toàn bộ lớp (đối với những thư có cho phép phản hồi). Không ai biết thư nào là của bạn.</p>
          </div>

          {loadingReplies ? (
            <div className="flex justify-center py-10">
              <div className="text-4xl animate-bounce">💌</div>
            </div>
          ) : replies.length === 0 ? (
            <div className="card text-center py-10">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500 font-medium">Chưa có phản hồi nào</p>
              <p className="text-gray-400 text-sm mt-1">Khi gửi thư, hãy bật "Cho phép phản hồi" để nhận câu trả lời từ cô nhé!</p>
            </div>
          ) : (
            replies.map(letter => (
              <div key={letter.id} className="card border-violet-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="badge bg-violet-100 text-violet-700 text-xs">{letter.categoryLabel}</span>
                  <span className="text-xs text-gray-400">{new Date(letter.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                  <p className="text-xs font-semibold text-purple-500 mb-1">💌 Nội dung thư (ẩn danh)</p>
                  <p className="text-sm text-gray-700 italic">"{letter.content}"</p>
                </div>
                {letter.teacherResponse && (
                  <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                    <p className="text-xs font-semibold text-green-600 mb-1">👩‍🏫 Cô giáo phản hồi:</p>
                    <p className="text-sm text-gray-800">{letter.teacherResponse}</p>
                    <p className="text-xs text-gray-400 mt-2">{letter.respondedAt ? new Date(letter.respondedAt).toLocaleDateString('vi-VN') : ''}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <div className="h-20 md:h-4"></div>
    </div>
  );
};
