import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ username: '', password: '', fullName: '', classCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng ký thất bại, vui lòng thử lại.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl shadow-xl mb-4">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">La Bàn Tuổi Teen</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Đăng ký tài khoản</h2>
          <p className="text-sm text-gray-500 mb-6">Bắt đầu hành trình khám phá bản thân 🧭</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
              <input
                type="text"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                className="input-field"
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập *</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/\s/g, '') }))}
                className="input-field"
                placeholder="nguyenvana"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu *</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field"
                placeholder="Ít nhất 6 ký tự"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mã lớp <span className="text-gray-400">(nếu có)</span></label>
              <input
                type="text"
                value={form.classCode}
                onChange={e => setForm(f => ({ ...f, classCode: e.target.value.toUpperCase() }))}
                className="input-field"
                placeholder="VD: LBT15-9A1"
              />
              <p className="text-xs text-gray-400 mt-1">Nhập mã lớp do giáo viên cung cấp để tham gia lớp học</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? '⟳ Đang đăng ký...' : '🌱 Tạo tài khoản'}
            </button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-green-600 font-semibold hover:underline">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
