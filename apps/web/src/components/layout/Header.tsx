import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu, Moon, Sun, ChevronDown, LogOut, Bell, BellRing } from 'lucide-react';
import { useThemeStore } from '../../store/theme';
import { useAuthStore } from '../../store/auth';
import { notificationsService } from '../../services/notifications';

export function Header() {
  const { theme, toggle } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: notificationsService.countUnread,
    refetchInterval: 30000,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-base-200 bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/80">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 xl:px-10 max-w-[1920px] mx-auto">
        <div className="flex items-center gap-4">
          <label
            htmlFor="sidebar-drawer"
            className="btn btn-square btn-ghost btn-sm lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu size={18} />
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

        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Alternar tema"
          >
            {theme === 'wireframe' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-square relative" aria-label="Notificações">
              {(unreadCount ?? 0) > 0 ? <BellRing size={18} /> : <Bell size={18} />}
              {(unreadCount ?? 0) > 0 && (
                <span className="badge badge-error badge-xs absolute -top-1 -right-1">{unreadCount}</span>
              )}
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-50 w-80 p-2 shadow-lg border border-base-200 max-h-80 overflow-y-auto">
              {unreadCount === 0 ? (
                <li className="text-sm text-base-content/50 p-3 text-center">Nenhuma notificação</li>
              ) : (
                <li className="p-2">
                  <Link to="/notifications" className="text-sm text-primary font-medium" onClick={() => {
                    const d = document.activeElement as HTMLElement;
                    d?.blur();
                  }}>
                    Ver todas
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-2">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm hidden sm:inline max-w-[120px] truncate">
                {user?.email}
              </span>
              <ChevronDown size={14} className="opacity-50" />
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow-lg border border-base-200">
              <li>
                <button onClick={handleLogout} className="text-error gap-2">
                  <LogOut size={16} />
                  Sair
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
