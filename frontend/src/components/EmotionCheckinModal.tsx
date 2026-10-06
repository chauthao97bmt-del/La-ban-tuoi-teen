import React, { useState } from 'react';
import api from '../lib/api';

interface Props {
  onClose: () => void;
  onCheckinDone: (emotion: string, badStreak: number, alert: any) => void;
}

const EMOTIONS = [
  { id: 'HAPPY',   emoji: '😄', label: 'Vui vẻ',     desc: 'Mình đang rất vui và năng lượng!',      color: 'from-yellow-300 to-amber-400',  border: 'border-yellow-300', bg: 'bg-yellow-50' },
  { id: 'CALM',    emoji: '😊', label: 'Bình thường', desc: 'Ổn, không có gì đặc biệt',             color: 'from-green-300 to-teal-400',    border: 'border-green-300',  bg: 'bg-green-50'  },
  { id: 'NEUTRAL', emoji: '😐', label: 'Mơ hồ',      desc: 'Mình không biết mình đang cảm thấy gì', color: 'from-gray-300 to-slate-400',    border: 'border-gray-300',   bg: 'bg-gray-50'   },
  { id: 'SAD',     emoji: '😔', label: 'Buồn',        desc: 'Mình đang buồn và ủ dột',              color: 'from-blue-300 to-indigo-400',   border: 'border-blue-300',   bg: 'bg-blue-50'   },
  { id: 'ANXIOUS', emoji: '😰', label: 'Lo lắng',    desc: 'Mình đang lo lắng / căng thẳng',       color: 'from-orange-300 to-red-400',    border: 'border-orange-300', bg: 'bg-orange-50' },
  { id: 'ANGRY',   emoji: '😤', label: 'Bực bội',    desc: 'Mình đang bực bội / tức giận',         color: 'from-red-400 to-rose-500',      border: 'border-red-300',    bg: 'bg-red-50'    },
];

export const EmotionCheckinModal: React.FC<Props> = ({ onClose, onCheckinDone }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post('/checkin', { weather: selected, note: note.trim() || undefined });
      onCheckinDone(selected, res.data.badStreak, res.data.alert);
    } catch {
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const sel = EMOTIONS.find(e => e.id === selected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-400 to-teal-500 px-6 py-5 text-white text-center">
          <div className="text-3xl mb-2">😊</div>
          <h2 className="font-bold text-lg">Điểm danh Cảm xúc Hôm nay</h2>
          <p className="text-sky-100 text-sm mt-1">Bạn đang cảm thấy thế nào?</p>
        </div>

        {/* Emotion grid */}
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {EMOTIONS.map(e => (
              <button key={e.id} onClick={() => setSelected(e.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  selected === e.id
                    ? `${e.border} ${e.bg} shadow-md scale-105`
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}>
                <span className="text-3xl">{e.emoji}</span>
                <span className="text-xs font-bold text-gray-700">{e.label}</span>
              </button>
            ))}
          </div>

          {/* Mô tả */}
          {sel && (
            <div className={`rounded-xl p-3 mb-3 border ${sel.border} ${sel.bg} text-center`}>
              <p className="text-sm text-gray-700">{sel.emoji} {sel.desc}</p>
            </div>
          )}

          {/* Ghi chú */}
          {selected && (
            <textarea value={note} onChange={e => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-300 focus:outline-none text-sm resize-none mb-3"
              placeholder="Thêm một câu về hôm nay của bạn... (không bắt buộc)"
              rows={2}
            />
          )}

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50">
              Để sau
            </button>
            <button onClick={handleSubmit} disabled={!selected || submitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white text-sm font-bold shadow-md disabled:opacity-40 hover:shadow-lg transition-all active:scale-95">
              {submitting ? '⏳ Đang lưu...' : `Điểm danh ${sel?.emoji || ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
