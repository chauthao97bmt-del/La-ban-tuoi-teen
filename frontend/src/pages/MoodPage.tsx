import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const MOODS = [
  { key: 'GREAT', label: 'Tuyệt vời!', emoji: '😄', color: 'bg-green-100 border-green-300 text-green-700' },
  { key: 'GOOD', label: 'Ổn', emoji: '😊', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { key: 'NEUTRAL', label: 'Bình thường', emoji: '😐', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
  { key: 'SAD', label: 'Buồn', emoji: '😢', color: 'bg-purple-100 border-purple-300 text-purple-700' },
  { key: 'ANXIOUS', label: 'Lo lắng', emoji: '😰', color: 'bg-orange-100 border-orange-300 text-orange-700' },
  { key: 'ANGRY', label: 'Tức giận', emoji: '😤', color: 'bg-red-100 border-red-300 text-red-700' },
];

export const MoodPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get('/mood/my').then(r => setEntries(r.data)).catch(() => {});
  }, [submitted]);

  const handleSubmit = async () => {
    if (!selectedMood) return;
    setSubmitting(true);
    try {
      await api.post('/mood', { mood: selectedMood, note, isPrivate });
      setSubmitted(true);
      setSelectedMood('');
      setNote('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const getMoodData = (key: string) => MOODS.find(m => m.key === key) || MOODS[2];

  // Mood stats for chart
  const moodCounts: Record<string, number> = {};
  entries.forEach(e => { moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1; });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">📔 Nhật Ký Cảm Xúc</h1>
            <p className="text-purple-100 text-sm">Theo dõi cảm xúc mỗi ngày giúp bạn hiểu bản thân hơn</p>
          </div>
          <style>{`
            @keyframes urgent-pulse {
              0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
              50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
              100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
            .animate-urgent { animation: urgent-pulse 2s infinite; }
          `}</style>
          <Link
            to="/sos"
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-5 rounded-xl transition-all animate-urgent"
          >
            <span className="text-xl animate-bounce">🆘</span> Cấp cứu cảm xúc
          </Link>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">✨</div>
      </div>

      {/* Check-in */}
      {submitted ? (
        <div className="card text-center py-6">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-bold text-gray-900">Đã ghi lại cảm xúc hôm nay!</p>
          <p className="text-sm text-gray-500 mt-1">+10 XP • Cảm ơn bạn đã chia sẻ 💙</p>
        </div>
      ) : (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">😊 Hôm nay bạn cảm thấy thế nào?</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {MOODS.map(mood => (
              <button key={mood.key} onClick={() => setSelectedMood(mood.key)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${selectedMood === mood.key ? mood.color + ' shadow-md scale-105' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-xs font-medium text-gray-700">{mood.label}</span>
              </button>
            ))}
          </div>

          {selectedMood && (
            <>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Thêm ghi chú... (tùy chọn)"
                className="input-field resize-none mb-3"
                rows={3}
              />
              <div className="flex items-center gap-2 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-10 h-6 rounded-full transition-colors ${isPrivate ? 'bg-green-500' : 'bg-gray-300'}`} onClick={() => setIsPrivate(!isPrivate)}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${isPrivate ? 'translate-x-5' : 'translate-x-1'}`}></div>
                  </div>
                  <span className="text-sm text-gray-600">{isPrivate ? '🔒 Chỉ mình tôi thấy' : '👀 Giáo viên có thể thấy'}</span>
                </label>
              </div>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full">
                {submitting ? '⟳ Đang lưu...' : '💾 Lưu cảm xúc hôm nay'}
              </button>
            </>
          )}
        </div>
      )}

      {/* 7-day trend */}
      {entries.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">📈 Cảm xúc 7 ngày gần đây</h2>
          <div className="flex justify-around items-end gap-1">
            {entries.slice(0, 7).reverse().map((e, i) => {
              const mood = getMoodData(e.mood);
              const date = new Date(e.createdAt);
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-xl">{mood.emoji}</span>
                  <span className="text-xs text-gray-400">{date.getDate()}/{date.getMonth()+1}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History */}
      {entries.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">📜 Lịch sử cảm xúc</h2>
          <div className="space-y-2">
            {entries.slice(0, 10).map((entry, i) => {
              const mood = getMoodData(entry.mood);
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${mood.color}`}>
                  <span className="text-xl">{mood.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{mood.label}</span>
                      <span className="text-xs opacity-60">{entry.isPrivate ? '🔒' : '👀'}</span>
                    </div>
                    {entry.note && <p className="text-xs mt-0.5 opacity-80">{entry.note}</p>}
                    <p className="text-xs opacity-60 mt-0.5">{new Date(entry.createdAt).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="h-20 md:h-4"></div>
    </div>
  );
};
