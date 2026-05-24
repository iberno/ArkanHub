import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Monitor, Plus, Search, Trash2 } from 'lucide-react';
import { assetsService } from '../services/assets';
import { categoriesService } from '../services/ticket-categories';
import type { Asset } from '../types/api';
import { usersService } from '../services/users';
import { departmentsService } from '../services/departments';

const statusOptions = [
  { value: 'active', label: 'Ativo' },
  { value: 'maintenance', label: 'Em Manutenção' },
  { value: 'retired', label: 'Baixado' },
];

const statusBadge: Record<string, string> = {
  active: 'badge-success',
  maintenance: 'badge-warning',
  retired: 'badge-error',
};

const statusLabel: Record<string, string> = {
  active: 'Ativo',
  maintenance: 'Em Manut.',
  retired: 'Baixado',
};

export function Assets() {
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    tag: '', name: '', categoryId: '', brand: '', model: '',
    serialNumber: '', status: 'active', purchaseDate: '', warrantyEnd: '',
    assignedTo: '', departmentId: '', companyId: '', notes: '',
  });

  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets', search, filterCat, filterStatus],
    queryFn: () => assetsService.findAll({ search: search || undefined, categoryId: filterCat || undefined, status: filterStatus || undefined }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.findAll(),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.findAll(),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsService.findAll(),
  });

  const createMutation = useMutation({
    mutationFn: () => assetsService.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['assets'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => assetsService.update(editing!.id, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['assets'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assetsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assets'] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ tag: '', name: '', categoryId: '', brand: '', model: '', serialNumber: '', status: 'active', purchaseDate: '', warrantyEnd: '', assignedTo: '', departmentId: '', companyId: '', notes: '' });
    modalRef.current?.showModal();
  };

  const openEdit = (asset: Asset) => {
    setEditing(asset);
    setForm({
      tag: asset.tag, name: asset.name, categoryId: asset.categoryId || '',
      brand: asset.brand || '', model: asset.model || '', serialNumber: asset.serialNumber || '',
      status: asset.status, purchaseDate: asset.purchaseDate || '', warrantyEnd: asset.warrantyEnd || '',
      assignedTo: asset.assignedTo || '', departmentId: asset.departmentId || '', companyId: asset.companyId || '',
      notes: asset.notes || '',
    });
    modalRef.current?.showModal();
  };

  const closeModal = () => {
    setEditing(null);
    modalRef.current?.close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate();
    else createMutation.mutate();
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Monitor size={24} className="text-primary" />
          <h1 className="text-3xl font-bold">Ativos</h1>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Novo Ativo
        </button>
      </div>

      <div className="bg-base-100 rounded-box shadow-sm border border-base-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="join flex-1">
            <input type="text" className="input input-bordered join-item flex-1" placeholder="Buscar por tag, nome ou serial..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn join-item"><Search size={16} /></button>
          </div>
          <select className="select select-bordered sm:w-44" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="">Todas categorias</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="select select-bordered sm:w-36" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Todos status</option>
            {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box w-full max-w-2xl">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeModal}>✕</button>
          <h3 className="font-bold text-lg mb-6">{editing ? 'Editar Ativo' : 'Novo Ativo'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Tag *</span></label>
                <input type="text" className="input input-bordered" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} required placeholder="EX: EQ-001" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Nome *</span></label>
                <input type="text" className="input input-bordered" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ex: Notebook Dell" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Categoria *</span></label>
                <select className="select select-bordered" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                  <option value="">Selecione...</option>
                  {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Status</span></label>
                <select className="select select-bordered" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Marca</span></label>
                <input type="text" className="input input-bordered" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Modelo</span></label>
                <input type="text" className="input input-bordered" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Nº Serial</span></label>
                <input type="text" className="input input-bordered" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Data de Aquisição</span></label>
                <input type="date" className="input input-bordered" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Fim da Garantia</span></label>
                <input type="date" className="input input-bordered" value={form.warrantyEnd} onChange={(e) => setForm({ ...form, warrantyEnd: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Responsável</span></label>
                <select className="select select-bordered" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                  <option value="">Nenhum</option>
                  {users?.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Departamento</span></label>
                <select className="select select-bordered" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
                  <option value="">Nenhum</option>
                  {departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Observações</span></label>
              <textarea className="textarea textarea-bordered" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                {editing ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {isLoading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-box shadow-sm border border-base-200">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Responsável</th>
                <th>Serial</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assets?.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-base-content/50 py-8">Nenhum ativo cadastrado</td></tr>
              ) : (
                assets?.map((asset) => (
                  <tr key={asset.id} className="hover cursor-pointer" onDoubleClick={() => openEdit(asset)}>
                    <td className="font-mono text-sm font-medium">{asset.tag}</td>
                    <td>{asset.name}</td>
                    <td>{asset.category?.name}</td>
                    <td><span className={`badge badge-sm ${statusBadge[asset.status] || 'badge-ghost'}`}>{statusLabel[asset.status] || asset.status}</span></td>
                    <td>{asset.assignee?.name || '-'}</td>
                    <td className="font-mono text-xs">{asset.serialNumber || '-'}</td>
                    <td>
                      <button className="btn btn-ghost btn-xs text-error" onClick={() => { if (confirm(`Remover "${asset.name}"?`)) deleteMutation.mutate(asset.id); }}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
