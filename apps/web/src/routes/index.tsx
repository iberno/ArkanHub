import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Dashboard } from '../pages/Dashboard';
import { Tickets } from '../pages/Tickets';
import { TicketDetail } from '../pages/TicketDetail';

import { Users } from '../pages/Users';
import { Slas } from '../pages/Slas';
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
      <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/slas" element={<ProtectedRoute><Slas /></ProtectedRoute>} />
    </Routes>
  );
}
