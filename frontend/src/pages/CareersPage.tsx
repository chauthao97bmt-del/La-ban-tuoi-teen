import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api';

export const CareersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRiasec = searchParams.get('riasec') || '';
  const [careers, setCareers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = initialRiasec ? `/careers?riasec=${initialRiasec}` : '/careers';
    Promise.all([api.get(url), api.get('/careers/categories')]).then(([c, cats]) => {
      setCareers(c.data);
      setCategories(cats.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [initialRiasec]);

  const filtered = careers.filter(c => {
    const matchCat = !selectedCat || c.category?.name === selectedCat;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center"><div className="text-4xl animate-bounce-gentle">💼</div><p className="text-gray-500 mt-3">Đang tải...</p></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-1">🌏 Thế Giới Nghề Nghiệp</h1>
            <p className="text-blue-100 text-sm">Khám phá {careers.length} nghề nghiệp đa dạng trong thế giới hiện đại</p>
          </div>
          {initialRiasec && (
            <span className="bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              ✨ Gợi ý cho nhóm {initialRiasec}
            </span>
          )}
        </div>
        <div className="mt-4 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm nghề nghiệp..."
            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/60 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:bg-white/30"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCat('')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedCat ? 'bg-green-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'}`}
        >
          🌐 Tất cả
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(selectedCat === cat.name ? '' : cat.name)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCat === cat.name ? 'text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
            style={selectedCat === cat.name ? { backgroundColor: cat.color } : {}}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
            <span className="text-xs opacity-70">({cat._count?.careers})</span>
          </button>
        ))}
      </div>

      {/* Career Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(career => (
          <Link key={career.id} to={`/careers/${career.slug}`} className="card-hover group">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: career.category?.color + '20' }}>
                {career.category?.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">{career.name}</h3>
                </div>
                <p className="text-xs font-medium mt-0.5" style={{ color: career.category?.color }}>{career.category?.name}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{career.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {career.keySkills?.slice(0, 3).map((skill: string, i: number) => (
                    <span key={i} className="badge bg-gray-100 text-gray-600">{skill}</span>
                  ))}
                </div>
              </div>
              <span className="text-gray-300 group-hover:text-green-400 transition-colors text-xl flex-shrink-0">→</span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500">Không tìm thấy nghề phù hợp. Thử từ khóa khác nhé!</p>
        </div>
      )}

      <div className="h-20 md:h-4"></div>
    </div>
  );
};
