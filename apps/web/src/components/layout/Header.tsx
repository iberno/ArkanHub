import { Link } from 'react-router-dom';

export function Header() {
  return (
    <div className="navbar bg-base-100 shadow-sm px-4">
      <div className="flex-none lg:hidden">
        <label htmlFor="sidebar-drawer" className="btn btn-square btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>
      </div>
      <div className="flex-1">
        <Link to="/" className="text-xl font-bold">Alka ITSM</Link>
      </div>
      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              A
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
