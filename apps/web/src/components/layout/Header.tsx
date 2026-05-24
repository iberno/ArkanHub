import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Menu, Moon, Sun, ChevronDown, LogOut, Bell, BellRing, UserCircle } from 'lucide-react';
import { useThemeStore } from '../../store/theme';
import { useAuthStore } from '../../store/auth';
import { notificationsService } from '../../services/notifications';
import { useSocket } from '../../hooks/useSocket';

export function Header() {
  const { theme, toggle } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const socketRef = useSocket();

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: notificationsService.countUnread,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const onUnread = (count: number) => {
      queryClient.setQueryData(['notifications-unread'], count);
    };
    socket.on('notification:unread', onUnread);
    return () => { socket.off('notification:unread', onUnread); };
  }, [socketRef.current, queryClient]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const onNew = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    };
    socket.on('notification:new', onNew);
    return () => { socket.off('notification:new', onNew); };
  }, [socketRef.current, queryClient]);

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
                <Link to="/profile" className="gap-2" onClick={() => { (document.activeElement as HTMLElement)?.blur(); }}>
                  <UserCircle size={16} />
                  Perfil
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="gap-2" onClick={() => { (document.activeElement as HTMLElement)?.blur(); }}>
                  <Bell size={16} />
                  Notificações
                </Link>
              </li>
              <li><hr className="my-1" /></li>
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
