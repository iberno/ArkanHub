import { create } from 'zustand';

interface AuthStore {
  token: string | null;
  refreshToken: string | null;
  user: { id: string; email: string } | null;
  isLoading: boolean;
  setAuth: (data: { accessToken: string; refreshToken: string; user: { id: string; email: string } }) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

function getStored() {
  try {
    const token = localStorage.getItem('arkanhub-token');
    const refresh = localStorage.getItem('arkanhub-refresh');
    const user = localStorage.getItem('arkanhub-user');
    return {
      token,
      refreshToken: refresh,
      user: user ? JSON.parse(user) : null,
    };
  } catch {
    return { token: null, refreshToken: null, user: null };
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...getStored(),
  isLoading: false,
  setAuth: (data) => {
    localStorage.setItem('arkanhub-token', data.accessToken);
    localStorage.setItem('arkanhub-refresh', data.refreshToken);
    localStorage.setItem('arkanhub-user', JSON.stringify(data.user));
    set({ token: data.accessToken, refreshToken: data.refreshToken, user: data.user });
  },
  logout: () => {
    localStorage.removeItem('arkanhub-token');
    localStorage.removeItem('arkanhub-refresh');
    localStorage.removeItem('arkanhub-user');
    set({ token: null, refreshToken: null, user: null });
  },
  setLoading: (v) => set({ isLoading: v }),
}));
