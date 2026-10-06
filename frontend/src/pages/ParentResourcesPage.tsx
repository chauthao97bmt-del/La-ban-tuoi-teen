import React, { useEffect, useState } from 'react';
import api from '../lib/api';

export const ParentResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/parent').then(r => { setResources(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const catLabels: Record<string, string> = {
    GIAO_TIEP: '💬 Giao tiếp',
    HOC_TAP: '📚 Học tập',
    THI_CU: '📝 Thi cử',
    HUONG_NGHIEP: '🧭 Hướng nghiệp',
    SK_TINH_THAN: '💙 Sức khỏe tâm thần',
    XA_HOI: '🤝 Xã hội',
  };

  const filtered = filter ? resources.filter(r => r.category === filter) : resources;

  if (loading) return <div className="flex justify-center py-20"><div className="text-4xl animate-bounce-gentle">📚</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">📚 Góc Phụ Huynh</h1>
        <p className="text-teal-100 text-sm">Tài nguyên hữu ích để đồng hành cùng con trong giai đoạn lớp 9</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFilter('')} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${!filter ? 'bg-teal-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600'}`}>
          🌐 Tất cả
        </button>
        {Object.entries(catLabels).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(filter === key ? '' : key)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === key ? 'bg-teal-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {label}
          </button>
        ))}
      </div>

      {selected ? (
        <div className="card animate-slide-up">
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-gray-600 text-sm mb-4">← Quay lại</button>
          <div className="mb-2">
            <span className="badge bg-teal-100 text-teal-700 text-xs">{catLabels[selected.category] || selected.category}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{selected.title}</h2>
          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{selected.content}</div>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(res => (
            <button key={res.id} onClick={() => setSelected(res)} className="card-hover text-left group">
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{catLabels[res.category]?.split(' ')[0] || '📄'}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{res.title}</h3>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">{catLabels[res.category] || res.category}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{res.content}</p>
                </div>
                <span className="text-gray-300 group-hover:text-teal-400 text-xl">→</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="h-20 md:h-4"></div>
    </div>
  );
};
