import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Trash2, Search } from 'lucide-react';
import { companiesService } from '../services/companies';
import type { Company } from '../types/api';

export function Companies() {
  const qc = useQueryClient();
  const createRef = useRef<HTMLDialogElement>(null);
  const editRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<any>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: items, isLoading } = useQuery({ queryKey: ['companies'], queryFn: companiesService.findAll });
  const filtered = (items ?? []).filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const create = useMutation({
    mutationFn: () => companiesService.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['companies'] }); setForm({}); createRef.current?.close(); },
  });
  const update = useMutation({
    mutationFn: () => companiesService.update(editId!, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['companies'] }); setForm({}); setEditId(null); editRef.current?.close(); },
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => companiesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }),
  });

  function openCreate() { setForm({ name: '', document: '' }); createRef.current?.showModal(); }
  function openEdit(c: Company) { setEditId(c.id); setForm({ name: c.name, document: c.document ?? '', active: c.active }); editRef.current?.showModal(); }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3"><Building2 size={24} className="text-primary" /><h1 className="text-3xl font-bold">Empresas</h1></div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Nova Empresa</button>
      </div>
      <div className="relative mb-6 max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
        <input type="text" className="input input-bordered w-full pl-9" placeholder="Buscar empresas..." value={search} onChange={e => setSearch(e.target.value)} /></div>

      <dialog ref={createRef} className="modal"><div className="modal-box max-w-md">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => createRef.current?.close()}>✕</button>
        <h3 className="font-bold text-lg mb-6">Nova Empresa</h3>
        <form onSubmit={e => { e.preventDefault(); create.mutate(); }} className="space-y-3">
          <input className="input input-bordered w-full" placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input className="input input-bordered w-full" placeholder="CNPJ/Documento" value={form.document} onChange={e => setForm({ ...form, document: e.target.value })} />
          <div className="modal-action"><button type="button" className="btn btn-ghost" onClick={() => createRef.current?.close()}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={create.isPending}>{create.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Criar'}</button></div>
        </form>
      </div></dialog>

      <dialog ref={editRef} className="modal"><div className="modal-box max-w-md">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => editRef.current?.close()}>✕</button>
        <h3 className="font-bold text-lg mb-6">Editar Empresa</h3>
        <form onSubmit={e => { e.preventDefault(); update.mutate(); }} className="space-y-3">
          <input className="input input-bordered w-full" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input className="input input-bordered w-full" value={form.document} onChange={e => setForm({ ...form, document: e.target.value })} />
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="toggle toggle-primary" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Ativa</label>
          <div className="modal-action"><button type="button" className="btn btn-ghost" onClick={() => editRef.current?.close()}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={update.isPending}>{update.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Salvar'}</button></div>
        </form>
      </div></dialog>

      {isLoading ? <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div> :
        <div className="overflow-x-auto"><table className="table table-zebra">
          <thead><tr><th>Nome</th><th>Documento</th><th>Departamentos</th><th>Clientes</th><th>Usuários</th><th>Ativa</th><th></th></tr></thead>
          <tbody>{filtered.map(c => <tr key={c.id} className="hover cursor-pointer" onDoubleClick={() => openEdit(c)}>
            <td className="font-medium">{c.name}</td>
            <td className="text-sm text-base-content/60">{c.document ?? '-'}</td>
            <td>{c._count?.departments ?? 0}</td>
            <td>{c._count?.clients ?? 0}</td>
            <td>{c._count?.users ?? 0}</td>
            <td>{c.active ? <span className="badge badge-success badge-xs">Sim</span> : <span className="badge badge-ghost badge-xs">Não</span>}</td>
            <td>
              <button className="btn btn-ghost btn-xs text-error" onClick={() => { if (confirm(`Remover "${c.name}"?`)) deleteM.mutate(c.id); }}><Trash2 size={14} /></button>
            </td>
          </tr>)}</tbody>
        </table></div>}
    </div>
  );
}
