import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsService } from '../../services/tickets';
import type { Ticket } from '../../types/api';

interface KanbanBoardProps {
  projectId: string;
  tickets: Ticket[];
}

const statusOrder = ['Aberto', 'Em Andamento', 'Aguardando', 'Resolvido', 'Fechado'];

export function KanbanBoard({ projectId, tickets }: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const [dragId, setDragId] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: ({ ticketId, statusId }: { ticketId: string; statusId: string }) =>
      ticketsService.update(ticketId, { statusId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
  });

  const statusMap = new Map<string, { id: string; color: string }>();
  for (const t of tickets) {
    if (t.status && !statusMap.has(t.status.name)) {
      statusMap.set(t.status.name, { id: t.status.id, color: t.status.color });
    }
  }

  const grouped = new Map<string, Ticket[]>();
  for (const s of statusOrder) grouped.set(s, []);
  for (const t of tickets) {
    const name = t.status?.name ?? 'Aberto';
    const col = grouped.get(name);
    if (col) col.push(t);
    else grouped.set(name, [t]);
  }

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    setDragId(ticketId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ticketId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatusName: string) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData('text/plain');
    if (!ticketId) return;

    const targetStatus = statusMap.get(targetStatusName);
    if (!targetStatus) return;

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.status?.name === targetStatusName) return;

    updateMutation.mutate({ ticketId, statusId: targetStatus.id });
    setDragId(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 300 }}>
      {statusOrder.map((statusName) => {
        const colTickets = grouped.get(statusName) ?? [];
        const status = statusMap.get(statusName);

        return (
          <div
            key={statusName}
            className="bg-base-200 rounded-box p-3 shrink-0"
            style={{ width: 280, minHeight: 200 }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, statusName)}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: status?.color ?? '#888' }}
              />
              <span className="font-semibold text-sm">{statusName}</span>
              <span className="badge badge-xs ml-auto">{colTickets.length}</span>
            </div>

            <div className="space-y-2">
              {colTickets.length === 0 && (
                <p className="text-xs text-base-content/30 text-center py-6">Nenhum ticket</p>
              )}
              {colTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, ticket.id)}
                  onDragEnd={() => setDragId(null)}
                  className={`bg-base-100 rounded-box border border-base-300 p-3 cursor-grab active:cursor-grabbing
                    ${dragId === ticket.id ? 'opacity-50 shadow-lg' : 'hover:shadow-md'}
                    transition-shadow duration-150`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] text-base-content/40">{ticket.protocol}</span>
                    <span
                      className="badge badge-xs"
                      style={{
                        backgroundColor: ticket.priority?.name === 'Crítica' ? '#ef4444'
                          : ticket.priority?.name === 'Alta' ? '#f97316'
                          : ticket.priority?.name === 'Média' ? '#3b82f6'
                          : '#6b7280',
                        color: '#fff',
                      }}
                    >
                      {ticket.priority?.name}
                    </span>
                  </div>
                  <p className="text-sm font-medium mt-1 line-clamp-2">{ticket.title}</p>
                  <p className="text-[10px] text-base-content/40 mt-1">
                    {ticket.assignee?.name ?? 'Não atribuído'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
