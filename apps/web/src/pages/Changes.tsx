import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GitPullRequest, Plus, Trash2, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { changesService } from '../services/changes';
import { usersService } from '../services/users';
import { useAuthStore } from '../store/auth';
import type { Change } from '../types/api';

const STATUS_OPTIONS = ['draft', 'pending_review', 'approved', 'rejected', 'scheduled', 'implementing', 'validating', 'closed'];
const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho', pending_review: 'Pendente', approved: 'Aprovado', rejected: 'Rejeitado',
  scheduled: 'Agendado', implementing: 'Implementando', validating: 'Validando', closed: 'Fechado',
};
const TYPE_LABELS: Record<string, string> = { standard: 'Padrão', normal: 'Normal', emergency: 'Emergencial' };

export function Changes() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const createRef = useRef<HTMLDialogElement | null>(null);
  const detailRef = useRef<HTMLDialogElement | null>(null);
  const editRef = useRef<HTMLDialogElement | null>(null);

  const [form, setForm] = useState<any>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Change | null>(null);
  const [search, setSearch] = useState('');

  const { data: changes, isLoading } = useQuery({
    queryKey: ['changes'],
    queryFn: changesService.findAll,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.findAll,
  });

  const filtered = (changes ?? []).filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: () => changesService.create({ ...form, requesterId: user!.id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['changes'] }); setForm({}); createRef.current?.close(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => changesService.update(editId!, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['changes'] }); setForm({}); setEditId(null); editRef.current?.close(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => changesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['changes'] }),
  });

  function openCreate() {
    setForm({ title: '', description: '', type: 'normal', priority: '', riskLevel: '', impact: '', justification: '', assigneeId: '' });
    createRef.current?.showModal();
  }

  function openEdit(c: Change) {
    setEditId(c.id);
    setForm({
      title: c.title, description: c.description, type: c.type, status: c.status,
      priority: c.priority ?? '', riskLevel: c.riskLevel ?? '', impact: c.impact ?? '',
      justification: c.justification ?? '', implementationPlan: c.implementationPlan ?? '',
      rollbackPlan: c.rollbackPlan ?? '', testPlan: c.testPlan ?? '',
      assigneeId: c.assigneeId ?? '', scheduledAt: c.scheduledAt ?? '',
    });
    editRef.current?.showModal();
  }

  async function openDetail(c: Change) {
    const full = await changesService.findOne(c.id);
    setSelected(full);
    detailRef.current?.showModal();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <GitPullRequest size={24} className="text-primary" />
          <h1 className="text-3xl font-bold">Mudanças</h1>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Nova Mudança</button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
        <input type="text" className="input input-bordered w-full pl-9" placeholder="Buscar mudanças..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Create Modal */}
      <dialog ref={createRef} className="modal">
        <div className="modal-box max-w-lg">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => createRef.current?.close()}>✕</button>
          <h3 className="font-bold text-lg mb-6">Nova Mudança</h3>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-3">
            <input className="input input-bordered w-full" placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea className="textarea textarea-bordered w-full h-24" placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <select className="select select-bordered" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select className="select select-bordered" value={form.riskLevel} onChange={(e) => setForm({ ...form, riskLevel: e.target.value })}>
                <option value="">Risco</option><option value="low">Baixo</option><option value="medium">Médio</option><option value="high">Alto</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="input input-bordered" placeholder="Prioridade ex: P1" value={form.priority ?? ''} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
              <select className="select select-bordered" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
                <option value="">Responsável</option>
                {(users ?? []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <textarea className="textarea textarea-bordered w-full h-20" placeholder="Impacto" value={form.impact ?? ''} onChange={(e) => setForm({ ...form, impact: e.target.value })} />
            <textarea className="textarea textarea-bordered w-full h-20" placeholder="Justificativa" value={form.justification ?? ''} onChange={(e) => setForm({ ...form, justification: e.target.value })} />
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => createRef.current?.close()}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Edit Modal */}
      <dialog ref={editRef} className="modal">
        <div className="modal-box max-w-lg max-h-[85vh] overflow-y-auto">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => editRef.current?.close()}>✕</button>
          <h3 className="font-bold text-lg mb-6">Editar Mudança</h3>
          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }} className="space-y-3">
            <input className="input input-bordered w-full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea className="textarea textarea-bordered w-full h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <div className="grid grid-cols-3 gap-3">
              <select className="select select-bordered" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select className="select select-bordered" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <select className="select select-bordered" value={form.riskLevel} onChange={(e) => setForm({ ...form, riskLevel: e.target.value })}>
                <option value="">Risco</option><option value="low">Baixo</option><option value="medium">Médio</option><option value="high">Alto</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="input input-bordered" placeholder="Prioridade" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
              <select className="select select-bordered" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
                <option value="">Responsável</option>
                {(users ?? []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <textarea className="textarea textarea-bordered w-full h-20" placeholder="Impacto" value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} />
            <textarea className="textarea textarea-bordered w-full h-20" placeholder="Justificativa" value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })} />
            <textarea className="textarea textarea-bordered w-full h-20" placeholder="Plano de Implementação" value={form.implementationPlan} onChange={(e) => setForm({ ...form, implementationPlan: e.target.value })} />
            <textarea className="textarea textarea-bordered w-full h-20" placeholder="Plano de Rollback" value={form.rollbackPlan} onChange={(e) => setForm({ ...form, rollbackPlan: e.target.value })} />
            <textarea className="textarea textarea-bordered w-full h-20" placeholder="Plano de Testes" value={form.testPlan} onChange={(e) => setForm({ ...form, testPlan: e.target.value })} />
            <input type="datetime-local" className="input input-bordered w-full" value={form.scheduledAt?.slice(0, 16) ?? ''} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => editRef.current?.close()}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Detail Modal */}
      <dialog ref={detailRef} className="modal">
        <div className="modal-box max-w-3xl max-h-[85vh] overflow-y-auto">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => detailRef.current?.close()}>✕</button>
          {selected && (
            <>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <GitPullRequest size={24} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold">{selected.title}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="badge">{TYPE_LABELS[selected.type] ?? selected.type}</span>
                    <span className={`badge ${selected.status === 'approved' ? 'badge-success' : selected.status === 'rejected' ? 'badge-error' : selected.status === 'implementing' ? 'badge-warning' : 'badge-ghost'}`}>
                      {STATUS_LABELS[selected.status] ?? selected.status}
                    </span>
                    {selected.priority && <span className="badge badge-warning">{selected.priority}</span>}
                    <span className="badge badge-ghost">{selected.requester?.name}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-base-200 pt-4 space-y-4">
                <p className="text-sm whitespace-pre-wrap">{selected.description}</p>
                {selected.justification && <div><h4 className="font-semibold text-sm text-base-content/70">Justificativa</h4><p className="text-sm mt-1">{selected.justification}</p></div>}
                {selected.implementationPlan && <div><h4 className="font-semibold text-sm text-base-content/70">Plano de Implementação</h4><p className="text-sm mt-1 whitespace-pre-wrap">{selected.implementationPlan}</p></div>}
                {selected.rollbackPlan && <div><h4 className="font-semibold text-sm text-base-content/70">Plano de Rollback</h4><p className="text-sm mt-1 whitespace-pre-wrap">{selected.rollbackPlan}</p></div>}
                {selected.testPlan && <div><h4 className="font-semibold text-sm text-base-content/70">Plano de Testes</h4><p className="text-sm mt-1 whitespace-pre-wrap">{selected.testPlan}</p></div>}
                {selected.approvals && selected.approvals.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-base-content/70 mb-2">Aprovações</h4>
                    {selected.approvals.map(a => (
                      <div key={a.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg mb-2 text-sm">
                        <div>
                          <span className="font-medium">{a.approver?.name}</span>
                          <span className="text-base-content/50 ml-2">({a.role})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {a.status === 'approved' ? <CheckCircle size={14} className="text-success" /> : a.status === 'rejected' ? <XCircle size={14} className="text-error" /> : <Clock size={14} className="text-warning" />}
                          <span>{a.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </dialog>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-base-content/50 py-12 bg-base-100 rounded-box border border-base-200">Nenhuma mudança encontrada</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <div key={c.id} className="bg-base-100 rounded-box shadow-sm border border-base-200 p-5 flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <GitPullRequest size={20} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <button className="font-semibold truncate block text-left hover:text-primary transition-colors w-full"
                    onClick={() => openDetail(c)}>{c.title}</button>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    <span className="badge badge-xs">{TYPE_LABELS[c.type] ?? c.type}</span>
                    <span className={`badge badge-xs ${c.status === 'approved' ? 'badge-success' : c.status === 'rejected' ? 'badge-error' : 'badge-ghost'}`}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-base-content/70 line-clamp-2 flex-1">{c.description}</p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-base-200 text-xs text-base-content/50">
                <span className="flex items-center gap-1"><CheckCircle size={12} /> {c._count?.approvals ?? 0} aprovações</span>
                {c.assignee && <span>{c.assignee.name}</span>}
                <div className="ml-auto flex gap-1">
                  <button className="btn btn-ghost btn-xs" onClick={() => openEdit(c)}>Editar</button>
                  <button className="btn btn-ghost btn-xs text-error"
                    onClick={() => { if (confirm(`Remover "${c.title}"?`)) deleteMutation.mutate(c.id); }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
