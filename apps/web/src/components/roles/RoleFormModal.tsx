import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesService } from '../../services/roles';
import type { Permission, Role } from '../../types/api';

interface Props {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  permissions: Permission[];
  role?: Role;
}

function groupPermissions(permissions: Permission[]) {
  const map: Record<string, Permission[]> = {};
  for (const p of permissions) {
    const g = p.key.split('.')[0];
    if (!map[g]) map[g] = [];
    map[g].push(p);
  }
  return map;
}

export function RoleFormModal({ modalRef, permissions, role }: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!role;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description ?? '');
      setSelectedPerms(new Set((role.permissions ?? []).map((rp) => rp.permission.id)));
    } else {
      setName('');
      setDescription('');
      setSelectedPerms(new Set());
    }
  }, [role, modalRef]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit && role) {
        await rolesService.update(role.id, { name, description: description || undefined });
        const currentIds = new Set((role.permissions ?? []).map((rp) => rp.permission.id));
        for (const id of currentIds) {
          if (!selectedPerms.has(id)) {
            await rolesService.removePermission(role.id, id);
          }
        }
        for (const id of selectedPerms) {
          if (!currentIds.has(id)) {
            await rolesService.assignPermission(role.id, id);
          }
        }
      } else {
        const created = await rolesService.create({ name, description: description || undefined });
        for (const id of selectedPerms) {
          await rolesService.assignPermission(created.id, id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      closeModal();
    },
  });

  const closeModal = () => {
    if (!isEdit) {
      setName('');
      setDescription('');
      setSelectedPerms(new Set());
    }
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

  const groups = groupPermissions(permissions);

  const groupState = (ids: string[]) => {
    const selected = ids.filter((id) => selectedPerms.has(id)).length;
    if (selected === 0) return 'none';
    if (selected === ids.length) return 'all';
    return 'partial';
  };

  const toggleGroup = (ids: string[], force?: boolean) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      const wantSelected = force ?? groupState(ids) !== 'all';
      for (const id of ids) {
        if (wantSelected) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box w-full max-w-xl">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeModal}>
          ✕
        </button>
        <h3 className="font-bold text-lg mb-6">{isEdit ? 'Editar Papel' : 'Novo Papel'}</h3>

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
            <div className="max-h-72 overflow-y-auto border border-base-200 rounded-box p-3 space-y-4">
              {Object.entries(groups).map(([group, perms]) => {
                const state = groupState(perms.map((p) => p.id));
                return (
                  <div key={group}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium capitalize">{group}</span>
                      <button
                        type="button"
                        className="text-xs link link-hover"
                        onClick={() => toggleGroup(perms.map((p) => p.id))}
                      >
                        {state === 'all' ? 'Desmarcar todos' : 'Marcar todos'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {perms.map((p) => (
                        <label key={p.id} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-xs"
                            checked={selectedPerms.has(p.id)}
                            onChange={() => togglePerm(p.id)}
                          />
                          <span className="text-sm">{p.key.split('.')[1] || p.key}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending || !name.trim()}>
              {mutation.isPending ? <span className="loading loading-spinner loading-xs" /> : (isEdit ? 'Salvar' : 'Criar')}
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
