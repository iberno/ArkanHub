import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Archive, ExternalLink } from 'lucide-react';
import { ticketsService } from '../services/tickets';
import { Pagination } from '../components/ui';

export function ClosedTickets() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detailTicketId, setDetailTicketId] = useState<string | null>(null);
  const PAGE_SIZE = 15;

  useEffect(() => { setPage(1); }, [search]);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets', 'closed'],
    queryFn: () => ticketsService.findAll({ statusName: 'Fechado,Resolvido' }),
  });

  const filtered = (tickets ?? []).filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.protocol.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openDetail = (id: string) => {
    setDetailTicketId(id);
    (document.getElementById('closed-ticket-detail') as HTMLDialogElement)?.showModal();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Archive size={24} className="text-primary" />
        <h1 className="text-3xl font-bold">Tickets Fechados</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <label className="input input-bordered flex items-center gap-2 flex-1">
          <Search size={16} className="opacity-50" />
          <input type="text" className="grow" placeholder="Buscar por título ou protocolo..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-box shadow-sm border border-base-200">
          <table className="table">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Título</th>
                <th className="hidden md:table-cell">Solicitante</th>
                <th className="hidden xl:table-cell">Cliente</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th className="hidden lg:table-cell">Resolvido em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-base-content/50 py-8">Nenhum ticket fechado encontrado</td>
                </tr>
              ) : (
                paginated.map((ticket) => (
                  <tr key={ticket.id} className="hover cursor-pointer" onDoubleClick={() => openDetail(ticket.id)}>
                    <td className="font-mono text-xs opacity-60">{ticket.protocol}</td>
                    <td className="max-w-[200px] lg:max-w-[400px]">
                      <span className="truncate block">{ticket.title}</span>
                    </td>
                    <td className="hidden md:table-cell text-sm">{ticket.requester?.name}</td>
                    <td className="hidden xl:table-cell text-sm text-base-content/60">{ticket.client?.name || '-'}</td>
                    <td>
                      <span className="badge badge-sm" style={{ backgroundColor: ticket.status?.color ?? '#888', color: '#fff' }}>
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
                      {ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleDateString('pt-BR') : '-'}
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
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <dialog id="closed-ticket-detail" className="modal">
        <div className="modal-box w-full max-w-3xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          {detailTicketId && (
            <TicketDetailContent ticketId={detailTicketId} />
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>fechar</button>
        </form>
      </dialog>
    </div>
  );
}

function TicketDetailContent({ ticketId }: { ticketId: string }) {
  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketsService.findOne(ticketId),
  });

  if (isLoading) return <div className="flex justify-center py-8"><span className="loading loading-spinner loading-lg" /></div>;
  if (!ticket) return <p className="text-center text-base-content/50 py-8">Ticket não encontrado</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg">{ticket.title}</h3>
          <p className="text-sm text-base-content/60 font-mono">{ticket.protocol}</p>
        </div>
        <div className="flex gap-2">
          <span className="badge" style={{ backgroundColor: ticket.status?.color ?? '#888', color: '#fff' }}>{ticket.status?.name}</span>
          <span className={`badge badge-outline ${
            ticket.priority?.name === 'Crítica' ? 'badge-error' :
            ticket.priority?.name === 'Alta' ? 'badge-warning' :
            ticket.priority?.name === 'Média' ? 'badge-info' : ''
          }`}>{ticket.priority?.name}</span>
        </div>
      </div>

      <p className="text-sm whitespace-pre-wrap bg-base-200 rounded-lg p-4">{ticket.description}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div><span className="text-base-content/40 block">Solicitante</span>{ticket.requester?.name}</div>
        <div><span className="text-base-content/40 block">Cliente</span>{ticket.client?.name || '-'}</div>
        <div><span className="text-base-content/40 block">Responsável</span>{ticket.assignee?.name || '-'}</div>
        <div><span className="text-base-content/40 block">Departamento</span>{ticket.department?.name || '-'}</div>
        <div><span className="text-base-content/40 block">Abertura</span>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</div>
        <div><span className="text-base-content/40 block">Resolução</span>{ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleDateString('pt-BR') : '-'}</div>
        <div><span className="text-base-content/40 block">Fechamento</span>{ticket.closedAt ? new Date(ticket.closedAt).toLocaleDateString('pt-BR') : '-'}</div>
      </div>
    </div>
  );
}
