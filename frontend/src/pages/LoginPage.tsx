import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại, vui lòng thử lại.');
    }
  };

  const demoAccounts = [
    { label: 'Học sinh', u: '9A101', p: 'Demo@123', icon: '🌱' },
    { label: 'Giáo viên', u: 'thu.ha', p: 'Demo@123', icon: '👩‍🏫' },
    { label: 'Tâm lý', u: 'co.ha', p: 'Demo@123', icon: '🧠' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-teal-500 rounded-3xl shadow-2xl mb-4 animate-bounce-gentle">
            <span className="text-4xl">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">La Bàn Tuổi Teen</h1>
          <p className="text-gray-500 text-sm">"Hiểu mình – Hiểu nghề – Hiểu người – Chọn tương lai"</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 animate-slide-up">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Đăng nhập</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-4 text-sm flex items-start gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="input-field pl-10"
                  placeholder="VD: 9A101"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="username"
                  spellCheck={false}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-10 pr-12"
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPass ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-green-600 font-semibold hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
