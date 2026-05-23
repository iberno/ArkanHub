import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, ExternalLink } from 'lucide-react';
import { ticketsService } from '../services/tickets';
import { TicketCreateModal } from '../components/tickets/TicketCreateModal';
import { TicketDetailModal } from '../components/tickets/TicketDetailModal';
import { useAuthStore } from '../store/auth';

type FilterMode = 'all' | 'mine' | 'unassigned';

export function Tickets() {
  const user = useAuthStore((s) => s.user);
  const createRef = useRef<HTMLDialogElement | null>(null);
  const detailRef = useRef<HTMLDialogElement | null>(null);
  const [detailTicketId, setDetailTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets', filterMode],
    queryFn: () => {
      if (filterMode === 'mine') return ticketsService.findAll({ assignedTo: user!.id });
      if (filterMode === 'unassigned') return ticketsService.findAll({ unassigned: true });
      return ticketsService.findAll();
    },
  });

  const filtered = (tickets ?? []).filter((t) => {
    if (statusFilter && t.status?.name !== statusFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.protocol.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statuses = [...new Set(tickets?.map((t) => t.status?.name).filter(Boolean))];

  const openDetail = (id: string) => {
    setDetailTicketId(id);
    detailRef.current?.showModal();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <button className="btn btn-primary" onClick={() => createRef.current?.showModal()}>
          <Plus size={18} />
          Novo Ticket
        </button>
      </div>

      <TicketCreateModal modalRef={createRef} />
      <TicketDetailModal
        modalRef={detailRef}
        ticketId={detailTicketId}
        onClose={() => setDetailTicketId(null)}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <label className="input input-bordered flex items-center gap-2 flex-1">
          <Search size={16} className="opacity-50" />
          <input
            type="text"
            className="grow"
            placeholder="Buscar por título ou protocolo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          className="select select-bordered w-full sm:w-40"
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value as FilterMode)}
        >
          <option value="all">Todos</option>
          <option value="mine">Meus tickets</option>
          <option value="unassigned">Não atribuídos</option>
        </select>
        <select
          className="select select-bordered w-full sm:w-44"
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
                <th className="hidden 2xl:table-cell">Cliente</th>
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
                  <tr key={ticket.id} className="hover cursor-pointer" onDoubleClick={() => openDetail(ticket.id)}>
                    <td className="font-mono text-xs">{ticket.protocol}</td>
                    <td className="max-w-[200px] lg:max-w-[300px] 2xl:max-w-[500px]">
                      <span className="truncate block">{ticket.title}</span>
                    </td>
                    <td className="hidden md:table-cell text-sm">{ticket.requester?.name}</td>
                    <td className="hidden 2xl:table-cell text-sm text-base-content/60">{ticket.client?.name || '-'}</td>
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
                      <button className="btn btn-ghost btn-xs" onClick={() => openDetail(ticket.id)}>
                        <ExternalLink size={14} />
                      </button>
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
