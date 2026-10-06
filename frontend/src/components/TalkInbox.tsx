import React, { useEffect, useState, useRef } from 'react';
import api from '../lib/api';

interface Props {
  mode: 'teacher' | 'psych';
}

const THEME = {
  teacher: { staffRole: 'TEACHER', accent: 'indigo', title: 'Tin nhắn Tâm sự từ học sinh', icon: '💬' },
  psych: { staffRole: 'PSYCHOLOGIST', accent: 'violet', title: 'Hộp thư Chuyên gia Tâm lý', icon: '🧠' },
};

export const TalkInbox: React.FC<Props> = ({ mode }) => {
  const t = THEME[mode];
  const base = `/talk/${mode}`;
  const [convs, setConvs] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadInbox = async () => {
    try {
      const res = await api.get(`${base}/inbox`);
      setConvs(res.data);
      setError('');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Không tải được hộp thư.');
    }
    setLoading(false);
  };

  const openConv = async (id: string) => {
    try {
      const res = await api.get(`${base}/conversation/${id}`);
      setActive(res.data);
      window.dispatchEvent(new Event('refreshUnread'));
    } catch (e: any) {
      setError(e.response?.data?.error || 'Không mở được cuộc trò chuyện.');
    }
  };

  useEffect(() => {
    loadInbox();
    const timer = setInterval(loadInbox, 20000); // tự làm mới mỗi 20 giây
    return () => clearInterval(timer);
  }, [mode]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [active]);

  const sendReply = async () => {
    if (!reply.trim() || !active || sending) return;
    setSending(true);
    try {
      const res = await api.post(`${base}/conversation/${active.id}/reply`, { content: reply });
      setActive(res.data);
      setReply('');
      loadInbox();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Gửi thất bại, vui lòng thử lại.');
    }
    setSending(false);
  };

  const senderName = (c: any) => c.isAnonymous ? c.anonTag : (c.student?.fullName || 'Học sinh');
  const needsReply = (c: any) => c.messages?.[0]?.senderRole === 'STUDENT';
  const waiting = convs.filter(needsReply).length;

  const accentBtn = mode === 'teacher' ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-violet-500 hover:bg-violet-600';
  const accentBubble = mode === 'teacher' ? 'bg-indigo-500' : 'bg-violet-500';
  const accentSel = mode === 'teacher' ? 'border-indigo-300 bg-indigo-50' : 'border-violet-300 bg-violet-50';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-bold text-gray-900">{t.icon} {t.title}</h2>
        <span className={`text-xs px-3 py-1 rounded-full ${waiting ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
          {waiting ? `${waiting} tin chờ trả lời` : 'Đã trả lời hết'}
        </span>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">⚠️ {error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Danh sách */}
        <div className={`lg:col-span-2 space-y-2 ${active ? 'hidden lg:block' : ''}`}>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Đang tải...</div>
          ) : convs.length === 0 ? (
            <div className="card text-center py-10">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-400 text-sm">Chưa có tin nhắn nào từ học sinh</p>
            </div>
          ) : convs.map(c => (
            <button key={c.id} onClick={() => openConv(c.id)}
              className={`w-full text-left rounded-2xl p-3 border transition-all ${active?.id === c.id ? accentSel + ' shadow-md' : 'border-gray-100 bg-white hover:shadow-md'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                  {c.isAnonymous ? '🎭' : '👤'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {senderName(c)}
                    {!c.isAnonymous && c.student?.class && <span className="text-gray-400 text-xs font-normal"> · {c.student.class.name}</span>}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{c.messages?.[0]?.content || ''}</p>
                </div>
                {needsReply(c) && <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" title="Chờ trả lời" />}
              </div>
            </button>
          ))}
        </div>

        {/* Chi tiết */}
        <div className={`lg:col-span-3 ${active ? '' : 'hidden lg:block'}`}>
          {active ? (
            <div className="card flex flex-col">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-3">
                <button onClick={() => setActive(null)} className="lg:hidden text-gray-500 text-sm pr-1">←</button>
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl">{active.isAnonymous ? '🎭' : '👤'}</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{senderName(active)}</p>
                  <p className="text-xs text-gray-400">
                    {active.isAnonymous ? '🎭 Học sinh chọn ẩn danh' : `Lớp ${active.student?.class?.name || '—'}`}
                  </p>
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[50vh] mb-3 pr-1">
                {active.messages?.map((m: any) => {
                  const mine = m.senderRole === t.staffRole;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${mine ? `${accentBubble} text-white rounded-br-sm` : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                        {m.content}
                        <p className="text-[10px] opacity-60 mt-1">
                          {new Date(m.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="flex gap-2">
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={2}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-gray-400 focus:outline-none text-sm resize-none"
                  placeholder="Viết lời phản hồi ân cần cho học sinh..." />
                <button onClick={sendReply} disabled={!reply.trim() || sending}
                  className={`px-5 rounded-xl text-white font-bold text-sm disabled:opacity-40 transition-all ${accentBtn}`}>
                  {sending ? '...' : 'Gửi'}
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-gray-400 text-sm">Chọn một cuộc trò chuyện để xem và trả lời</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
