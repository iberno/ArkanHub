import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ticketsService } from '../services/tickets';

export function Tickets() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: ticketsService.findAll,
  });

  const filtered = (tickets ?? []).filter((t) => {
    if (statusFilter && t.status?.name !== statusFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.protocol.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statuses = [...new Set(tickets?.map((t) => t.status?.name).filter(Boolean))];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <Link to="/tickets/new" className="btn btn-primary">
          Novo Ticket
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <label className="input input-bordered flex items-center gap-2 flex-1">
          <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="grow"
            placeholder="Buscar por título ou protocolo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          className="select select-bordered w-full sm:w-48"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos os status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-box shadow-sm border border-base-200">
          <table className="table">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Título</th>
                <th className="hidden md:table-cell">Solicitante</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th className="hidden lg:table-cell">Abertura</th>
                <th className="hidden 2xl:table-cell">Atribuído</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-base-content/50 py-8">
                    Nenhum ticket encontrado
                  </td>
                </tr>
              ) : (
                filtered.map((ticket) => (
                  <tr key={ticket.id} className="hover">
                    <td className="font-mono text-xs">{ticket.protocol}</td>
                    <td className="max-w-[200px] lg:max-w-[300px] 2xl:max-w-[500px]">
                      <span className="truncate block">{ticket.title}</span>
                    </td>
                    <td className="hidden md:table-cell text-sm">{ticket.requester?.name}</td>
                    <td>
                      <span
                        className="badge badge-sm"
                        style={{ backgroundColor: ticket.status?.color ?? '#888', color: '#fff' }}
                      >
                        {ticket.status?.name}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-sm badge-outline ${
                        ticket.priority?.name === 'Crítica' ? 'badge-error' :
                        ticket.priority?.name === 'Alta' ? 'badge-warning' :
                        ticket.priority?.name === 'Média' ? 'badge-info' : ''
                      }`}>
                        {ticket.priority?.name}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell text-sm text-base-content/60">
                      {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="hidden 2xl:table-cell text-sm text-base-content/60">
                      {ticket.assignee?.name || '-'}
                    </td>
                    <td>
                      <Link to={`/tickets/${ticket.id}`} className="btn btn-ghost btn-xs">
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
