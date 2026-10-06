import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const ASSESSMENT_TYPES = [
  { id: 'RIASEC', label: 'Kiểu Nhân Cách Holland', icon: '🧭', color: 'from-blue-400 to-cyan-400', desc: 'Khám phá 6 kiểu sở thích nghề nghiệp để tìm hướng đi phù hợp' },
  { id: 'STRENGTHS', label: 'Điểm Mạnh Bản Thân', icon: '💪', color: 'from-green-400 to-teal-400', desc: 'Nhận ra những điểm mạnh độc đáo của bạn' },
  { id: 'VALUES', label: 'Giá Trị Sống', icon: '❤️', color: 'from-pink-400 to-rose-400', desc: 'Hiểu điều gì thực sự quan trọng với bạn trong cuộc sống' },
];

export const SelfDiscoveryPage: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    api.get('/assessments/my').then(r => setAssessments(r.data)).catch(() => {});
  }, []);

  const startAssessment = async (type: string) => {
    setActiveType(type);
    setStep(0);
    setAnswers({});
    setCompleted(false);
    setResult(null);
    const r = await api.get(`/assessments/questions/${type}`);
    setQuestions(r.data);
  };

  const handleRiasecAnswer = (id: number, value: number) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleStrengthsSelect = (name: string) => {
    const current = answers[0] as string[] || [];
    if (current.includes(name)) {
      setAnswers({ 0: current.filter(s => s !== name) });
    } else if (current.length < 5) {
      setAnswers({ 0: [...current, name] });
    }
  };

  const handleValuesRank = (name: string, rank: number) => {
    setAnswers(prev => ({ ...prev, [name]: rank }));
  };

  const submitAssessment = async () => {
    setLoading(true);
    let computedResult: any = {};
    if (activeType === 'RIASEC') {
      const scores: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
      questions.forEach(q => { if (answers[q.id] !== undefined) scores[q.group] += answers[q.id]; });
      computedResult = scores;
    } else if (activeType === 'STRENGTHS') {
      computedResult = { selected: answers[0] || [] };
    } else if (activeType === 'VALUES') {
      computedResult = answers;
    }
    try {
      await api.post('/assessments/submit', { type: activeType, answers: Object.entries(answers), result: computedResult });
      setResult(computedResult);
      setCompleted(true);
      const r = await api.get('/assessments/my');
      setAssessments(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getRiasecLabel = (key: string) => ({ R: '🔧 Thực hành (R)', I: '🔬 Nghiên cứu (I)', A: '🎨 Sáng tạo (A)', S: '🤝 Xã hội (S)', E: '💼 Doanh nhân (E)', C: '📋 Tỉ mỉ (C)' }[key] || key);

  const allAnswered = activeType === 'RIASEC' ? questions.every(q => answers[q.id] !== undefined)
    : activeType === 'STRENGTHS' ? ((answers[0] as string[])?.length || 0) >= 3
    : activeType === 'VALUES' ? Object.keys(answers).length >= 3
    : false;

  if (completed && result) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button onClick={() => setActiveType(null)} className="flex items-center gap-2 text-gray-600 text-sm">← Quay lại</button>
        <div className="card text-center py-8">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hoàn thành! +100 XP</h2>
          <p className="text-gray-600 mb-6">Kết quả đã được lưu vào hồ sơ của bạn</p>

          {activeType === 'RIASEC' && (
            <div className="text-left space-y-2">
              <h3 className="font-bold text-gray-800 mb-3">Điểm RIASEC của bạn:</h3>
              {Object.entries(result).sort(([,a],[,b]) => (b as number) - (a as number)).map(([key, score]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-24 text-sm font-medium text-gray-600">{getRiasecLabel(key)}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-400 to-teal-500 rounded-full h-3 transition-all" style={{ width: `${Math.min(((score as number) / 18) * 100, 100)}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-8">{score as number}</span>
                </div>
              ))}
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-700">💡 Kiểu cao nhất của bạn: <strong>{getRiasecLabel(Object.entries(result).sort(([,a],[,b]) => (b as number)-(a as number))[0][0])}</strong></p>
                <Link to={`/careers?riasec=${Object.entries(result).sort(([,a],[,b]) => (b as number)-(a as number))[0][0]}`} className="text-green-600 text-sm font-medium mt-2 inline-block">→ Xem nghề phù hợp</Link>
              </div>
            </div>
          )}
          {activeType === 'STRENGTHS' && result.selected?.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {result.selected.map((s: string) => <span key={s} className="badge bg-green-100 text-green-700 text-sm px-4 py-2">✨ {s}</span>)}
            </div>
          )}

          <div className="mt-6 flex gap-3 justify-center">
            <button onClick={() => setActiveType(null)} className="btn-secondary">Thử bài khác</button>
            <Link to={activeType === 'RIASEC' ? `/careers?riasec=${Object.entries(result).sort(([,a],[,b]) => (b as number)-(a as number))[0][0]}` : '/careers'} className="btn-primary">Xem nghề phù hợp →</Link>
          </div>
        </div>
      </div>
    );
  }

  if (activeType && questions.length > 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveType(null)} className="text-gray-600 text-sm">← Quay lại</button>
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div className="bg-green-500 rounded-full h-2 transition-all" style={{ width: `${Object.keys(answers).length / (activeType === 'RIASEC' ? questions.length : questions.length) * 100}%` }}></div>
          </div>
        </div>

        {activeType === 'RIASEC' && (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-900">🧭 Bạn đồng ý với những câu sau ở mức độ nào?</h2>
            <p className="text-sm text-gray-500">1 = Không đồng ý, 5 = Rất đồng ý</p>
            {questions.map(q => (
              <div key={q.id} className="card">
                <p className="font-medium text-gray-800 mb-3 text-sm">{q.text}</p>
                <div className="flex gap-2 justify-center">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} onClick={() => handleRiasecAnswer(q.id, v)}
                      className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${answers[q.id] === v ? 'bg-green-500 text-white shadow-md scale-110' : 'bg-gray-100 text-gray-600 hover:bg-green-100'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeType === 'STRENGTHS' && (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-900">💪 Chọn 3-5 điểm mạnh của bạn</h2>
            <p className="text-sm text-gray-500">Đã chọn: {(answers[0] as string[] || []).length}/5</p>
            <div className="grid grid-cols-1 gap-3">
              {questions.map(q => {
                const selected = (answers[0] as string[] || []).includes(q.name);
                return (
                  <button key={q.id} onClick={() => handleStrengthsSelect(q.name)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${selected ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <span className="text-2xl">{q.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{q.name}</p>
                      <p className="text-xs text-gray-500">{q.description}</p>
                    </div>
                    {selected && <span className="ml-auto text-green-500 text-xl">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeType === 'VALUES' && (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-900">❤️ Điều gì quan trọng với bạn?</h2>
            <p className="text-sm text-gray-500">Xếp hạng từ 1 (quan trọng nhất) đến 9</p>
            {questions.map((q, idx) => (
              <div key={q.id} className="card flex items-center gap-3">
                <span className="text-2xl">{q.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{q.name}</p>
                  <p className="text-xs text-gray-500">{q.description}</p>
                </div>
                <select value={answers[q.name] || ''} onChange={e => handleValuesRank(q.name, parseInt(e.target.value))}
                  className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                  <option value="">-</option>
                  {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        <button onClick={submitAssessment} disabled={!allAnswered || loading} className="btn-primary w-full">
          {loading ? '⟳ Đang xử lý...' : '✅ Xem kết quả (+100 XP)'}
        </button>
        <div className="h-20 md:h-4"></div>
      </div>
    );
  }

  const completedTypes = assessments.map(a => a.type);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">🔍 Khám Phá Bản Thân</h1>
        <p className="text-purple-100 text-sm">Hiểu mình hơn để chọn đúng hướng đi. Mỗi bài giúp bạn khám phá một góc nhìn khác về bản thân.</p>
      </div>

      <div className="grid gap-4">
        {ASSESSMENT_TYPES.map(type => {
          const done = completedTypes.includes(type.id);
          return (
            <button key={type.id} onClick={() => startAssessment(type.id)}
              className="card-hover text-left group">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center text-3xl shadow-md group-hover:scale-105 transition-transform`}>
                  {type.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">{type.label}</h3>
                    {done && <span className="badge bg-green-100 text-green-700 text-xs">✓ Đã làm</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{type.desc}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-green-600 font-medium">+100 XP</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-400">~5 phút</span>
                  </div>
                </div>
                <span className="text-gray-300 group-hover:text-green-400 transition-colors text-xl">→</span>
              </div>
            </button>
          );
        })}
      </div>

      {assessments.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-3">📊 Kết quả gần đây</h3>
          <div className="space-y-2">
            {assessments.slice(0, 3).map(a => (
              <div key={a.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <span>{ASSESSMENT_TYPES.find(t => t.id === a.type)?.icon || '📝'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{ASSESSMENT_TYPES.find(t => t.id === a.type)?.label || a.type}</p>
                  <p className="text-xs text-gray-400">{new Date(a.completedAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <span className="badge bg-green-100 text-green-700">✓ Hoàn thành</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-20 md:h-4"></div>
    </div>
  );
};
