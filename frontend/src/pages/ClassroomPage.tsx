import React, { useEffect, useState } from 'react';
import api from '../lib/api';

export const ClassroomPage: React.FC = () => {
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/classes/my-class').then(r => { setClassData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="text-4xl animate-bounce-gentle">🏫</div></div>;

  if (!classData) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🏫</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Chưa vào lớp học nào</h2>
        <p className="text-gray-500 text-sm">Hỏi giáo viên để lấy mã lớp và tham gia nhé!</p>
      </div>
    </div>
  );

  const typeColors: Record<string, string> = {
    INFO: 'bg-blue-50 border-blue-200 text-blue-800',
    EXAM: 'bg-orange-50 border-orange-200 text-orange-800',
    EVENT: 'bg-green-50 border-green-200 text-green-800',
    REMINDER: 'bg-purple-50 border-purple-200 text-purple-800',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">🏫 Góc Lớp Học</h1>
        <p className="text-blue-100 text-sm">Lớp {classData.name} • {classData._count?.students} học sinh</p>
        {classData.teacher && (
          <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-xl p-3">
            <span className="text-2xl">{classData.teacher.avatar || '👩‍🏫'}</span>
            <div>
              <p className="font-semibold">{classData.teacher.fullName}</p>
              <p className="text-xs text-blue-100">Giáo viên chủ nhiệm • {classData.teacher.subject}</p>
            </div>
          </div>
        )}
        <div className="mt-3 flex items-center gap-2">
          <span className="badge bg-white/20 text-white">📋 Mã lớp: {classData.classCode}</span>
        </div>
      </div>

      {/* Announcements */}
      <div>
        <h2 className="font-bold text-gray-900 mb-4">📢 Thông báo từ giáo viên</h2>
        {classData.announcements?.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-gray-500">Chưa có thông báo nào.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {classData.announcements?.map((ann: any) => (
              <div key={ann.id} className={`border rounded-xl p-4 ${typeColors[ann.type] || typeColors.INFO}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm">{ann.title}</h3>
                  <span className="badge text-xs bg-white/50">{ann.type === 'EXAM' ? '📝 Kiểm tra' : ann.type === 'EVENT' ? '🎉 Sự kiện' : ann.type === 'REMINDER' ? '⏰ Nhắc nhở' : 'ℹ️ Thông tin'}</span>
                </div>
                <p className="text-sm whitespace-pre-line">{ann.content}</p>
                <p className="text-xs opacity-60 mt-2">{new Date(ann.createdAt).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-20 md:h-4"></div>
    </div>
  );
};
