import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building, Plus, Trash2, Search } from 'lucide-react';
import { departmentsService } from '../services/departments';
import { companiesService } from '../services/companies';
import { usersService } from '../services/users';
import type { Department } from '../types/api';

export function Departments() {
  const qc = useQueryClient();
  const createRef = useRef<HTMLDialogElement>(null);
  const editRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<any>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  const { data: items, isLoading } = useQuery({ queryKey: ['departments', companyFilter], queryFn: () => departmentsService.findAll(companyFilter || undefined) });
  const { data: companies } = useQuery({ queryKey: ['companies'], queryFn: companiesService.findAll });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: usersService.findAll });

  const filtered = (items ?? []).filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()));

  const create = useMutation({
    mutationFn: () => departmentsService.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); setForm({}); createRef.current?.close(); },
  });
  const update = useMutation({
    mutationFn: () => departmentsService.update(editId!, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); setForm({}); setEditId(null); editRef.current?.close(); },
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => departmentsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });

  function openCreate() { setForm({ name: '', companyId: '', managerId: '' }); createRef.current?.showModal(); }
  function openEdit(d: Department) { setEditId(d.id); setForm({ name: d.name, managerId: d.managerId ?? '', active: d.active }); editRef.current?.showModal(); }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3"><Building size={24} className="text-primary" /><h1 className="text-3xl font-bold">Departamentos</h1></div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Novo Departamento</button>
      </div>
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative max-w-md flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input type="text" className="input input-bordered w-full pl-9" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="select select-bordered" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}>
          <option value="">Todas as empresas</option>
          {(companies ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <dialog ref={createRef} className="modal"><div className="modal-box max-w-md">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => createRef.current?.close()}>✕</button>
        <h3 className="font-bold text-lg mb-6">Novo Departamento</h3>
        <form onSubmit={e => { e.preventDefault(); create.mutate(); }} className="space-y-3">
          <input className="input input-bordered w-full" placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <select className="select select-bordered w-full" value={form.companyId} onChange={e => setForm({ ...form, companyId: e.target.value })} required>
            <option value="">Selecione a empresa</option>
            {(companies ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="select select-bordered w-full" value={form.managerId} onChange={e => setForm({ ...form, managerId: e.target.value })}>
            <option value="">Gestor (opcional)</option>
            {(users ?? []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <div className="modal-action"><button type="button" className="btn btn-ghost" onClick={() => createRef.current?.close()}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={create.isPending}>{create.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Criar'}</button></div>
        </form>
      </div></dialog>

      <dialog ref={editRef} className="modal"><div className="modal-box max-w-md">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => editRef.current?.close()}>✕</button>
        <h3 className="font-bold text-lg mb-6">Editar Departamento</h3>
        <form onSubmit={e => { e.preventDefault(); update.mutate(); }} className="space-y-3">
          <input className="input input-bordered w-full" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <select className="select select-bordered w-full" value={form.managerId} onChange={e => setForm({ ...form, managerId: e.target.value })}>
            <option value="">Gestor (opcional)</option>
            {(users ?? []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="toggle toggle-primary" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Ativo</label>
          <div className="modal-action"><button type="button" className="btn btn-ghost" onClick={() => editRef.current?.close()}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={update.isPending}>{update.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Salvar'}</button></div>
        </form>
      </div></dialog>

      {isLoading ? <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div> :
        <div className="overflow-x-auto"><table className="table table-zebra">
          <thead><tr><th>Nome</th><th>Empresa</th><th>Gestor</th><th>Usuários</th><th>Clientes</th><th>Tickets</th><th>Ativo</th><th></th></tr></thead>
          <tbody>{filtered.map(d => <tr key={d.id} className="hover cursor-pointer" onDoubleClick={() => openEdit(d)}>
            <td className="font-medium">{d.name}</td>
            <td className="text-sm">{d.company?.name ?? '-'}</td>
            <td className="text-sm">{d.manager?.name ?? '-'}</td>
            <td>{d._count?.users ?? 0}</td>
            <td>{d._count?.clients ?? 0}</td>
            <td>{d._count?.tickets ?? 0}</td>
            <td>{d.active ? <span className="badge badge-success badge-xs">Sim</span> : <span className="badge badge-ghost badge-xs">Não</span>}</td>
            <td>
              <button className="btn btn-ghost btn-xs text-error" onClick={() => { if (confirm(`Remover "${d.name}"?`)) deleteM.mutate(d.id); }}><Trash2 size={14} /></button>
            </td>
          </tr>)}</tbody>
        </table></div>}
    </div>
  );
}
