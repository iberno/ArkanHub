import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Dashboard } from '../pages/Dashboard';
import { Tickets } from '../pages/Tickets';
import { Users } from '../pages/Users';
import { Slas } from '../pages/Slas';
import { Approvals } from '../pages/Approvals';
import { Login } from '../pages/Login';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
      <Route path="/tickets/new" element={<Navigate to="/tickets" replace />} />
      <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/slas" element={<ProtectedRoute><Slas /></ProtectedRoute>} />
      <Route path="/approvals" element={<ProtectedRoute><Approvals /></ProtectedRoute>} />
    </Routes>
  );
}
