import { Link } from 'react-router-dom';
import { useThemeStore } from '../../store/theme';

export function Header() {
  const { theme, toggle } = useThemeStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-base-200 bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/80">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-4">
          <label
            htmlFor="sidebar-drawer"
            className="btn btn-square btn-ghost btn-sm lg:hidden"
            aria-label="Abrir menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-5 h-5 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-content font-bold text-xs">
              A
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:inline">
              ArkanHub
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Alternar tema"
          >
            {theme === 'wireframe' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-sm btn-circle avatar"
            >
              <div className="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-medium">
                A
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
