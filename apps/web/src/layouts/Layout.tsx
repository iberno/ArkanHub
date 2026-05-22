import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="drawer lg:drawer-open">
      <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Header />
        <main className="flex-1 bg-base-200 min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
      <Sidebar />
    </div>
  );
}
