import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

interface AuthStore {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  hasPermission: (key: string) => boolean;
  hasRole: (role: string) => boolean;
  setAuth: (data: { accessToken: string; refreshToken: string; user: User }) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

function getStored(): { token: string | null; refreshToken: string | null; user: User | null } {
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

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...getStored(),
  isLoading: false,
  hasPermission: (key: string) => {
    const { user } = get();
    return user?.permissions?.includes(key) ?? false;
  },
  hasRole: (role: string) => {
    const { user } = get();
    return user?.roles?.includes(role) ?? false;
  },
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
