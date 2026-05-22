import { create } from 'zustand';

export type Theme = 'wireframe' | 'business';

interface ThemeStore {
  theme: Theme;
  toggle: () => void;
}

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem('arkanhub-theme') as Theme | null;
    if (stored === 'wireframe' || stored === 'business') return stored;
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'business'
    : 'wireframe';
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: getInitialTheme(),
  toggle: () =>
    set((state) => {
      const next = state.theme === 'wireframe' ? 'business' : 'wireframe';
      try {
        localStorage.setItem('arkanhub-theme', next);
      } catch {}
      return { theme: next };
    }),
}));
