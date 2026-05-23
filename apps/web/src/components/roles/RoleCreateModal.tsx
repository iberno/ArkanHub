import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesService } from '../../services/roles';
import type { Permission } from '../../types/api';

interface Props {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  permissions: Permission[];
}

export function RoleCreateModal({ modalRef, permissions }: Props) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

  const mutation = useMutation({
    mutationFn: async () => {
      const role = await rolesService.create({ name, description: description || undefined });
      for (const permId of selectedPerms) {
        await rolesService.assignPermission(role.id, permId);
      }
      return role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      closeModal();
    },
  });

  const closeModal = () => {
    setName('');
    setDescription('');
    setSelectedPerms(new Set());
    modalRef.current?.close();
  };

  const togglePerm = (id: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box w-full max-w-lg">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeModal}>
          ✕
        </button>
        <h3 className="font-bold text-lg mb-6">Novo Papel</h3>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Nome</span></label>
            <input type="text" className="input input-bordered" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Descrição</span></label>
            <input type="text" className="input input-bordered" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Permissões</span></label>
            <div className="flex flex-wrap gap-2 mt-1">
              {permissions.map((p) => (
                <label key={p.id} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs"
                    checked={selectedPerms.has(p.id)}
                    onChange={() => togglePerm(p.id)}
                  />
                  <span className="text-sm">{p.key}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending || !name.trim()}>
              {mutation.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Criar'}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={closeModal}>fechar</button>
      </form>
    </dialog>
  );
}
