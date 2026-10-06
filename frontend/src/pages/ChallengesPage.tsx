import React, { useEffect, useState } from 'react';
import api from '../lib/api';

export const ChallengesPage: React.FC = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const [ch, pr] = await Promise.all([api.get('/challenges'), api.get('/challenges/my-progress')]);
    setChallenges(ch.data);
    setProgress(pr.data);
  };

  useEffect(() => { loadData(); }, []);

  const isCompleted = (id: string) => progress.some(p => p.challengeId === id && p.completed);
  const getResponse = (id: string) => progress.find(p => p.challengeId === id)?.response;

  const completedCount = progress.filter(p => p.completed).length;
  const progressPct = Math.round((completedCount / 21) * 100);

  const handleComplete = async () => {
    if (!selected || !response.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/challenges/${selected.id}/complete`, { response });
      await loadData();
      setSelected(null);
      setResponse('');
    } catch (e: any) {
      alert(e.response?.data?.error || 'Lỗi khi hoàn thành thử thách.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">🏆 Hành Trình 21 Ngày</h1>
        <p className="text-orange-100 text-sm">Mỗi ngày một thử thách nhỏ – 21 ngày thay đổi lớn!</p>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-orange-100 mb-2">
            <span>🌱 Ngày {completedCount}</span>
            <span className="font-bold">{progressPct}%</span>
            <span>🌳 Ngày 21</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div className="bg-white rounded-full h-3 progress-bar" style={{ width: `${progressPct}%` }}></div>
          </div>
          <p className="text-xs text-orange-100 mt-1 text-center">{completedCount}/21 thử thách hoàn thành</p>
        </div>
      </div>

      {/* Challenge Grid */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
        {challenges.map(ch => {
          const done = isCompleted(ch.id);
          const isCurrent = !done && ch.dayNumber === completedCount + 1;
          return (
            <button key={ch.id}
              onClick={() => { setSelected(ch); setResponse(getResponse(ch.id) || ''); }}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all font-bold text-sm ${
                done ? 'bg-green-500 text-white shadow-md' :
                isCurrent ? 'bg-orange-400 text-white shadow-md animate-pulse-green ring-2 ring-orange-300' :
                ch.dayNumber <= completedCount + 3 ? 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300 hover:shadow-sm' :
                'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}>
              {done ? <span className="text-xl">✓</span> : <span className="text-sm">{ch.dayNumber}</span>}
              {done && <span className="text-xs">{ch.dayNumber}</span>}
            </button>
          );
        })}
      </div>

      {/* Challenge Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4" onClick={() => !submitting && setSelected(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-orange-100 text-orange-700">Ngày {selected.dayNumber}</span>
              <span className="badge bg-green-100 text-green-700">+{selected.xpReward} XP</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{selected.title}</h2>
            <p className="text-gray-600 text-sm mb-4">{selected.description}</p>

            {isCompleted(selected.id) ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-700 font-medium mb-2">✅ Đã hoàn thành!</p>
                {getResponse(selected.id) && <p className="text-gray-600 text-sm italic">"{getResponse(selected.id)}"</p>}
              </div>
            ) : (
              <>
                <textarea
                  value={response}
                  onChange={e => setResponse(e.target.value)}
                  placeholder="Chia sẻ suy nghĩ của bạn về thử thách này..."
                  className="input-field resize-none mb-4 min-h-28"
                />
                <div className="flex gap-3">
                  <button onClick={() => setSelected(null)} className="btn-secondary flex-1">Đóng</button>
                  <button onClick={handleComplete} disabled={!response.trim() || submitting} className="btn-primary flex-1">
                    {submitting ? '⟳ Đang lưu...' : `🏆 Hoàn thành (+${selected.xpReward} XP)`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* List View */}
      <div className="space-y-3">
        <h2 className="font-bold text-gray-900">📋 Danh sách thử thách</h2>
        {challenges.map(ch => {
          const done = isCompleted(ch.id);
          const isCurrent = !done && ch.dayNumber === completedCount + 1;
          const isLocked = ch.dayNumber > completedCount + 1;
          return (
            <button key={ch.id}
              disabled={isLocked}
              onClick={() => { if (!isLocked) { setSelected(ch); setResponse(getResponse(ch.id) || ''); } }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                done ? 'bg-green-50 border-green-200' :
                isCurrent ? 'bg-orange-50 border-orange-300 shadow-sm' :
                isLocked ? 'bg-gray-50 border-gray-200 opacity-60' :
                'bg-white border-gray-200 hover:border-orange-300 hover:shadow-sm'
              }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                done ? 'bg-green-500 text-white' : isCurrent ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {done ? '✓' : ch.dayNumber}
              </div>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${done ? 'text-green-800' : isLocked ? 'text-gray-400' : 'text-gray-900'}`}>{ch.title}</p>
                {isCurrent && <p className="text-xs text-orange-600 font-medium">← Thử thách của bạn hôm nay!</p>}
                {done && <p className="text-xs text-green-600">Hoàn thành ✓</p>}
              </div>
              <span className="badge bg-yellow-100 text-yellow-700">+{ch.xpReward} XP</span>
            </button>
          );
        })}
      </div>

      <div className="h-20 md:h-4"></div>
    </div>
  );
};
