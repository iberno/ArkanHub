import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Trash2, Search } from 'lucide-react';
import { clientsService } from '../services/clients';
import { companiesService } from '../services/companies';
import { departmentsService } from '../services/departments';
import type { Client } from '../types/api';

export function Clients() {
  const qc = useQueryClient();
  const createRef = useRef<HTMLDialogElement>(null);
  const editRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<any>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  const { data: items, isLoading } = useQuery({
    queryKey: ['clients', companyFilter],
    queryFn: () => clientsService.findAll(companyFilter || undefined),
  });
  const { data: companies } = useQuery({ queryKey: ['companies'], queryFn: companiesService.findAll });
  const { data: departments } = useQuery({
    queryKey: ['departments', form.companyId],
    queryFn: () => departmentsService.findAll(form.companyId || undefined),
    enabled: !!form.companyId,
  });

  const filtered = (items ?? []).filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const create = useMutation({
    mutationFn: () => clientsService.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setForm({}); createRef.current?.close(); },
  });
  const update = useMutation({
    mutationFn: () => clientsService.update(editId!, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setForm({}); setEditId(null); editRef.current?.close(); },
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => clientsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });

  function openCreate() { setForm({ name: '', email: '', phone: '', companyId: '', departmentId: '' }); createRef.current?.showModal(); }
  function openEdit(c: Client) {
    setEditId(c.id);
    setForm({ name: c.name, email: c.email ?? '', phone: c.phone ?? '', companyId: c.companyId, departmentId: c.departmentId ?? '', active: c.active });
    editRef.current?.showModal();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3"><Users size={24} className="text-primary" /><h1 className="text-3xl font-bold">Clientes</h1></div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Novo Cliente</button>
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
        <h3 className="font-bold text-lg mb-6">Novo Cliente</h3>
        <form onSubmit={e => { e.preventDefault(); create.mutate(); }} className="space-y-3">
          <input className="input input-bordered w-full" placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input className="input input-bordered w-full" placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className="input input-bordered w-full" placeholder="Telefone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <select className="select select-bordered w-full" value={form.companyId} onChange={e => setForm({ ...form, companyId: e.target.value, departmentId: '' })} required>
            <option value="">Selecione a empresa</option>
            {(companies ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="select select-bordered w-full" value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })}>
            <option value="">Departamento (opcional)</option>
            {(departments ?? []).filter(d => d.companyId === form.companyId).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <div className="modal-action"><button type="button" className="btn btn-ghost" onClick={() => createRef.current?.close()}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={create.isPending}>{create.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Criar'}</button></div>
        </form>
      </div></dialog>

      <dialog ref={editRef} className="modal"><div className="modal-box max-w-md">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => editRef.current?.close()}>✕</button>
        <h3 className="font-bold text-lg mb-6">Editar Cliente</h3>
        <form onSubmit={e => { e.preventDefault(); update.mutate(); }} className="space-y-3">
          <input className="input input-bordered w-full" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input className="input input-bordered w-full" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className="input input-bordered w-full" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <select className="select select-bordered w-full" value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })}>
            <option value="">Departamento (opcional)</option>
            {(departments ?? []).filter(d => d.companyId === form.companyId).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="toggle toggle-primary" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Ativo</label>
          <div className="modal-action"><button type="button" className="btn btn-ghost" onClick={() => editRef.current?.close()}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={update.isPending}>{update.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Salvar'}</button></div>
        </form>
      </div></dialog>

      {isLoading ? <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div> :
        <div className="overflow-x-auto"><table className="table table-zebra">
          <thead><tr><th>Nome</th><th>Email</th><th>Telefone</th><th>Empresa</th><th>Departamento</th><th>Tickets</th><th>Ativo</th><th></th></tr></thead>
          <tbody>{filtered.map(c => <tr key={c.id} className="hover cursor-pointer" onDoubleClick={() => openEdit(c)}>
            <td className="font-medium">{c.name}</td>
            <td className="text-sm">{c.email ?? '-'}</td>
            <td className="text-sm">{c.phone ?? '-'}</td>
            <td className="text-sm">{c.company?.name ?? '-'}</td>
            <td className="text-sm">{c.department?.name ?? '-'}</td>
            <td>{c._count?.tickets ?? 0}</td>
            <td>{c.active ? <span className="badge badge-success badge-xs">Sim</span> : <span className="badge badge-ghost badge-xs">Não</span>}</td>
            <td>
              <button className="btn btn-ghost btn-xs text-error" onClick={() => { if (confirm(`Remover "${c.name}"?`)) deleteM.mutate(c.id); }}><Trash2 size={14} /></button>
            </td>
          </tr>)}</tbody>
        </table></div>}
    </div>
  );
}
