import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const EMOTION_MAP: Record<string, { emoji: string; label: string }> = {
  HAPPY:   { emoji: '😄', label: 'Vui vẻ' },
  CALM:    { emoji: '😊', label: 'Bình thường' },
  NEUTRAL: { emoji: '😐', label: 'Mơ hồ' },
  SAD:     { emoji: '😔', label: 'Buồn' },
  ANXIOUS: { emoji: '😰', label: 'Lo lắng' },
  ANGRY:   { emoji: '😤', label: 'Bực bội' },
};

interface Conversation {
  id: string;
  isAnonymous: boolean;
  anonTag?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: { senderRole: string; content: string; createdAt: string }[];
  teacher?: { fullName: string };
}

export const TalkTeacherPage: React.FC = () => {
  const [tab, setTab] = useState<'list' | 'new' | 'chat'>('list');
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [firstMsg, setFirstMsg] = useState('');
  const [replyMsg, setReplyMsg] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConvs = async () => {
    try {
      const res = await api.get('/talk/teacher/conversations');
      setConvs(res.data);
    } catch {}
    setLoading(false);
  };

  const loadConv = async (id: string) => {
    const res = await api.get(`/talk/teacher/conversation/${id}`);
    setActiveConv(res.data);
    setTab('chat');
    window.dispatchEvent(new Event('refreshUnread'));
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  useEffect(() => { loadConvs(); }, []);
  useEffect(() => { if (activeConv) bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeConv]);

  const handleStart = async () => {
    if (!firstMsg.trim() || sending) return;
    setSending(true);
    try {
      const res = await api.post('/talk/teacher/start', { isAnonymous, firstMessage: firstMsg });
      setConvs(prev => [res.data, ...prev]);
      await loadConv(res.data.id);
      setFirstMsg('');
    } catch { alert('Lỗi khi gửi tin. Vui lòng thử lại.'); }
    setSending(false);
  };

  const handleReply = async () => {
    if (!replyMsg.trim() || !activeConv || sending) return;
    setSending(true);
    try {
      const res = await api.post(`/talk/teacher/conversation/${activeConv.id}/reply`, { content: replyMsg });
      setActiveConv(res.data);
      setReplyMsg('');
    } catch {}
    setSending(false);
  };

  return (
    <div className="animate-fade-in pb-20 space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-4 -right-4 text-8xl opacity-10">💬</div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">💬</div>
            <div>
              <h1 className="font-bold text-xl">Tâm Sự với GVCN</h1>
              <p className="text-green-100 text-xs">Ẩn danh hoặc để lộ thông tin</p>
            </div>
          </div>
          <p className="text-sm text-green-100 leading-relaxed">
            Chia sẻ điều bạn muốn nói với giáo viên chủ nhiệm. Cô/thầy sẽ lắng nghe và trả lời bạn.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'list', label: '📋 Cuộc trò chuyện' },
          { key: 'new', label: '✉️ Nhắn tin mới' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key || (tab === 'chat' && t.key === 'list')
                ? 'bg-green-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Chat view */}
      {tab === 'chat' && activeConv && (
        <div className="card flex flex-col" style={{ minHeight: 400 }}>
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
            <button onClick={() => setTab('list')} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-lg">👩‍🏫</div>
            <div>
              <p className="font-bold text-sm text-gray-900">{activeConv.teacher?.fullName || 'GVCN'}</p>
              <p className="text-xs text-gray-400">{activeConv.isAnonymous ? `Ẩn danh (${activeConv.anonTag})` : 'Có thông tin'}</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-80 mb-4">
            {activeConv.messages?.map((m: any, i: number) => (
              <div key={i} className={`flex ${m.senderRole === 'STUDENT' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.senderRole === 'STUDENT'
                    ? 'bg-green-500 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {m.senderRole === 'TEACHER' && <p className="text-xs font-semibold text-gray-500 mb-1">GVCN</p>}
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-2">
            <input value={replyMsg} onChange={e => setReplyMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleReply(); }}
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none text-sm"
              placeholder="Nhập tin nhắn..." />
            <button onClick={handleReply} disabled={!replyMsg.trim() || sending}
              className="px-4 py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 disabled:opacity-40 transition-all">
              {sending ? '...' : '→'}
            </button>
          </div>
        </div>
      )}

      {/* New message */}
      {tab === 'new' && (
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900">✉️ Gửi tin nhắn mới cho GVCN</h2>

          <div className="flex gap-3">
            <button onClick={() => setIsAnonymous(true)}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                isAnonymous ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}>
              🎭 Ẩn danh
              <p className="text-xs font-normal mt-0.5">Cô không biết bạn là ai</p>
            </button>
            <button onClick={() => setIsAnonymous(false)}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                !isAnonymous ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}>
              👤 Để tên
              <p className="text-xs font-normal mt-0.5">Cô biết bạn là ai</p>
            </button>
          </div>

          <div className={`p-3 rounded-xl text-xs ${isAnonymous ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {isAnonymous
              ? '🎭 Bạn sẽ được gán biệt danh ngẫu nhiên (VD: "Bạn học #1234"). Cô không biết danh tính bạn.'
              : '👤 Tên của bạn sẽ hiển thị với cô. Cô có thể hỗ trợ bạn tốt hơn.'}
          </div>

          <textarea value={firstMsg} onChange={e => setFirstMsg(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none text-sm resize-none"
            placeholder="Điều bạn muốn chia sẻ với cô..." rows={4} />

          <button onClick={handleStart} disabled={!firstMsg.trim() || sending}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-sm shadow-md disabled:opacity-40 hover:shadow-lg transition-all">
            {sending ? '⏳ Đang gửi...' : '💌 Gửi tin nhắn'}
          </button>
        </div>
      )}

      {/* Conversation list */}
      {(tab === 'list') && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Đang tải...</div>
          ) : convs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">💬</div>
              <p className="text-gray-500 font-medium">Chưa có cuộc trò chuyện nào</p>
              <button onClick={() => setTab('new')}
                className="mt-4 px-6 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-all">
                Gửi tin nhắn đầu tiên →
              </button>
            </div>
          ) : (
            convs.map(c => (
              <button key={c.id} onClick={() => loadConv(c.id)}
                className="w-full text-left bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl flex-shrink-0">
                    {c.isAnonymous ? '🎭' : '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">
                      {c.isAnonymous ? `Ẩn danh (${c.anonTag})` : 'Có thông tin'}
                      {' '}<span className="text-gray-400 font-normal text-xs">· {c.teacher?.fullName}</span>
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {c.messages?.[0]?.content || 'Chưa có tin nhắn'}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${c.status === 'OPEN' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {c.status === 'OPEN' ? 'Đang mở' : 'Đóng'}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
