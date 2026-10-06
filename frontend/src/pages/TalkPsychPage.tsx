import React, { useEffect, useState, useRef } from 'react';
import api from '../lib/api';

interface Conversation {
  id: string;
  isAnonymous: boolean;
  anonTag?: string;
  status: string;
  messages: { senderRole: string; content: string; createdAt: string }[];
}

export const TalkPsychPage: React.FC = () => {
  const [tab, setTab] = useState<'list' | 'new' | 'chat'>('list');
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [firstMsg, setFirstMsg] = useState('');
  const [replyMsg, setReplyMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [psychAvailable, setPsychAvailable] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConvs = async () => {
    try {
      const res = await api.get('/talk/psych/conversations');
      setConvs(res.data);
    } catch {}
    setLoading(false);
  };

  const loadConv = async (id: string) => {
    const res = await api.get(`/talk/psych/conversation/${id}`);
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
      const res = await api.post('/talk/psych/start', { isAnonymous, firstMessage: firstMsg });
      setConvs(prev => [res.data, ...prev]);
      await loadConv(res.data.id);
      setFirstMsg('');
    } catch (err: any) {
      if (err.response?.status === 404) setPsychAvailable(false);
      else alert('Lỗi khi gửi. Vui lòng thử lại.');
    }
    setSending(false);
  };

  const handleReply = async () => {
    if (!replyMsg.trim() || !activeConv || sending) return;
    setSending(true);
    try {
      const res = await api.post(`/talk/psych/conversation/${activeConv.id}/reply`, { content: replyMsg });
      setActiveConv(res.data);
      setReplyMsg('');
    } catch {}
    setSending(false);
  };

  return (
    <div className="animate-fade-in pb-20 space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-4 -right-4 text-8xl opacity-10">🧠</div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🧠</div>
            <div>
              <h1 className="font-bold text-xl">Chuyên Gia Tâm Lý</h1>
              <p className="text-violet-200 text-xs">Ẩn danh hoàn toàn hoặc để lộ thông tin</p>
            </div>
          </div>
          <p className="text-sm text-violet-100 leading-relaxed">
            Đây là không gian an toàn. Chuyên gia tâm lý học đường của trường sẽ lắng nghe và đồng hành cùng bạn.
          </p>
        </div>
      </div>

      {!psychAvailable && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-amber-700 text-sm font-medium">⏳ Chuyên gia tâm lý đang không trực tuyến. Vui lòng thử lại sau hoặc liên hệ GVCN.</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
        <p className="text-xs text-violet-700 leading-relaxed">
          🔒 <strong>Bảo mật:</strong> Tổng đài Quốc gia Bảo vệ Trẻ em 📞 <strong>111</strong> (miễn phí).
        </p>
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
                ? 'bg-violet-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Chat view */}
      {tab === 'chat' && activeConv && (
        <div className="card flex flex-col" style={{ minHeight: 400 }}>
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
            <button onClick={() => setTab('list')} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-lg">🧠</div>
            <div>
              <p className="font-bold text-sm text-gray-900">Chuyên gia Tâm lý</p>
              <p className="text-xs text-gray-400">{activeConv.isAnonymous ? `Ẩn danh (${activeConv.anonTag})` : 'Có thông tin'}</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-80 mb-4">
            {activeConv.messages?.map((m: any, i: number) => (
              <div key={i} className={`flex ${m.senderRole === 'STUDENT' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.senderRole === 'STUDENT'
                    ? 'bg-violet-500 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {m.senderRole === 'PSYCHOLOGIST' && <p className="text-xs font-semibold text-gray-500 mb-1">🧠 Chuyên gia</p>}
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-2">
            <input value={replyMsg} onChange={e => setReplyMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleReply(); }}
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:outline-none text-sm"
              placeholder="Nhập tin nhắn..." />
            <button onClick={handleReply} disabled={!replyMsg.trim() || sending}
              className="px-4 py-2.5 rounded-xl bg-violet-500 text-white font-bold text-sm hover:bg-violet-600 disabled:opacity-40 transition-all">
              {sending ? '...' : '→'}
            </button>
          </div>
        </div>
      )}

      {/* New message */}
      {tab === 'new' && (
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900">✉️ Gửi tin nhắn cho Chuyên gia</h2>

          <div className="flex gap-3">
            <button onClick={() => setIsAnonymous(true)}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                isAnonymous ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500'
              }`}>
              🎭 Ẩn danh
              <p className="text-xs font-normal mt-0.5">Hoàn toàn bí mật</p>
            </button>
            <button onClick={() => setIsAnonymous(false)}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                !isAnonymous ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500'
              }`}>
              👤 Để tên
              <p className="text-xs font-normal mt-0.5">Hỗ trợ tốt hơn</p>
            </button>
          </div>

          <div className={`p-3 rounded-xl text-xs ${isAnonymous ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-violet-50 text-violet-700 border border-violet-200'}`}>
            {isAnonymous
              ? '🎭 Bạn được gán biệt danh ngẫu nhiên. Chuyên gia không biết bạn là ai.'
              : '👤 Tên bạn hiển thị với chuyên gia. Họ có thể theo dõi và hỗ trợ bạn tốt hơn.'}
          </div>

          <textarea value={firstMsg} onChange={e => setFirstMsg(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:outline-none text-sm resize-none"
            placeholder="Bạn đang trải qua điều gì? Chuyên gia ở đây lắng nghe bạn..." rows={4} />

          <button onClick={handleStart} disabled={!firstMsg.trim() || sending || !psychAvailable}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm shadow-md disabled:opacity-40 hover:shadow-lg transition-all">
            {sending ? '⏳ Đang gửi...' : '💌 Gửi tin nhắn'}
          </button>
        </div>
      )}

      {/* Conversation list */}
      {tab === 'list' && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Đang tải...</div>
          ) : convs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🧠</div>
              <p className="text-gray-500 font-medium">Chưa có cuộc trò chuyện nào</p>
              <button onClick={() => setTab('new')}
                className="mt-4 px-6 py-2.5 bg-violet-500 text-white rounded-xl text-sm font-bold hover:bg-violet-600 transition-all">
                Nhắn tin với chuyên gia →
              </button>
            </div>
          ) : (
            convs.map(c => (
              <button key={c.id} onClick={() => loadConv(c.id)}
                className="w-full text-left bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-xl flex-shrink-0">
                    {c.isAnonymous ? '🎭' : '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">
                      {c.isAnonymous ? `Ẩn danh (${c.anonTag})` : 'Có thông tin'}
                      <span className="text-gray-400 font-normal text-xs"> · Chuyên gia Tâm lý</span>
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {c.messages?.[0]?.content || 'Chưa có tin nhắn'}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${c.status === 'OPEN' ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-500'}`}>
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
