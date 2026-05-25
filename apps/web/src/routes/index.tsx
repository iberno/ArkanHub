import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { getDefaultRoute } from '../config/navigation';
import { Landing } from '../pages/Landing';
import { Dashboard } from '../pages/Dashboard';
import { Tickets } from '../pages/Tickets';
import { TicketNew } from '../pages/TicketNew';
import { ClosedTickets } from '../pages/ClosedTickets';
import { Users } from '../pages/Users';
import { Slas } from '../pages/Slas';
import { Approvals } from '../pages/Approvals';
import { Knowledge } from '../pages/Knowledge';
import { Workflows } from '../pages/Workflows';
import { Problems } from '../pages/Problems';
import { Changes } from '../pages/Changes';
import { Companies } from '../pages/Companies';
import { Departments } from '../pages/Departments';
import { Clients } from '../pages/Clients';
import { Reports } from '../pages/Reports';
import { Notifications } from '../pages/Notifications';
import { Categories } from '../pages/Categories';
import { Profile } from '../pages/Profile';
import { Login } from '../pages/Login';
import { Assets } from '../pages/Assets';
import { Projects } from '../pages/Projects';
import { ProjectDetail } from '../pages/ProjectDetail';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function HomeRedirect() {
  const user = useAuthStore((s) => s.user);
  const defaultRoute = getDefaultRoute(user?.roles ?? []);
  if (defaultRoute === '/') return <Dashboard />;
  return <Navigate to={defaultRoute} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />
      <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
      <Route path="/tickets/new" element={<ProtectedRoute><TicketNew /></ProtectedRoute>} />
      <Route path="/tickets/closed" element={<ProtectedRoute><ClosedTickets /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/slas" element={<ProtectedRoute><Slas /></ProtectedRoute>} />
      <Route path="/approvals" element={<ProtectedRoute><Approvals /></ProtectedRoute>} />
      <Route path="/knowledge" element={<ProtectedRoute><Knowledge /></ProtectedRoute>} />
      <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
      <Route path="/problems" element={<ProtectedRoute><Problems /></ProtectedRoute>} />
      <Route path="/changes" element={<ProtectedRoute><Changes /></ProtectedRoute>} />
      <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
      <Route path="/departments" element={<ProtectedRoute><Departments /></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
    </Routes>
  );
}
