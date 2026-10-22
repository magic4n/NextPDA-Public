import { create } from 'zustand';
import { User } from '../types';
import { getApiBaseUrl } from '../services/platform';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  sessionExpired: boolean;
  setAuthModalOpen: (open: boolean) => void;
  setUser: (user: User | null, token?: string) => void;
  loginWithCredentials: (login: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithToken: (token: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  triggerSessionExpired: () => void;
}

const STORAGE_USER_KEY = 'nextpda_user';
const STORAGE_TOKEN_KEY = 'nextpda_token';

const storedUser = localStorage.getItem(STORAGE_USER_KEY);
const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  isAuthModalOpen: false,
  sessionExpired: false,

  setAuthModalOpen: (open) => set({ isAuthModalOpen: open, sessionExpired: false }),

  setUser: (user, token) => {
    if (user && token) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
      set({ user, token, isAuthenticated: true, sessionExpired: false, isAuthModalOpen: false });
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  loginWithCredentials: async (login, password) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user));
        localStorage.setItem(STORAGE_TOKEN_KEY, data.user.token || data.token);
        set({
          user: data.user,
          token: data.user.token || data.token,
          isAuthenticated: true,
          isAuthModalOpen: false,
          sessionExpired: false,
        });
        return { success: true };
      }
      return { success: false, error: data.error || 'Неверный логин или пароль 4PDA' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Ошибка соединения с сервером авторизации' };
    }
  },

  loginWithToken: async (token) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user));
        localStorage.setItem(STORAGE_TOKEN_KEY, data.user.token || token);
        set({
          user: data.user,
          token: data.user.token || token,
          isAuthenticated: true,
          isAuthModalOpen: false,
          sessionExpired: false,
        });
        return { success: true };
      }
      return { success: false, error: data.error || 'Сессионный токен 4PDA недействителен' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Ошибка проверки токена на сервере' };
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  triggerSessionExpired: () => {
    set({ sessionExpired: true, isAuthModalOpen: true });
  },
}));
