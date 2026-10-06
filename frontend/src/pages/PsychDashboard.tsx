import React from 'react';
import { TalkInbox } from '../components/TalkInbox';

export const PsychDashboard: React.FC = () => (
  <div className="animate-fade-in pb-20 space-y-5">
    <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🧠</div>
        <div>
          <h1 className="font-bold text-xl">Phòng Tư vấn Tâm lý Học đường</h1>
          <p className="text-violet-200 text-sm">Lắng nghe – Thấu hiểu – Đồng hành cùng học sinh</p>
        </div>
      </div>
    </div>
    <TalkInbox mode="psych" />
  </div>
);
