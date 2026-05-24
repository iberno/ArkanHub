import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderKanban, Plus, Trash2, CheckCircle, XCircle, AlertTriangle,
  User, Calendar, DollarSign, Users, Flag,
} from 'lucide-react';
import { projectsService } from '../services/projects';
import { ticketsService } from '../services/tickets';
import { usersService } from '../services/users';
import { useAuthStore } from '../store/auth';
import type { Project, ProjectRisk, ProjectMilestone } from '../types/api';

type Tab = 'overview' | 'tickets' | 'risks' | 'team';

const statusColor: Record<string, string> = {
  Draft: 'badge-ghost', Planned: 'badge-info',
  'In Progress': 'badge-warning', Completed: 'badge-success',
  Cancelled: 'badge-error',
};

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsService.findOne(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, any>) => projectsService.update(id!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  });

  if (isLoading) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>;
  if (!project) return <div className="text-center py-12 text-base-content/40">Projeto não encontrado</div>;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Visão Geral' },
    { key: 'tickets', label: `Tickets (${project.tickets?.length ?? 0})` },
    { key: 'risks', label: `Riscos (${project.risks?.length ?? 0})` },
    { key: 'team', label: `Equipe (${project.stakeholders?.length ?? 0})` },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link to="/projects" className="link link-hover text-sm">&larr; Projetos</Link>
      </div>

      <div className="flex items-start gap-3 mb-6">
        <FolderKanban size={28} className="text-primary shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <span className={`badge ${statusColor[project.status] || 'badge-ghost'}`}>{project.status}</span>
            <span className="badge badge-outline">{project.priority}</span>
          </div>
          {project.description && <p className="text-sm text-base-content/60 mt-1">{project.description}</p>}
          <div className="flex items-center gap-4 mt-2 text-xs text-base-content/40">
            <span className="flex items-center gap-1"><User size={12} /> {project.manager?.name}</span>
            {project.startDate && <span className="flex items-center gap-1"><Calendar size={12} /> Início: {new Date(project.startDate).toLocaleDateString('pt-BR')}</span>}
            {project.targetEndDate && <span className="flex items-center gap-1"><Calendar size={12} /> Previsão: {new Date(project.targetEndDate).toLocaleDateString('pt-BR')}</span>}
            {project.estimatedBudget && <span className="flex items-center gap-1"><DollarSign size={12} /> Orçamento: R$ {project.estimatedBudget.toLocaleString('pt-BR')}</span>}
          </div>
        </div>
      </div>

      <div className="tabs tabs-bordered mb-6">
        {tabs.map((t) => (
          <button key={t.key} className={`tab tab-sm ${tab === t.key ? 'tab-active' : ''}`}
            onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab project={project} onUpdate={(d) => updateMutation.mutate(d)} />}
      {tab === 'tickets' && <TicketsTab project={project} />}
      {tab === 'risks' && <RisksTab projectId={project.id} risks={project.risks ?? []} />}
      {tab === 'team' && <TeamTab project={project} />}
    </div>
  );
}

function OverviewTab({ project, onUpdate }: { project: Project; onUpdate: (data: any) => void }) {
  const [showPhase, setShowPhase] = useState(false);
  const [phaseName, setPhaseName] = useState('');
  const [showMilestone, setShowMilestone] = useState(false);
  const [msName, setMsName] = useState('');
  const [msDate, setMsDate] = useState('');

  const handleStatus = (status: string) => {
    const data: any = { status };
    if (status === 'Completed' || status === 'Cancelled') data.actualEndDate = new Date().toISOString();
    onUpdate(data);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <section className="bg-base-100 rounded-box shadow-sm border border-base-200 p-4">
          <h3 className="font-semibold text-sm mb-3">Charter</h3>
          {project.charter
            ? <p className="text-sm text-base-content/70 whitespace-pre-wrap">{project.charter}</p>
            : <p className="text-xs text-base-content/40">Nenhum charter definido</p>}
        </section>

        <section className="bg-base-100 rounded-box shadow-sm border border-base-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Status</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Draft', 'Planned', 'In Progress', 'Completed', 'Cancelled'].map((s) => (
              <button key={s} className={`btn btn-xs ${project.status === s ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handleStatus(s)} disabled={project.status === s}>{s}</button>
            ))}
          </div>
        </section>

        <section className="bg-base-100 rounded-box shadow-sm border border-base-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-1"><Flag size={14} /> Marcos</h3>
            <button className="btn btn-ghost btn-xs gap-1" onClick={() => setShowMilestone(!showMilestone)}>
              <Plus size={12} /> {showMilestone ? 'Fechar' : 'Adicionar'}
            </button>
          </div>
          {showMilestone && (
            <form onSubmit={(e) => { e.preventDefault(); projectsService.addMilestone(project.id, { name: msName, date: msDate }).then(() => { setMsName(''); setMsDate(''); setShowMilestone(false); }); }}
              className="flex gap-2 mb-3">
              <input className="input input-bordered input-xs flex-1" placeholder="Nome" value={msName}
                onChange={(e) => setMsName(e.target.value)} required />
              <input type="date" className="input input-bordered input-xs w-36" value={msDate}
                onChange={(e) => setMsDate(e.target.value)} required />
              <button type="submit" className="btn btn-primary btn-xs">OK</button>
            </form>
          )}
          {project.milestones?.length === 0
            ? <p className="text-xs text-base-content/40">Nenhum marco cadastrado</p>
            : <div className="space-y-2">
                {project.milestones?.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="checkbox checkbox-xs" checked={m.completed}
                      onChange={() => projectsService.updateMilestone(m.id, { completed: !m.completed })} />
                    <span className={m.completed ? 'line-through text-base-content/40' : ''}>{m.name}</span>
                    <span className="text-[10px] text-base-content/40 ml-auto">{new Date(m.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                ))}
              </div>
          }
        </section>
      </div>

      <div className="space-y-6">
        <section className="bg-base-100 rounded-box shadow-sm border border-base-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Fases</h3>
            <button className="btn btn-ghost btn-xs gap-1" onClick={() => setShowPhase(!showPhase)}>
              <Plus size={12} /> {showPhase ? 'Fechar' : 'Adicionar'}
            </button>
          </div>
          {showPhase && (
            <form onSubmit={(e) => { e.preventDefault(); projectsService.addPhase(project.id, { name: phaseName }).then(() => { setPhaseName(''); setShowPhase(false); }); }}
              className="flex gap-2 mb-3">
              <input className="input input-bordered input-xs flex-1" placeholder="Nome da fase" value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)} required />
              <button type="submit" className="btn btn-primary btn-xs">OK</button>
            </form>
          )}
          {project.phases?.length === 0
            ? <p className="text-xs text-base-content/40">Nenhuma fase cadastrada</p>
            : <div className="space-y-2">
                {project.phases?.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm bg-base-200 rounded px-3 py-2">
                    <span className="font-medium">{p.order}.</span>
                    <span>{p.name}</span>
                    {p.description && <span className="text-xs text-base-content/50">— {p.description}</span>}
                    <span className="text-[10px] text-base-content/40 ml-auto">
                      {p.startDate && new Date(p.startDate).toLocaleDateString('pt-BR')}
                      {p.endDate && ` → ${new Date(p.endDate).toLocaleDateString('pt-BR')}`}
                    </span>
                  </div>
                ))}
              </div>
          }
        </section>

        <section className="bg-base-100 rounded-box shadow-sm border border-base-200 p-4">
          <h3 className="font-semibold text-sm mb-3">Dados Financeiros</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-base-content/40">Orçamento Estimado</p>
              <p className="font-medium">{project.estimatedBudget ? `R$ ${project.estimatedBudget.toLocaleString('pt-BR')}` : '-'}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/40">Orçamento Real</p>
              <p className="font-medium">{project.actualBudget ? `R$ ${project.actualBudget.toLocaleString('pt-BR')}` : '-'}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function TicketsTab({ project }: { project: Project }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-base-content/50">{project.tickets?.length ?? 0} tickets vinculados</p>
        <Link to={`/tickets/new?projectId=${project.id}`} className="btn btn-primary btn-xs gap-1">
          <Plus size={12} /> Novo ticket no projeto
        </Link>
      </div>
      {!project.tickets?.length
        ? <div className="text-center py-12 text-base-content/40">Nenhum ticket vinculado a este projeto</div>
        : <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Título</th>
                  <th>Status</th>
                  <th>Prioridade</th>
                  <th>Responsável</th>
                  <th>Fase</th>
                </tr>
              </thead>
              <tbody>
                {project.tickets.map((t) => (
                  <tr key={t.id} className="hover">
                    <td className="font-mono text-xs">{t.protocol}</td>
                    <td className="text-sm max-w-xs truncate">{t.title}</td>
                    <td><span className="badge badge-xs" style={{ backgroundColor: t.status?.color ?? '#888', color: '#fff' }}>{t.status?.name}</span></td>
                    <td className="text-xs">{t.priority?.name}</td>
                    <td className="text-xs">{t.assignee?.name || '-'}</td>
                    <td className="text-xs">{/* TODO: phase name from projectPhaseId */ '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }
    </div>
  );
}

function RisksTab({ projectId, risks }: { projectId: string; risks: ProjectRisk[] }) {
  const [showForm, setShowForm] = useState(false);
  const [desc, setDesc] = useState('');
  const [probability, setProbability] = useState('Médio');
  const [impact, setImpact] = useState('Médio');
  const [mitigation, setMitigation] = useState('');
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: () => projectsService.addRisk(projectId, { description: desc, probability, impact, mitigation: mitigation || undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project', projectId] }); setShowForm(false); setDesc(''); setMitigation(''); },
  });

  const removeMutation = useMutation({
    mutationFn: (riskId: string) => projectsService.removeRisk(riskId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
  });

  const probColor: Record<string, string> = { Baixo: 'badge-info', Médio: 'badge-warning', Alto: 'badge-error' };
  const impColor: Record<string, string> = { Baixo: 'badge-info', Médio: 'badge-warning', Alto: 'badge-error' };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-base-content/50">{risks.length} riscos</p>
        <button className="btn btn-primary btn-xs gap-1" onClick={() => setShowForm(!showForm)}>
          <Plus size={12} /> {showForm ? 'Fechar' : 'Adicionar risco'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(); }}
          className="bg-base-100 rounded-box shadow-sm border border-base-200 p-4 mb-4 space-y-3">
          <textarea className="textarea textarea-bordered text-sm w-full" rows={2} placeholder="Descrição do risco"
            value={desc} onChange={(e) => setDesc(e.target.value)} required />
          <div className="flex gap-2">
            <select className="select select-bordered select-xs" value={probability} onChange={(e) => setProbability(e.target.value)}>
              <option value="Baixo">Prob: Baixo</option>
              <option value="Médio">Prob: Médio</option>
              <option value="Alto">Prob: Alto</option>
            </select>
            <select className="select select-bordered select-xs" value={impact} onChange={(e) => setImpact(e.target.value)}>
              <option value="Baixo">Impacto: Baixo</option>
              <option value="Médio">Impacto: Médio</option>
              <option value="Alto">Impacto: Alto</option>
            </select>
          </div>
          <input className="input input-bordered input-xs w-full" placeholder="Mitigação (opcional)" value={mitigation}
            onChange={(e) => setMitigation(e.target.value)} />
          <button type="submit" className="btn btn-primary btn-xs" disabled={addMutation.isPending}>Adicionar</button>
        </form>
      )}
      {risks.length === 0
        ? <div className="text-center py-12 text-base-content/40">Nenhum risco cadastrado</div>
        : <div className="space-y-2">
            {risks.map((r) => (
              <div key={r.id} className="bg-base-100 rounded-box shadow-sm border border-base-200 p-3 flex items-start gap-3">
                <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{r.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge badge-xs ${probColor[r.probability] || 'badge-ghost'}`}>{r.probability}</span>
                    <span className={`badge badge-xs ${impColor[r.impact] || 'badge-ghost'}`}>{r.impact}</span>
                    {r.status && <span className="badge badge-xs badge-outline">{r.status}</span>}
                    {r.owner && <span className="text-[10px] text-base-content/40"><User size={10} className="inline" /> {r.owner.name}</span>}
                  </div>
                  {r.mitigation && <p className="text-xs text-base-content/50 mt-1">Mitigação: {r.mitigation}</p>}
                </div>
                <button className="btn btn-ghost btn-xs text-error" onClick={() => removeMutation.mutate(r.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

function TeamTab({ project }: { project: Project }) {
  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.findAll(),
  });

  const addMutation = useMutation({
    mutationFn: () => projectsService.addStakeholder(project.id, { userId, role }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['project', project.id] }); setShowForm(false); setUserId(''); setRole(''); },
  });

  const removeMutation = useMutation({
    mutationFn: (stakeholderId: string) => projectsService.removeStakeholder(stakeholderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', project.id] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-base-content/50">{project.stakeholders?.length ?? 0} membros</p>
        <button className="btn btn-primary btn-xs gap-1" onClick={() => setShowForm(!showForm)}>
          <Plus size={12} /> {showForm ? 'Fechar' : 'Adicionar membro'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(); }}
          className="bg-base-100 rounded-box shadow-sm border border-base-200 p-4 mb-4 flex gap-2">
          <select className="select select-bordered select-xs flex-1" value={userId}
            onChange={(e) => setUserId(e.target.value)} required>
            <option value="">Selecione um usuário...</option>
            {users?.filter((u) => u.active).map((u) => (
              <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
            ))}
          </select>
          <select className="select select-bordered select-xs" value={role}
            onChange={(e) => setRole(e.target.value)} required>
            <option value="">Papel...</option>
            <option value="Sponsor">Sponsor</option>
            <option value="Project Manager">Gerente</option>
            <option value="Team Member">Membro</option>
            <option value="Stakeholder">Stakeholder</option>
            <option value="Client">Cliente</option>
          </select>
          <button type="submit" className="btn btn-primary btn-xs" disabled={addMutation.isPending}>OK</button>
        </form>
      )}
      {!project.stakeholders?.length
        ? <div className="text-center py-12 text-base-content/40">Nenhum membro na equipe</div>
        : <div className="space-y-2">
            {project.stakeholders.map((s) => (
              <div key={s.id} className="flex items-center gap-3 bg-base-100 rounded-box shadow-sm border border-base-200 p-3">
                <Users size={16} className="text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.user?.name}</p>
                  <p className="text-[10px] text-base-content/40">{s.user?.email}</p>
                </div>
                <span className="badge badge-sm">{s.role}</span>
                <button className="btn btn-ghost btn-xs text-error" onClick={() => removeMutation.mutate(s.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
      }
    </div>
  );
}
