import React, { useState } from 'react';
import api from '../lib/api';

const EXAMPLES = [
  'Em học kém Toán, tư duy chậm',
  'Em hay xao nhãng, không tập trung',
  'Em nhút nhát, không dám nói trước đám đông',
  'Em rất lười, hay trì hoãn',
  'Em nhạy cảm, dễ khóc',
  'Em hay nói chuyện nhiều',
  'Em bướng bỉnh, không nghe lời',
];

export const FlipProblemPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ weakness: string; flip: string }[]>([]);

  const handleFlip = async (text?: string) => {
    const weakness = (text || input).trim();
    if (!weakness || loading) return;
    setLoading(true);
    setResponse('');
    setInput('');
    try {
      const res = await api.post('/flipai/chat', { weakness });
      const flip = res.data.response;
      setResponse(flip);
      setHistory(prev => [{ weakness, flip }, ...prev.slice(0, 4)]);
    } catch {
      setResponse('Có lỗi xảy ra, bạn thử lại nhé! 🔧');
    } finally {
      setLoading(false);
    }
  };

  const renderResponse = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-2" />;
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="mb-1.5 leading-relaxed">
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-indigo-700">{part}</strong> : part)}
        </p>
      );
    });
  };

  return (
    <div className="animate-fade-in pb-20 space-y-5">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-6 -right-6 text-8xl opacity-10">🔄</div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🔄</div>
            <div>
              <h1 className="font-bold text-xl">AI Lật Ngược Vấn Đề</h1>
              <p className="text-indigo-200 text-xs">Biến điểm yếu thành lợi thế của bạn</p>
            </div>
          </div>
          <p className="text-sm text-indigo-100 leading-relaxed md:max-w-xs">
            Chia sẻ một điểm yếu → AI giúp bạn nhìn theo góc nhìn hoàn toàn mới! 💡
          </p>
        </div>
      </div>

      {/* ── 2-column layout on desktop ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* LEFT: Input + Quick prompts + History */}
        <div className="space-y-5">

          {/* Input card */}
          <div className="card space-y-3">
            <label className="text-sm font-semibold text-gray-700">✍️ Bạn thấy mình có điểm yếu gì?</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFlip(); } }}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm resize-none leading-relaxed"
              placeholder="VD: Em học kém Toán, tư duy chậm..."
              rows={3}
            />
            <button
              onClick={() => handleFlip()}
              disabled={!input.trim() || loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-md disabled:opacity-40 hover:shadow-lg transition-all active:scale-95">
              {loading ? '🔄 Đang lật ngược...' : '🔄 Lật ngược vấn đề!'}
            </button>
          </div>

          {/* Gợi ý nhanh */}
          <div className="card">
            <p className="text-xs text-gray-500 font-semibold mb-3">💡 Thử ngay — bấm để gửi:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => handleFlip(ex)}
                  className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-2 rounded-full hover:bg-indigo-100 transition-all font-medium">
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Lịch sử */}
          {history.length > 1 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4 text-sm">📚 Lần trước bạn đã lật ngược:</h2>
              <div className="space-y-3">
                {history.slice(1).map((h, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                    <p className="text-xs text-red-500 font-medium mb-1">❌ "{h.weakness}"</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{h.flip.substring(0, 120)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-700 text-center leading-relaxed">
              💛 Không có điểm yếu nào là mãi mãi. Mọi đặc điểm đều có hai mặt — hãy tìm mặt sáng của mình!
            </p>
          </div>
        </div>

        {/* RIGHT: Kết quả + Placeholder */}
        <div className="space-y-5">
          {(loading || response) ? (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 min-h-[200px]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-lg">🔄</div>
                <span className="font-bold text-indigo-800">Góc nhìn mới của bạn:</span>
              </div>
              {loading ? (
                <div className="flex gap-1.5 items-center py-4">
                  <span className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '160ms' }} />
                  <span className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '320ms' }} />
                  <span className="ml-2 text-sm text-indigo-600">Đang phân tích điểm yếu của bạn...</span>
                </div>
              ) : (
                <div className="text-sm text-gray-700">{renderResponse(response)}</div>
              )}
            </div>
          ) : (
            /* Placeholder khi chưa có kết quả */
            <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-8 text-center bg-indigo-50/30 min-h-[200px] flex flex-col items-center justify-center">
              <div className="text-5xl mb-4">🔄</div>
              <p className="text-indigo-600 font-semibold text-sm">Góc nhìn mới sẽ hiện ở đây</p>
              <p className="text-indigo-400 text-xs mt-2">Nhập một điểm yếu bên trái và bấm nút lật ngược!</p>
            </div>
          )}

          {/* Vì sao tính năng này hay */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 text-sm">🧠 Tại sao tính năng này hữu ích?</h2>
            <div className="space-y-3">
              {[
                { icon: '🔍', title: 'Tư duy phát triển', desc: 'Khoa học chứng minh: cách ta nhìn nhận điểm yếu quyết định thành công.' },
                { icon: '💼', title: 'Hướng nghiệp thực tế', desc: 'Mỗi điểm yếu ẩn chứa lợi thế trong một lĩnh vực nghề nghiệp cụ thể.' },
                { icon: '💪', title: 'Tự tin hơn mỗi ngày', desc: 'Khi thấy giá trị trong bản thân, bạn dễ vượt qua thách thức hơn.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
