import { useQuery } from '@tanstack/react-query';
import {
  BarChart3, Ticket, Clock, AlertTriangle, CheckCircle,
  Layers, TrendingUp, Target, Star, Building2, ArrowUp, ArrowDown, Minus,
} from 'lucide-react';
import { biService } from '../services/bi';

export function Reports() {
  const period = 30;

  const { data: overview, isLoading } = useQuery({
    queryKey: ['bi-overview'],
    queryFn: biService.overview,
  });

  const { data: dist } = useQuery({
    queryKey: ['bi-distribution'],
    queryFn: biService.distribution,
  });

  const { data: trends } = useQuery({
    queryKey: ['bi-trends', period],
    queryFn: () => biService.trends(period),
  });

  const { data: monthly } = useQuery({
    queryKey: ['bi-monthly'],
    queryFn: biService.monthly,
  });

  const { data: perfDepts } = useQuery({
    queryKey: ['bi-perf-depts'],
    queryFn: biService.performanceDepartments,
  });

  if (isLoading) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>;

  const metricCards = overview ? [
    { label: 'Backlog', value: overview.backlog, icon: Layers, color: 'text-info' },
    { label: 'Críticos', value: overview.criticos, icon: AlertTriangle, color: 'text-error' },
    { label: 'Resolvidos (30d)', value: overview.resolvidos, icon: CheckCircle, color: 'text-success' },
    { label: 'Total', value: overview.total, icon: Ticket, color: 'text-base-content' },
  ] : [];

  const infoCards = overview ? [
    { label: 'MTTR (h)', value: overview.mttr ?? '—', icon: Clock, color: 'text-warning' },
    { label: 'MTTA (h)', value: overview.mtta ?? '—', icon: TrendingUp, color: 'text-primary' },
    { label: 'SLA (%)', value: overview.slaCompliance !== null ? `${overview.slaCompliance}%` : '—', icon: Target, color: 'text-success' },
    { label: 'Abertos', value: overview.abertos, icon: Ticket, color: 'text-info' },
  ] : [];

  const satisfaction = overview?.satisfaction;
  const maxTrend = Math.max(...(trends ?? []).map(t => t.created + t.resolved), 1);

  function ChangeBadge({ value }: { value: number | null }) {
    if (value === null) return <span className="text-base-content/30 text-xs">—</span>;
    if (value === 0) return <span className="flex items-center gap-0.5 text-xs text-base-content/50"><Minus size={12} />0%</span>;
    const isPos = value > 0;
    return (
      <span className={`flex items-center gap-0.5 text-xs ${isPos ? 'text-success' : 'text-error'}`}>
        {isPos ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        {Math.abs(value)}%
      </span>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 size={24} className="text-primary" />
        <h1 className="text-3xl font-bold">BI & Relatórios</h1>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metricCards.map((s) => {
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

      {/* Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {infoCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat bg-base-100 rounded-box shadow-sm border border-base-200">
              <div className="flex items-center gap-2 stat-title text-sm">
                <Icon size={16} className={s.color} />
                {s.label}
              </div>
              <div className={`stat-value text-lg ${s.color}`}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Satisfaction */}
      {satisfaction && satisfaction.total > 0 && (
        <div className="bg-base-100 rounded-box shadow-sm border border-base-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-warning" />
            <h2 className="text-lg font-semibold">Satisfação</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="stat px-0 py-2">
              <div className="stat-title text-xs">Média</div>
              <div className="stat-value text-warning text-2xl">{satisfaction.average ?? '—'}</div>
            </div>
            <div className="stat px-0 py-2">
              <div className="stat-title text-xs">NPS</div>
              <div className="stat-value text-success text-2xl">{satisfaction.nps !== null ? `${satisfaction.nps}%` : '—'}</div>
            </div>
            <div className="stat px-0 py-2">
              <div className="stat-title text-xs">Total Avaliações</div>
              <div className="stat-value text-2xl">{satisfaction.total}</div>
            </div>
            <div className="col-span-1">
              <div className="stat-title text-xs mb-1">Distribuição</div>
              <div className="flex items-end gap-1 h-10">
                {[1,2,3,4,5].map((star) => {
                  const item = satisfaction.distribution.find(d => d.rating === star);
                  const count = item?.count ?? 0;
                  const maxCount = Math.max(...satisfaction.distribution.map(d => d.count), 1);
                  return (
                    <div key={star} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className="w-full bg-warning/20 rounded-t" style={{ height: `${(count / maxCount) * 100}%`, minHeight: count > 0 ? 4 : 0 }} />
                      <span className="text-[10px] text-base-content/50">{star}★</span>
                      <span className="text-[10px] font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Monthly Chart */}
        <div className="bg-base-100 rounded-box shadow-sm border border-base-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Por Mês</h2>
          </div>
          {!monthly || monthly.length === 0 ? (
            <p className="text-base-content/50 text-sm">Sem dados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-xs">
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th className="text-right">Criados</th>
                    <th className="text-right">Δ</th>
                    <th className="text-right">Resolvidos</th>
                    <th className="text-right">Δ</th>
                    <th className="text-right">Satisfação</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((m) => (
                    <tr key={m.month} className="hover">
                      <td className="font-medium text-xs">{m.month}</td>
                      <td className="text-right">{m.created}</td>
                      <td className="text-right"><ChangeBadge value={m.createdChange} /></td>
                      <td className="text-right">{m.resolved}</td>
                      <td className="text-right"><ChangeBadge value={m.resolvedChange} /></td>
                      <td className="text-right">{m.satisfactionAvg ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Distribution */}
        <div className="bg-base-100 rounded-box shadow-sm border border-base-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Distribuição</h2>
          {dist ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2 text-base-content/70">Por Status</h3>
                <div className="space-y-2">
                  {dist.byStatus.map((s) => {
                    const total = dist.byStatus.reduce((a, b) => a + b.count, 0);
                    return (
                      <div key={s.name} className="flex items-center gap-2">
                        <span className="text-xs w-24 truncate">{s.name}</span>
                        <div className="flex-1 h-3 bg-base-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(s.count / total) * 100}%` }} />
                        </div>
                        <span className="text-xs w-6 text-right">{s.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2 text-base-content/70">Por Prioridade</h3>
                <div className="space-y-2">
                  {dist.byPriority.map((p) => {
                    const total = dist.byPriority.reduce((a, b) => a + b.count, 0);
                    return (
                      <div key={p.name} className="flex items-center gap-2">
                        <span className="text-xs w-24 truncate">{p.name}</span>
                        <div className="flex-1 h-3 bg-base-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-warning" style={{ width: `${(p.count / total) * 100}%` }} />
                        </div>
                        <span className="text-xs w-6 text-right">{p.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-base-content/50 text-sm">Sem dados</p>
          )}
        </div>
      </div>

      {/* Department Performance */}
      {perfDepts && perfDepts.length > 0 && (
        <div className="bg-base-100 rounded-box shadow-sm border border-base-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={18} className="text-primary" />
            <h2 className="text-lg font-semibold">Performance por Departamento</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>Departamento</th>
                  <th className="text-right">Total Tickets</th>
                  <th className="text-right">Resolvidos</th>
                  <th className="text-right">Tempo Médio (h)</th>
                  <th className="text-right">SLA (%)</th>
                </tr>
              </thead>
              <tbody>
                {perfDepts.map((d) => (
                  <tr key={d.name} className="hover">
                    <td className="font-medium">{d.name}</td>
                    <td className="text-right">{d.totalTickets}</td>
                    <td className="text-right">{d.resolvedTickets}</td>
                    <td className="text-right">{d.avgResolutionTime}</td>
                    <td className="text-right">
                      <span className={`badge badge-sm ${d.slaCompliance >= 90 ? 'badge-success' : d.slaCompliance >= 70 ? 'badge-warning' : 'badge-error'}`}>
                        {d.slaCompliance}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trend Chart */}
      <div className="bg-base-100 rounded-box shadow-sm border border-base-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tendência Diária ({period} dias)</h2>
        </div>
        {!trends || trends.length === 0 ? (
          <p className="text-base-content/50 text-sm">Sem dados</p>
        ) : (
          <div className="space-y-1">
            {trends.slice(-20).map((t) => (
              <div key={t.date} className="flex items-center gap-2 text-xs">
                <span className="w-20 text-base-content/60 shrink-0">{t.date.slice(5)}</span>
                <div className="flex-1 h-4 bg-base-200 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(t.created / maxTrend) * 100}%` }}
                  />
                  <div
                    className="h-full bg-success transition-all"
                    style={{ width: `${(t.resolved / maxTrend) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-base-content/70">{t.created}</span>
              </div>
            ))}
            <div className="flex items-center gap-4 pt-2 text-xs text-base-content/50">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-primary" /> Criados</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-success" /> Resolvidos</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
