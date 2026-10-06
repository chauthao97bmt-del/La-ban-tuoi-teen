import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export const SkillPortfolioPage: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/portfolio').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20"><div className="text-4xl animate-bounce-gentle">📋</div></div>
  );
  if (!data) return (
    <div className="text-center py-20 text-gray-400"><div className="text-5xl mb-4">😕</div><p>Không thể tải hồ sơ kỹ năng.</p></div>
  );

  const levelLabels = ['', 'Người Bắt Đầu 🌱', 'Người Khám Phá 🧭', 'Người Trưởng Thành 🌳', 'Người Dẫn Đầu ⭐', 'Nhà Tiên Phong 🚀'];
  const levelLabel = levelLabels[Math.min(data.student.level, 5)];

  return (
    <div className="animate-fade-in pb-20 space-y-5">

      {/* ── Header CV - full width ── */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-10 -translate-x-10" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
              {data.student.avatar || '🌱'}
            </div>
            <div>
              <h1 className="text-xl font-bold">{data.student.fullName}</h1>
              <p className="text-purple-200 text-sm">Lớp {data.student.className || '—'}</p>
              <span className="mt-1 inline-block bg-white/20 px-3 py-0.5 rounded-full text-xs font-medium">{levelLabel}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 md:min-w-[280px]">
            {[
              { label: 'XP tích lũy', value: data.student.xp, icon: '⭐' },
              { label: 'Ngày liên tiếp', value: data.student.streak, icon: '🔥' },
              { label: 'Huy hiệu', value: data.badges.length, icon: '🎖️' },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-lg">{s.icon}</div>
                <div className="font-bold text-lg">{s.value}</div>
                <div className="text-xs text-purple-200">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2-column grid for desktop ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* LEFT: Kỹ năng + Huy hiệu + Thống kê */}
        <div className="space-y-5">

          {/* Kỹ năng tự động */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">💪</span>
              Kỹ năng của tôi
            </h2>
            {data.autoSkills.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Hãy tham gia thêm hoạt động để mở khóa kỹ năng!</p>
            ) : (
              <div className="space-y-3">
                {data.autoSkills.map((skill: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-3">
                    <span className="text-xl flex-shrink-0">{skill.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{skill.skill}</p>
                      <p className="text-xs text-gray-500 mt-0.5">📌 {skill.evidence}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Huy hiệu */}
          {data.badges.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-yellow-100 flex items-center justify-center">🎖️</span>
                Huy hiệu đạt được ({data.badges.length})
              </h2>
              <div className="flex flex-wrap gap-3">
                {data.badges.map((badge: any, i: number) => (
                  <div key={i} className="flex flex-col items-center gap-1 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 min-w-[80px]">
                    <span className="text-2xl">{badge.icon || '🎖️'}</span>
                    <span className="text-xs font-semibold text-yellow-800 text-center">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thống kê hoạt động */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">📊</span>
              Hoạt động trên app
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Thử thách hoàn thành', value: `${data.completedChallenges}/21`, icon: '🏆' },
                { label: 'Mục tiêu đạt được', value: data.completedGoals, icon: '🎯' },
                { label: 'Bài đánh giá', value: data.stats.assessments, icon: '📝' },
                { label: 'Nghề khám phá', value: data.stats.careerExplorations, icon: '🧭' },
              ].map((s, i) => (
                <div key={i} className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="font-bold text-xl text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Điểm mạnh + RIASEC + Nghề nghiệp + Footer */}
        <div className="space-y-5">

          {/* Điểm mạnh tính cách */}
          {data.strengths.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">✨</span>
                Điểm mạnh tính cách
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.strengths.map((s: string, i: number) => (
                  <span key={i} className="badge bg-purple-100 text-purple-700 text-sm px-3 py-1.5">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Xu hướng RIASEC */}
          {data.topRiasec.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">🧠</span>
                Xu hướng tính cách nghề nghiệp
              </h2>
              <div className="space-y-2">
                {data.topRiasec.map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-blue-50 rounded-xl p-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-200 text-blue-800 font-bold flex items-center justify-center text-sm">{r.code}</span>
                    <span className="text-sm font-medium text-gray-800 flex-1">{r.label}</span>
                    {i === 0 && <span className="badge bg-blue-200 text-blue-700 text-xs">Nổi bật nhất</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nghề nghiệp quan tâm */}
          {data.topCareers.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">💼</span>
                Lĩnh vực nghề nghiệp quan tâm
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.topCareers.map((c: any, i: number) => (
                  <span key={i} className="badge bg-teal-100 text-teal-700 text-sm px-3 py-1.5">
                    {c.name} ({c.count} nghề)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-center">
            <p className="text-xs text-indigo-700 font-medium leading-relaxed">
              🌱 Hồ sơ được tự động cập nhật khi bạn tham gia các hoạt động trên La Bàn Tuổi Teen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
