import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Building2,
  Building,
  UserPlus,
  Clock,
  ClipboardList,
  BookOpen,
  Bell,
  Workflow,
  BarChart3,
  AlertTriangle,
  GitPullRequest,
  Tags,
  UserCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useSidebarStore } from '../../store/sidebar';

const menu = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Tickets', path: '/tickets', icon: Ticket },
  { label: 'Usuários', path: '/users', icon: Users },
  { label: 'Empresas', path: '/companies', icon: Building2 },
  { label: 'Departamentos', path: '/departments', icon: Building },
  { label: 'Clientes', path: '/clients', icon: UserPlus },
  { label: 'Categorias', path: '/ticket-categories', icon: Tags },
  { label: 'SLAs', path: '/slas', icon: Clock },
  { label: 'Aprovações', path: '/approvals', icon: ClipboardList },
  { label: 'Conhecimento', path: '/knowledge', icon: BookOpen },
  { label: 'Workflows', path: '/workflows', icon: Workflow },
  { label: 'Problemas', path: '/problems', icon: AlertTriangle },
  { label: 'Mudanças', path: '/changes', icon: GitPullRequest },
  { label: 'BI & Relatórios', path: '/reports', icon: BarChart3 },
  { label: 'Notificações', path: '/notifications', icon: Bell },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebarStore();

  return (
    <div className="drawer-side z-50">
      <label htmlFor="sidebar-drawer" className="drawer-overlay" />
      <aside
        className={`bg-base-100 min-h-screen border-r border-base-200 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-56 xl:w-64'
        }`}
      >
        <div className={`flex items-center border-b border-base-200 h-16 ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'}`}>
          {!collapsed && (
            <>
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-content font-bold text-xs shrink-0">
                A
              </div>
              <span className="font-bold tracking-tight">ArkanHub</span>
            </>
          )}
          {collapsed && (
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-content font-bold text-xs">
              A
            </div>
          )}
        </div>

        <button
          onClick={toggle}
          className={`btn btn-ghost btn-sm btn-square mt-2 ${collapsed ? 'mx-auto' : 'ml-2'}`}
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>

        <ul className={`menu mt-2 ${collapsed ? 'px-1' : 'p-2'} gap-1`}>
          {menu.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
                    collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
          <li className="border-t border-base-200 pt-2 mt-2">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                }`
              }
              title={collapsed ? 'Perfil' : undefined}
            >
              <UserCircle size={20} />
              {!collapsed && <span>Perfil</span>}
            </NavLink>
          </li>
        </ul>
      </aside>
    </div>
  );
}
