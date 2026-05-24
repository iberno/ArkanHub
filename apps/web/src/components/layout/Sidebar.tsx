import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useSidebarStore } from '../../store/sidebar';
import { useAuthStore } from '../../store/auth';
import { navCategories } from '../../config/navigation';

export function Sidebar() {
  const { collapsed, toggle } = useSidebarStore();
  const hasPermission = useAuthStore((s) => s.hasPermission);

  return (
    <div className="drawer-side z-50">
      <label htmlFor="sidebar-drawer" className="drawer-overlay" />
      <aside
        className={`relative bg-base-100 min-h-screen border-r border-base-200 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-16' : 'w-56 xl:w-64'
        }`}
      >
        <button
          onClick={toggle}
          className="absolute top-3 -right-3 z-50 btn btn-ghost btn-sm btn-square bg-base-100 border border-base-200 shadow-sm rounded-full"
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>

        <div className={`flex items-center border-b border-base-200 h-16 shrink-0 ${collapsed ? 'justify-center' : 'gap-3 px-4'}`}>
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-content font-bold text-xs shrink-0">
            A
          </div>
          {!collapsed && (
            <span className="font-bold tracking-tight">ArkanHub</span>
          )}
        </div>

        <div className="menu flex-1 overflow-y-auto gap-1">
          {navCategories.map((cat, ci) => {
            const visible = cat.items.filter(
              (item) => !item.requiredPermission || hasPermission(item.requiredPermission),
            );
            if (visible.length === 0) return null;

            return (
              <div key={ci}>
                {!!cat.title && !collapsed && (
                  <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-base-content/30">
                    {cat.title}
                  </div>
                )}
                <ul className="gap-1">
                  {visible.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center rounded-lg text-sm font-medium transition-colors ${
                            collapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2.5'
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
                </ul>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
