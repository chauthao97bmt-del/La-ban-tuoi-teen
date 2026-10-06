import React, { useState, useEffect, useRef } from 'react';
import api from '../lib/api';

interface Message { role: 'user' | 'assistant'; content: string; timestamp: string; isSafe?: boolean; }

const QUICK_PROMPTS = [
  { emoji: '😰', text: 'Mình đang rất căng thẳng về kỳ thi' },
  { emoji: '💙', text: 'Mình cảm thấy buồn và cô đơn' },
  { emoji: '😤', text: 'Mình hay bị mâu thuẫn với bạn bè' },
  { emoji: '🏠', text: 'Gia đình không hiểu mình' },
  { emoji: '🤔', text: 'Mình không biết mình giỏi gì' },
  { emoji: '🧭', text: 'Mình chưa biết sẽ làm nghề gì' },
  { emoji: '😟', text: 'Mình thiếu tự tin lắm' },
  { emoji: '📚', text: 'Mình hay mất tập trung khi học' },
];

export const LumiPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Xin chào! Mình là **Lumi** 🌱\n\nMình là người bạn đồng hành tâm lý – luôn ở đây để **lắng nghe, thấu hiểu** và đồng hành cùng bạn trên hành trình lớn lên.\n\nDù bạn đang vui, buồn, lo lắng hay chỉ đơn giản là muốn nói chuyện – Lumi luôn sẵn sàng. Không phán xét, không áp lực.\n\n**Hôm nay bạn cảm thấy thế nào?** 😊`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [showPrompts, setShowPrompts] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || loading) return;
    setShowPrompts(false);
    const userMsg: Message = { role: 'user', content: msgText, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const res = await api.post('/lumi/chat', {
        message: msgText,
        sessionId,
        previousMessages: messages.slice(-12)
      });
      const aiMsg: Message = {
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date().toISOString(),
        isSafe: res.data.isSafe
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lumi đang gặp sự cố nhỏ, bạn thử lại sau một lúc nhé! 🔧',
        timestamp: new Date().toISOString()
      }]);
    } finally { setLoading(false); }
  };

  const renderMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-1" />;
      // Bold: **text**
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="mb-1 last:mb-0 leading-relaxed">
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
        </p>
      );
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-2rem)] max-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-4 flex-shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl shadow-inner">🧠</div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></span>
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-lg leading-tight">Lumi – Chuyên Gia Tâm Lý Học Đường</h1>
            <p className="text-xs text-violet-200">Lắng nghe • Thấu hiểu • Đồng hành</p>
          </div>
        </div>
        <div className="mt-3 bg-white/10 rounded-xl p-3 flex gap-2">
          <span className="text-lg flex-shrink-0">💡</span>
          <p className="text-xs text-violet-100 leading-relaxed">
            Lumi hỗ trợ tâm lý học đường dành cho học sinh. Mọi cuộc trò chuyện được bảo mật. Với tình huống khẩn cấp, Lumi sẽ kết nối bạn đến đường dây hỗ trợ ngay.
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center text-base font-medium shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-green-400 to-teal-500 text-white' : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'}`}>
              {msg.role === 'user' ? '😊' : '🧠'}
            </div>

            {/* Bubble */}
            <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-br-sm'
                : msg.isSafe === false
                  ? 'bg-red-50 border-2 border-red-200 text-gray-800 rounded-bl-sm'
                  : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
            }`}>
              {msg.isSafe === false && (
                <div className="flex items-center gap-1.5 mb-2 text-red-600 font-semibold text-xs">
                  <span>🚨</span><span>Hỗ trợ khẩn cấp</span>
                </div>
              )}
              <div className="leading-relaxed">{renderMessage(msg.content)}</div>
              <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-green-100' : 'text-gray-300'}`}>
                {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-base">🧠</div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '160ms' }}></span>
                <span className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '320ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      {showPrompts && (
        <div className="px-4 pb-2 flex-shrink-0 bg-gray-50">
          <p className="text-xs text-gray-400 mb-2 font-medium">💬 Bạn đang quan tâm đến điều gì?</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => sendMessage(p.text)}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-full hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all whitespace-nowrap shadow-sm">
                <span>{p.emoji}</span>
                <span>{p.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pt-3 pb-4 bg-white border-t border-gray-100 flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Nhắn tin cho Lumi... (Enter để gửi, Shift+Enter xuống dòng)"
            className="flex-1 resize-none border-2 border-gray-200 focus:border-violet-400 rounded-2xl px-4 py-3 text-sm focus:outline-none transition-colors leading-relaxed"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center shadow-md hover:shadow-lg transition-all active:scale-95 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-[11px] text-gray-400 text-center mt-2 leading-relaxed">
          🔒 Cuộc trò chuyện được bảo mật · Tổng đài Quốc gia Bảo vệ Trẻ em 📞 <strong>111</strong> (miễn phí)
        </p>
      </div>

      {/* Mobile nav padding */}
      <div className="h-16 md:h-0 flex-shrink-0 bg-white"></div>
    </div>
  );
};
