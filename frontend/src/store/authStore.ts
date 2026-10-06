import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

interface User {
  id: string;
  username: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'PSYCHOLOGIST';
  fullName: string;
  profile?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', { username, password });
          const { token, user } = res.data;
          localStorage.setItem('auth_token', token);
          set({ token, user, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        set({ user: null, token: null });
      },
      refreshUser: async () => {
        const { token } = get();
        if (!token) { get().logout(); return; }
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data });
        } catch (err: any) {
          // Token hết hạn hoặc không hợp lệ → tự động logout
          get().logout();
        }
      }
    }),
    {
      name: 'auth_user',
      partialize: (state) => ({ user: state.user, token: state.token }),
      // Xóa state cũ không tương thích khi version thay đổi
      version: 2,
      migrate: (persistedState: any) => {
        return { user: null, token: null };
      },
    }
  )
);
