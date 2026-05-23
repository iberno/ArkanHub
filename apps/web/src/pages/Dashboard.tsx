import { useQuery } from '@tanstack/react-query';
import { ticketsService } from '../services/tickets';

export function Dashboard() {
  const { data: tickets } = useQuery({
    queryKey: ['tickets'],
    queryFn: ticketsService.findAll,
  });

  const total = tickets?.length ?? 0;
  const criticos = tickets?.filter((t) => t.priority?.name === 'Crítica').length ?? 0;
  const abertos = tickets?.filter((t) => t.status?.name === 'Aberto' || t.status?.name === 'Em Andamento').length ?? 0;

  const stats = [
    { label: 'Tickets Abertos', value: abertos, color: 'text-primary' },
    { label: 'Críticos', value: criticos, color: 'text-error' },
    { label: 'Total', value: total, color: 'text-base-content' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="stat bg-base-100 rounded-box shadow-sm border border-base-200">
            <div className="stat-title text-sm">{s.label}</div>
            <div className={`stat-value ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-base-100 rounded-box shadow-sm border border-base-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Últimos Tickets</h2>
        {!tickets || tickets.length === 0 ? (
          <p className="text-base-content/50 text-sm">Nenhum ticket encontrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Título</th>
                  <th>Status</th>
                  <th>Prioridade</th>
                  <th>Abertura</th>
                </tr>
              </thead>
              <tbody>
                {tickets.slice(0, 5).map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="font-mono text-xs">{ticket.protocol}</td>
                    <td className="max-w-[200px] truncate">{ticket.title}</td>
                    <td>
                      <span
                        className="badge badge-sm"
                        style={{ backgroundColor: ticket.status?.color ?? '#888', color: '#fff' }}
                      >
                        {ticket.status?.name}
                      </span>
                    </td>
                    <td>{ticket.priority?.name}</td>
                    <td className="text-sm text-base-content/60">
                      {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
