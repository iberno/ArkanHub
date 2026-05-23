import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Plus, Trash2, FileText, Bug, Search } from 'lucide-react';
import { problemsService } from '../services/problems';
import { usersService } from '../services/users';
import { useAuthStore } from '../store/auth';
import type { Problem } from '../types/api';

const STATUS_OPTIONS = ['open', 'investigating', 'root_cause_identified', 'resolved', 'closed'];
const STATUS_LABELS: Record<string, string> = {
  open: 'Aberto', investigating: 'Investigando', root_cause_identified: 'Causa Identificada',
  resolved: 'Resolvido', closed: 'Fechado',
};

export function Problems() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const createRef = useRef<HTMLDialogElement | null>(null);
  const editRef = useRef<HTMLDialogElement | null>(null);
  const detailRef = useRef<HTMLDialogElement | null>(null);
  const keRef = useRef<HTMLDialogElement | null>(null);

  const [form, setForm] = useState<any>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Problem | null>(null);
  const [search, setSearch] = useState('');
  const [keForm, setKeForm] = useState({ problemId: '', title: '', description: '', workaround: '' });

  const { data: problems, isLoading } = useQuery({
    queryKey: ['problems'],
    queryFn: problemsService.findAll,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.findAll,
  });

  const filtered = (problems ?? []).filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: () => problemsService.create({ ...form, reporterId: user!.id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['problems'] }); setForm({}); createRef.current?.close(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => problemsService.update(editId!, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['problems'] }); setForm({}); setEditId(null); editRef.current?.close(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => problemsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['problems'] }),
  });

  const createKe = useMutation({
    mutationFn: () => problemsService.createKnownError(keForm),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['problems'] }); setKeForm({ problemId: '', title: '', description: '', workaround: '' }); keRef.current?.close(); },
  });

  function openCreate() {
    setForm({ title: '', description: '', impact: '', urgency: '', priority: '', category: '', assigneeId: '' });
    createRef.current?.showModal();
  }

  function openEdit(p: Problem) {
    setEditId(p.id);
    setForm({ title: p.title, description: p.description, status: p.status, impact: p.impact, urgency: p.urgency, priority: p.priority, category: p.category, rootCause: p.rootCause, solution: p.solution, workaround: p.workaround, assigneeId: p.assigneeId ?? '' });
    editRef.current?.showModal();
  }

  async function openDetail(p: Problem) {
    const full = await problemsService.findOne(p.id);
    setSelected(full);
    detailRef.current?.showModal();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle size={24} className="text-primary" />
          <h1 className="text-3xl font-bold">Problemas</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm gap-1" onClick={() => {
            setKeForm({ problemId: '', title: '', description: '', workaround: '' }); keRef.current?.showModal();
          }}>
            <Bug size={16} /> Erro Conhecido
          </button>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Novo Problema</button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
        <input type="text" className="input input-bordered w-full pl-9" placeholder="Buscar problemas..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Create Modal */}
      <dialog ref={createRef} className="modal">
        <div className="modal-box max-w-lg">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => createRef.current?.close()}>✕</button>
          <h3 className="font-bold text-lg mb-6">Novo Problema</h3>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-3">
            <input className="input input-bordered w-full" placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea className="textarea textarea-bordered w-full h-24" placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <select className="select select-bordered" value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })}>
                <option value="">Impacto</option><option value="high">Alto</option><option value="medium">Médio</option><option value="low">Baixo</option>
              </select>
              <select className="select select-bordered" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                <option value="">Urgência</option><option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="input input-bordered" placeholder="Prioridade ex: P1" value={form.priority ?? ''} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
              <input className="input input-bordered" placeholder="Categoria" value={form.category ?? ''} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
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
          <h3 className="font-bold text-lg mb-6">Editar Problema</h3>
          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }} className="space-y-3">
            <input className="input input-bordered w-full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea className="textarea textarea-bordered w-full h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <select className="select select-bordered" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <select className="select select-bordered" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
                <option value="">Responsável</option>
                {(users ?? []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select className="select select-bordered" value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })}>
                <option value="">Impacto</option><option value="high">Alto</option><option value="medium">Médio</option><option value="low">Baixo</option>
              </select>
              <select className="select select-bordered" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                <option value="">Urgência</option><option value="high">Alta</option><option value="medium">Média</option><option value="low">Baixa</option>
              </select>
            </div>
            <textarea className="textarea textarea-bordered w-full h-20" placeholder="Causa Raiz (RCA)" value={form.rootCause ?? ''} onChange={(e) => setForm({ ...form, rootCause: e.target.value })} />
            <textarea className="textarea textarea-bordered w-full h-20" placeholder="Solução" value={form.solution ?? ''} onChange={(e) => setForm({ ...form, solution: e.target.value })} />
            <textarea className="textarea textarea-bordered w-full h-20" placeholder="Workaround" value={form.workaround ?? ''} onChange={(e) => setForm({ ...form, workaround: e.target.value })} />
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
                <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} className="text-error" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold">{selected.title}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="badge">{STATUS_LABELS[selected.status] ?? selected.status}</span>
                    {selected.priority && <span className="badge badge-warning">{selected.priority}</span>}
                    {selected.category && <span className="badge badge-ghost">{selected.category}</span>}
                  </div>
                </div>
              </div>
              <div className="border-t border-base-200 pt-4 space-y-4">
                <div><h4 className="font-semibold text-sm text-base-content/70 mb-1">Descrição</h4><p className="text-sm whitespace-pre-wrap">{selected.description}</p></div>
                {selected.rootCause && <div><h4 className="font-semibold text-sm text-base-content/70 mb-1">Causa Raiz</h4><p className="text-sm whitespace-pre-wrap">{selected.rootCause}</p></div>}
                {selected.solution && <div><h4 className="font-semibold text-sm text-base-content/70 mb-1">Solução</h4><p className="text-sm whitespace-pre-wrap">{selected.solution}</p></div>}
                {selected.workaround && <div><h4 className="font-semibold text-sm text-base-content/70 mb-1">Workaround</h4><p className="text-sm whitespace-pre-wrap">{selected.workaround}</p></div>}
                {selected.knownErrors && selected.knownErrors.length > 0 && (
                  <div><h4 className="font-semibold text-sm text-base-content/70 mb-2">Erros Conhecidos</h4>
                    {selected.knownErrors.map(ke => (
                      <div key={ke.id} className="p-3 bg-base-200 rounded-lg mb-2">
                        <p className="font-medium text-sm">{ke.title}</p>
                        <p className="text-xs text-base-content/70 mt-1">{ke.workaround}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </dialog>

      {/* Known Error Modal */}
      <dialog ref={keRef} className="modal">
        <div className="modal-box max-w-md">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => keRef.current?.close()}>✕</button>
          <h3 className="font-bold text-lg mb-6">Novo Erro Conhecido</h3>
          <form onSubmit={(e) => { e.preventDefault(); createKe.mutate(); }} className="space-y-3">
            <input className="input input-bordered w-full" placeholder="Título" value={keForm.title} onChange={(e) => setKeForm({ ...keForm, title: e.target.value })} required />
            <textarea className="textarea textarea-bordered w-full h-24" placeholder="Descrição" value={keForm.description} onChange={(e) => setKeForm({ ...keForm, description: e.target.value })} required />
            <textarea className="textarea textarea-bordered w-full h-20" placeholder="Workaround" value={keForm.workaround} onChange={(e) => setKeForm({ ...keForm, workaround: e.target.value })} />
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => keRef.current?.close()}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={createKe.isPending}>
                {createKe.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-base-content/50 py-12 bg-base-100 rounded-box border border-base-200">Nenhum problema encontrado</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <div key={p.id} className="bg-base-100 rounded-box shadow-sm border border-base-200 p-5 flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} className="text-error" />
                </div>
                <div className="min-w-0 flex-1">
                  <button className="font-semibold truncate block text-left hover:text-primary transition-colors w-full"
                    onClick={() => openDetail(p)}>
                    {p.title}
                  </button>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    <span className={`badge badge-xs ${p.status === 'resolved' || p.status === 'closed' ? 'badge-success' : p.status === 'investigating' ? 'badge-warning' : 'badge-ghost'}`}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                    {p.priority && <span className="badge badge-xs badge-warning">{p.priority}</span>}
                  </div>
                </div>
              </div>
              <p className="text-sm text-base-content/70 line-clamp-2 flex-1">{p.description}</p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-base-200 text-xs text-base-content/50">
                <span className="flex items-center gap-1"><FileText size={12} /> {p._count?.tickets ?? 0}</span>
                <span className="flex items-center gap-1"><Bug size={12} /> {p._count?.knownErrors ?? 0}</span>
                <div className="ml-auto flex gap-1">
                  <button className="btn btn-ghost btn-xs" onClick={() => openEdit(p)}>Editar</button>
                  <button className="btn btn-ghost btn-xs text-error"
                    onClick={() => { if (confirm(`Remover "${p.title}"?`)) deleteMutation.mutate(p.id); }}>
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
