import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tags, Plus, Trash2 } from 'lucide-react';
import { categoriesService } from '../services/ticket-categories';
import type { Category } from '../types/api';

export function Categories() {
  const editRef = useRef<HTMLDialogElement | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.findAll(),
  });

  const createMutation = useMutation({
    mutationFn: () => categoriesService.create({ name, parentId: parentId || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setName(''); setParentId('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => categoriesService.update(editing!.id, { name, parentId: parentId || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeEdit();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setParentId(cat.parentId || '');
    editRef.current?.showModal();
  };

  const closeEdit = () => {
    setEditing(null);
    setName('');
    setParentId('');
    editRef.current?.close();
  };

  const rootCategories = categories?.filter(c => !c.parentId) ?? [];
  const getChildren = (parentId: string) => categories?.filter(c => c.parentId === parentId) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Tags size={24} className="text-primary" />
          <h1 className="text-3xl font-bold">Categorias</h1>
        </div>
      </div>

      <div className="bg-base-100 rounded-box shadow-sm border border-base-200 p-5 mb-6">
        <h3 className="font-semibold mb-4">Nova Categoria</h3>
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="flex flex-col sm:flex-row gap-3">
          <input type="text" className="input input-bordered flex-1" placeholder="Ex: Periférico, Software..." value={name} onChange={(e) => setName(e.target.value)} required />
          <select className="select select-bordered sm:w-56" value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">Categoria raiz</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
            <Plus size={16} />
            Adicionar
          </button>
        </form>
      </div>

      <dialog ref={editRef} className="modal">
        <div className="modal-box w-full max-w-md">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeEdit}>×</button>
          <h3 className="font-bold text-lg mb-6">Editar Categoria</h3>
          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Nome</span></label>
              <input type="text" className="input input-bordered" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Categoria pai (subcategoria de)</span></label>
              <select className="select select-bordered" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                <option value="">Categoria raiz</option>
                {categories?.filter(c => c.id !== editing?.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={closeEdit}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>Salvar</button>
            </div>
          </form>
        </div>
      </dialog>

      {isLoading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
      ) : rootCategories.length === 0 ? (
        <div className="text-center text-base-content/50 py-12 bg-base-100 rounded-box border border-base-200">
          Nenhuma categoria cadastrada
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {rootCategories.map((cat) => {
            const children = getChildren(cat.id);
            return (
              <div key={cat.id} className="bg-base-100 rounded-box shadow-sm border border-base-200 p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0 cursor-pointer" onDoubleClick={() => openEdit(cat)}>
                    <span className="font-medium truncate block">{cat.name}</span>
                    <span className="text-xs text-base-content/40 block">
                      {cat._count?.tickets ?? 0} tickets &middot; {cat._count?.assets ?? 0} ativos
                    </span>
                  </div>
                  <button className="btn btn-ghost btn-xs text-error shrink-0" onClick={() => { if (confirm(`Remover "${cat.name}"?`)) deleteMutation.mutate(cat.id); }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                {children.length > 0 && (
                  <div className="mt-auto space-y-1.5 pt-3 border-t border-base-200">
                    {children.map((child) => (
                      <div key={child.id} className="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg bg-base-200 cursor-pointer text-sm" onDoubleClick={() => openEdit(child)}>
                        <div className="flex-1 min-w-0">
                          <span className="truncate block">{child.name}</span>
                          <span className="text-[10px] text-base-content/40">
                            {child._count?.tickets ?? 0} tickets &middot; {child._count?.assets ?? 0} ativos
                          </span>
                        </div>
                        <button className="btn btn-ghost btn-xs text-error shrink-0" onClick={(e) => { e.stopPropagation(); if (confirm(`Remover "${child.name}"?`)) deleteMutation.mutate(child.id); }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
