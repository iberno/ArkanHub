import { NavLink } from 'react-router-dom';

const menu = [
  { label: 'Dashboard', path: '/', icon: '📊' },
  { label: 'Tickets', path: '/tickets', icon: '🎫' },
  { label: 'Usuários', path: '/users', icon: '👥' },
  { label: 'SLAs', path: '/slas', icon: '⏱' },
];

export function Sidebar() {
  return (
    <div className="drawer-side">
      <label htmlFor="sidebar-drawer" className="drawer-overlay" />
      <aside className="bg-base-100 min-h-screen w-64 p-4">
        <div className="text-2xl font-bold mb-8 px-4">Alka ITSM</div>
        <ul className="menu p-0">
          {menu.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? 'active' : ''
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
