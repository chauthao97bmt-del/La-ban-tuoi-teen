import React, { useState, useEffect } from 'react';

type SOSMethod = 'menu' | 'breathing' | 'grounding' | 'burn';

export const SOSPage: React.FC = () => {
  const [currentMethod, setCurrentMethod] = useState<SOSMethod>('menu');

  return (
    <div className="max-w-md mx-auto min-h-[80vh] flex flex-col items-center justify-center p-4">
      {currentMethod === 'menu' && <SOSMenu onSelect={setCurrentMethod} />}
      {currentMethod === 'breathing' && <BreathingMethod onBack={() => setCurrentMethod('menu')} />}
      {currentMethod === 'grounding' && <GroundingMethod onBack={() => setCurrentMethod('menu')} />}
      {currentMethod === 'burn' && <BurnPaperMethod onBack={() => setCurrentMethod('menu')} />}
    </div>
  );
};

const SOSMenu: React.FC<{ onSelect: (m: SOSMethod) => void }> = ({ onSelect }) => (
  <div className="text-center w-full">
    <div className="text-6xl mb-4">🆘</div>
    <h1 className="text-2xl font-bold text-gray-800 mb-2">Bạn đang cảm thấy không ổn?</h1>
    <p className="text-gray-500 mb-8">Hãy chọn một bài tập dưới đây để lấy lại bình tĩnh ngay lập tức nhé.</p>

    <div className="flex flex-col gap-4">
      <button onClick={() => onSelect('breathing')} className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-4 hover:shadow-md transition-all active:scale-95 text-left">
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl">😮‍💨</div>
        <div>
          <h3 className="font-bold text-blue-900">Hít thở 4-7-8</h3>
          <p className="text-xs text-blue-600 mt-1">Lấy lại bình tĩnh trong 1 phút</p>
        </div>
      </button>

      <button onClick={() => onSelect('grounding')} className="bg-white p-4 rounded-2xl shadow-sm border-green-100 border flex items-center gap-4 hover:shadow-md transition-all active:scale-95 text-left">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-2xl">🌱</div>
        <div>
          <h3 className="font-bold text-green-900">Kéo về thực tại 5-4-3-2-1</h3>
          <p className="text-xs text-green-600 mt-1">Khi bạn thấy hoảng loạn, mất kiểm soát</p>
        </div>
      </button>

      <button onClick={() => onSelect('burn')} className="bg-white p-4 rounded-2xl shadow-sm border-red-100 border flex items-center gap-4 hover:shadow-md transition-all active:scale-95 text-left">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-2xl">🔥</div>
        <div>
          <h3 className="font-bold text-red-900">Xả giận (Đốt giấy ảo)</h3>
          <p className="text-xs text-red-600 mt-1">Trút bỏ bực tức và đốt cháy chúng</p>
        </div>
      </button>
    </div>
  </div>
);

// --- Breathing 4-7-8 ---
const BreathingMethod: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [phase, setPhase] = useState<'IDLE' | 'IN' | 'HOLD' | 'OUT'>('IDLE');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (phase === 'IDLE') return;
    if (countdown === 0) {
      if (phase === 'IN') { setPhase('HOLD'); setCountdown(7); }
      else if (phase === 'HOLD') { setPhase('OUT'); setCountdown(8); }
      else if (phase === 'OUT') { setPhase('IN'); setCountdown(4); }
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  const start = () => { setPhase('IN'); setCountdown(4); };
  const stop = () => { setPhase('IDLE'); setCountdown(0); };

  const getCircleClass = () => {
    if (phase === 'IDLE') return 'scale-75 bg-blue-100';
    if (phase === 'IN') return 'scale-150 bg-blue-300 transition-all duration-[4000ms] ease-out';
    if (phase === 'HOLD') return 'scale-150 bg-blue-400';
    if (phase === 'OUT') return 'scale-75 bg-blue-200 transition-all duration-[8000ms] ease-in';
  };

  const getInstruction = () => {
    if (phase === 'IDLE') return 'Nhấn Bắt đầu';
    if (phase === 'IN') return 'Hít vào bằng mũi...';
    if (phase === 'HOLD') return 'Giữ hơi thở...';
    if (phase === 'OUT') return 'Thở ra từ từ bằng miệng...';
  };

  return (
    <div className="w-full flex flex-col items-center text-center">
      <button onClick={onBack} className="self-start text-gray-500 mb-8 font-medium">← Quay lại</button>
      <h2 className="text-2xl font-bold text-blue-900 mb-2">Hít thở 4-7-8</h2>
      <p className="text-gray-500 mb-16 px-4">Kỹ thuật này giúp giảm nhịp tim và làm dịu hệ thần kinh ngay lập tức.</p>

      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        <div className={`absolute w-32 h-32 rounded-full opacity-50 ${getCircleClass()}`}></div>
        <div className="z-10 text-4xl font-bold text-blue-800">{countdown > 0 ? countdown : ''}</div>
      </div>

      <div className="text-xl font-medium text-gray-700 h-8 mb-8">{getInstruction()}</div>

      {phase === 'IDLE' ? (
        <button onClick={start} className="bg-blue-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all">Bắt đầu</button>
      ) : (
        <button onClick={stop} className="bg-gray-200 text-gray-700 px-8 py-3 rounded-full font-bold hover:bg-gray-300 active:scale-95 transition-all">Dừng lại</button>
      )}
    </div>
  );
};

// --- Grounding 5-4-3-2-1 ---
const GroundingMethod: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const steps = [
    { num: 5, icon: '👁️', text: 'Nhìn thấy', desc: 'Tìm 5 đồ vật bạn đang nhìn thấy xung quanh.' },
    { num: 4, icon: '🤚', text: 'Chạm vào', desc: 'Tìm 4 thứ bạn có thể sờ, chạm hoặc cảm nhận được (ví dụ: mặt bàn, áo đang mặc).' },
    { num: 3, icon: '👂', text: 'Nghe thấy', desc: 'Tập trung lắng nghe 3 âm thanh đang diễn ra.' },
    { num: 2, icon: '👃', text: 'Ngửi thấy', desc: 'Tìm 2 mùi hương bạn có thể ngửi thấy lúc này.' },
    { num: 1, icon: '👅', text: 'Nếm được', desc: 'Cảm nhận 1 vị đang có trong miệng bạn.' }
  ];
  
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="w-full flex flex-col text-center items-center">
      <button onClick={onBack} className="self-start text-gray-500 mb-4 font-medium">← Quay lại</button>
      <h2 className="text-2xl font-bold text-green-900 mb-2">Mỏ neo 5-4-3-2-1</h2>
      <p className="text-gray-500 mb-8 px-4">Hãy làm theo từng bước để kéo tâm trí của bạn trở về với hiện tại.</p>

      {currentStep < steps.length ? (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-green-100 w-full mb-8 flex flex-col items-center">
          <div className="text-6xl mb-4">{steps[currentStep].icon}</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Tìm {steps[currentStep].num} thứ bạn có thể {steps[currentStep].text.toLowerCase()}</h3>
          <p className="text-gray-500 mb-8">{steps[currentStep].desc}</p>
          <button 
            onClick={() => setCurrentStep(c => c + 1)}
            className="bg-green-500 text-white w-full py-4 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-600 active:scale-95 transition-all"
          >
            Đã xong ({currentStep + 1}/5)
          </button>
        </div>
      ) : (
        <div className="bg-green-50 p-8 rounded-3xl w-full flex flex-col items-center">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-xl font-bold text-green-900 mb-2">Tuyệt vời!</h3>
          <p className="text-green-700 mb-8">Bạn đã hoàn thành bài tập. Bây giờ tâm trí bạn đã vững vàng hơn rồi đấy.</p>
          <button onClick={onBack} className="bg-white text-green-700 border border-green-200 w-full py-4 rounded-xl font-bold shadow-sm hover:bg-green-50 active:scale-95 transition-all">
            Hoàn tất
          </button>
        </div>
      )}
    </div>
  );
};

const MESSAGES = [
  { title: 'Đã bay theo gió! 💨', desc: 'Những muộn phiền vừa rồi đã bị thiêu rụi hoàn toàn. Hãy hít một hơi thật sâu nhé.' },
  { title: 'Cháy thành tro tàn! 🔥', desc: 'Sự bực tức của bạn đã bốc hơi thành khói đen rồi. Giờ thì mỉm cười một cái nào!' },
  { title: 'Và thế là hết! 🪄', desc: 'Đống stress này đã bị ngọn lửa thanh tẩy. Chúc bạn một ngày mới nhẹ nhõm hơn!' },
  { title: 'Bùm! Cháy rụi! 💥', desc: 'Cái sự khó ở đã tan biến. Hãy đi uống một ngụm nước mát và thư giãn nhé.' },
  { title: 'Thần Lửa đã nhận! 🌋', desc: 'Cảm xúc tiêu cực đã được gửi đi làm phân bón. Giờ thì dọn chỗ cho niềm vui thôi!' },
  { title: 'Tro bụi trở về cát bụi! 🌬️', desc: 'Lòng mệt mỏi cứ thế trôi đi. Bạn đã giỏi lắm rồi, nghỉ ngơi một chút đi!' },
  { title: 'Cháy sạch sành sanh! ✨', desc: 'Tiễn vong cục tức! Từ giờ phút này hãy chỉ để lại những điều tích cực thôi nha.' }
];

// --- Burn Paper ---
const BurnPaperMethod: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [text, setText] = useState('');
  const [burning, setBurning] = useState(false);
  const [doneMsg, setDoneMsg] = useState<typeof MESSAGES[0] | null>(null);

  const handleBurn = () => {
    if (!text.trim()) return;
    setBurning(true);
    setTimeout(() => {
      setBurning(false);
      setDoneMsg(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
      setText('');
    }, 3000);
  };

  const reset = () => setDoneMsg(null);

  return (
    <div className="w-full flex flex-col items-center text-center overflow-hidden relative min-h-[400px]">
      <style>{`
        @keyframes fire-particle {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; filter: hue-rotate(0deg); }
          100% { transform: translateY(-150px) scale(0) rotate(45deg); opacity: 0; filter: hue-rotate(-20deg); }
        }
        @keyframes smoke-particle {
          0% { transform: translateY(0) scale(1); opacity: 0.5; }
          100% { transform: translateY(-200px) scale(3); opacity: 0; }
        }
        @keyframes burn-paper {
          0% { background: #fefce8; transform: scale(1); opacity: 1; filter: grayscale(0) sepia(0) brightness(1); }
          30% { background: #f97316; transform: scale(0.95); opacity: 1; filter: grayscale(0.5) sepia(0.5) brightness(0.6); }
          70% { background: #1a1a1a; transform: scale(0.6) rotate(5deg); opacity: 0.8; filter: grayscale(1) sepia(1) brightness(0.2); }
          100% { background: #000; transform: scale(0) rotate(15deg) translateY(100px); opacity: 0; filter: blur(5px); }
        }
        .animate-burn {
          animation: burn-paper 2.5s ease-in forwards;
        }
        .fire-part { position: absolute; font-size: 2rem; animation: fire-particle 1s linear infinite; }
        .smoke-part { position: absolute; font-size: 3rem; color: rgba(100,100,100,0.5); animation: smoke-particle 1.5s linear infinite; }
      `}</style>
      <button onClick={onBack} className="self-start text-gray-500 mb-4 font-medium z-10">← Quay lại</button>
      <h2 className="text-2xl font-bold text-red-900 mb-2 z-10">Đốt giấy xả giận</h2>
      <p className="text-gray-500 mb-6 px-4 z-10">Hãy viết ra tất cả những điều khiến bạn bực tức, khó chịu, và sau đó đốt cháy nó đi!</p>

      {!doneMsg ? (
        <div className="w-full relative">
          {burning && (
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="relative w-full h-full flex justify-center items-end pb-10">
                <div className="fire-part" style={{left: '20%', animationDelay: '0s'}}>🔥</div>
                <div className="fire-part" style={{left: '50%', animationDelay: '0.2s'}}>🔥</div>
                <div className="fire-part" style={{left: '80%', animationDelay: '0.1s', fontSize: '3rem'}}>🔥</div>
                <div className="fire-part" style={{left: '30%', animationDelay: '0.4s', fontSize: '2.5rem'}}>🔥</div>
                <div className="fire-part" style={{left: '60%', animationDelay: '0.3s', fontSize: '2rem'}}>🔥</div>
                <div className="smoke-part" style={{left: '40%', animationDelay: '0.5s'}}>☁️</div>
                <div className="smoke-part" style={{left: '60%', animationDelay: '0.7s'}}>☁️</div>
              </div>
            </div>
          )}
          <div className={`bg-yellow-50 p-6 rounded-md shadow-md border-2 border-yellow-200 mb-6 relative transition-all ${burning ? 'animate-burn text-transparent' : ''}`} style={{ minHeight: '200px' }}>
            <div className={`absolute top-2 left-0 right-0 flex justify-center opacity-20 ${burning ? 'hidden' : ''}`}><div className="w-4 h-4 rounded-full bg-black"></div></div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Viết những bực tức của bạn vào đây..."
              className={`w-full h-32 mt-4 bg-transparent resize-none outline-none font-handwriting text-lg text-gray-800 placeholder-gray-400 ${burning ? 'opacity-0' : ''}`}
              autoFocus
              readOnly={burning}
            ></textarea>
          </div>
          <button
            onClick={handleBurn}
            disabled={!text.trim() || burning}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all z-10 relative ${!text.trim() ? 'bg-gray-300' : 'bg-red-500 hover:bg-red-600 active:scale-95 shadow-red-200'} ${burning ? 'scale-0 opacity-0' : ''}`}
          >
            🔥 Đốt tờ giấy này
          </button>
        </div>

      ) : (
        <div className="w-full flex flex-col items-center animate-fade-in mt-10">
          <div className="text-6xl mb-4">💨</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{doneMsg.title}</h3>
          <p className="text-gray-500 mb-8">{doneMsg.desc}</p>
          <button onClick={reset} className="text-red-500 font-medium hover:underline">Viết thêm tờ khác</button>
        </div>
      )}
    </div>
  );
};
