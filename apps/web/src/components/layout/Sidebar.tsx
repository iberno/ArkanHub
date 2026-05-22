import { NavLink } from 'react-router-dom';

const menu = [
  { label: 'Dashboard', path: '/', icon: '📊' },
  { label: 'Tickets', path: '/tickets', icon: '🎫' },
  { label: 'Usuários', path: '/users', icon: '👥' },
  { label: 'SLAs', path: '/slas', icon: '⏱' },
];

export function Sidebar() {
  return (
    <div className="drawer-side z-50">
      <label htmlFor="sidebar-drawer" className="drawer-overlay" />
      <aside className="bg-base-100 min-h-screen w-72 xl:w-80 overflow-y-auto">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-base-200">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-content font-bold text-sm">
            A
          </div>
          <span className="text-xl font-bold tracking-tight">ArkanHub</span>
        </div>
        <ul className="menu p-4 gap-1">
          {menu.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
