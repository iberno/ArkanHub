import { useQuery } from '@tanstack/react-query';
import { Ticket, AlertTriangle, CheckCircle, Layers } from 'lucide-react';
import { ticketsService } from '../services/tickets';

export function Dashboard() {
  const { data: tickets } = useQuery({
    queryKey: ['tickets'],
    queryFn: ticketsService.findAll,
  });

  const total = tickets?.length ?? 0;
  const criticos = tickets?.filter((t) => t.priority?.name === 'Crítica').length ?? 0;
  const abertos = tickets?.filter((t) => t.status?.name === 'Aberto' || t.status?.name === 'Em Andamento').length ?? 0;
  const resolvidos = tickets?.filter((t) => t.status?.name === 'Resolvido' || t.status?.name === 'Fechado').length ?? 0;

  const stats = [
    { label: 'Tickets Abertos', value: abertos, icon: Ticket, color: 'text-primary' },
    { label: 'Críticos', value: criticos, icon: AlertTriangle, color: 'text-error' },
    { label: 'Resolvidos', value: resolvidos, icon: CheckCircle, color: 'text-success' },
    { label: 'Total', value: total, icon: Layers, color: 'text-base-content' },
  ];

  const statusCount = (tickets ?? []).reduce<Record<string, number>>((acc, t) => {
    const name = t.status?.name ?? 'Sem status';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat bg-base-100 rounded-box shadow-sm border border-base-200">
              <div className="flex items-center gap-2 stat-title text-sm">
                <Icon size={16} className={s.color} />
                {s.label}
              </div>
              <div className={`stat-value ${s.color}`}>{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-base-100 rounded-box shadow-sm border border-base-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Ticket size={18} className="text-primary" />
            <h2 className="text-lg font-semibold">Últimos Tickets</h2>
          </div>
          {!tickets || tickets.length === 0 ? (
            <p className="text-base-content/50 text-sm">Nenhum ticket encontrado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Protocolo</th>
                    <th>Título</th>
                    <th className="hidden md:table-cell">Solicitante</th>
                    <th>Status</th>
                    <th>Prioridade</th>
                    <th className="hidden md:table-cell">Abertura</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.slice(0, 8).map((ticket) => (
                    <tr key={ticket.id} className="hover">
                      <td className="font-mono text-xs">{ticket.protocol}</td>
                      <td className="max-w-[200px] 2xl:max-w-[400px]">
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
                      <td>{ticket.priority?.name}</td>
                      <td className="hidden md:table-cell text-sm text-base-content/60">
                        {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-base-100 rounded-box shadow-sm border border-base-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Por Status</h2>
          {Object.keys(statusCount).length === 0 ? (
            <p className="text-base-content/50 text-sm">Nenhum dado</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusCount).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm">{status}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 2xl:w-32 h-2 bg-base-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(count / total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
