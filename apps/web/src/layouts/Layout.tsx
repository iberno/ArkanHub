import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { ToastContainer } from '../components/ui/ToastContainer';
import { SocketListener } from '../components/SocketListener';

export function Layout({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  if (isLogin || !token) {
    return <>{children}</>;
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Header />
        <SocketListener />
        <ToastContainer />
        <main className="flex-1 bg-base-200 min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
      <Sidebar />
    </div>
  );
}
