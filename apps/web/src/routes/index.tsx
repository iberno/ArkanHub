import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { Tickets } from '../pages/Tickets';
import { TicketDetail } from '../pages/TicketDetail';
import { Users } from '../pages/Users';
import { Slas } from '../pages/Slas';
import { Login } from '../pages/Login';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tickets" element={<Tickets />} />
      <Route path="/tickets/:id" element={<TicketDetail />} />
      <Route path="/users" element={<Users />} />
      <Route path="/slas" element={<Slas />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
