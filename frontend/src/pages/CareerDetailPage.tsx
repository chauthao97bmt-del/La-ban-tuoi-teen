import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';

export const CareerDetailPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [career, setCareer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [challengeResponse, setChallengeResponse] = useState('');
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'skills' | 'challenge'>('overview');

  useEffect(() => {
    api.get(`/careers/${slug}`).then(r => { setCareer(r.data); setLoading(false); }).catch(() => { setLoading(false); navigate('/careers'); });
  }, [slug]);

  const handleSubmitChallenge = async () => {
    if (!challengeResponse.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/careers/${career.id}/explore`, { challengeResponse, reflection });
      setSubmitted(true);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="text-4xl animate-bounce-gentle">💼</div></div>;
  if (!career) return null;

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: '📋' },
    { id: 'daily', label: 'Ngày làm việc', icon: '📅' },
    { id: 'skills', label: 'Kỹ năng', icon: '🧠' },
    { id: 'challenge', label: 'Thử nghề', icon: '⚗️' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
        ← Quay lại
      </button>

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{career.category?.icon}</span>
          <span className="text-blue-100 text-sm">{career.category?.name}</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">{career.name}</h1>
        <p className="text-blue-100 text-sm">{career.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {career.relatedSubjects?.map((sub: string, i: number) => (
            <span key={i} className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">📚 {sub}</span>
          ))}
        </div>
      </div>

      {/* RIASEC Match */}
      {career.riasecMatch?.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-purple-600 mb-2">🧭 Phù hợp với kiểu người</p>
          <div className="flex gap-2">
            {career.riasecMatch.map((r: string) => {
              const labels: Record<string, string> = { R: '🔧 Thực hành', I: '🔬 Nghiên cứu', A: '🎨 Sáng tạo', S: '🤝 Xã hội', E: '💼 Doanh nhân', C: '📋 Tỉ mỉ' };
              return <span key={r} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">{labels[r]}</span>;
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">🌍 Môi trường làm việc</h3>
            <p className="text-gray-600 text-sm">{career.workEnvironment}</p>
          </div>
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">🤖 AI và nghề này</h3>
            <p className="text-gray-600 text-sm">{career.aiImpact}</p>
          </div>
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">❤️ Điều AI không thể thay thế</h3>
            <div className="flex flex-wrap gap-2">
              {career.humanSkills?.map((skill: string, i: number) => (
                <span key={i} className="badge bg-pink-100 text-pink-700">✨ {skill}</span>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">🔭 Khám phá thêm</h3>
            <ul className="space-y-2">
              {career.explorationActivities?.map((act: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'daily' && (
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">📅 Một ngày làm việc điển hình</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{career.dailyWork}</p>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">🎯 Kỹ năng cần có</h3>
            <div className="grid grid-cols-2 gap-2">
              {career.keySkills?.map((skill: string, i: number) => (
                <div key={i} className="flex items-center gap-2 bg-blue-50 rounded-xl p-3">
                  <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                  <span className="text-sm text-blue-800 font-medium">{skill}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">📚 Môn học liên quan</h3>
            <div className="flex flex-wrap gap-2">
              {career.relatedSubjects?.map((sub: string, i: number) => (
                <span key={i} className="badge bg-green-100 text-green-700">📖 {sub}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'challenge' && (
        <div className="space-y-4">
          {submitted ? (
            <div className="card text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="font-bold text-gray-900 text-xl mb-2">Xuất sắc!</h3>
              <p className="text-gray-600 mb-4">Bạn đã hoàn thành thử thách nghề {career.name} và nhận +50 XP!</p>
              <button onClick={() => setActiveTab('overview')} className="btn-secondary">Xem lại thông tin →</button>
            </div>
          ) : (
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚗️</span>
                <h3 className="font-bold text-gray-900">Thử nghề: {career.miniChallenge?.title}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">{career.miniChallenge?.description}</p>
              <textarea
                value={challengeResponse}
                onChange={e => setChallengeResponse(e.target.value)}
                placeholder="Viết câu trả lời của bạn vào đây..."
                className="input-field min-h-32 mb-3 resize-none"
              />
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Cảm nghĩ sau thử thách (tùy chọn)</label>
                <textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  placeholder="Bạn cảm thấy như thế nào? Nghề này có phù hợp với bạn không?"
                  className="input-field min-h-20 resize-none"
                />
              </div>
              <button
                onClick={handleSubmitChallenge}
                disabled={!challengeResponse.trim() || submitting}
                className="btn-primary w-full mt-4"
              >
                {submitting ? '⟳ Đang lưu...' : '🚀 Hoàn thành (+50 XP)'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="h-20 md:h-4"></div>
    </div>
  );
};
