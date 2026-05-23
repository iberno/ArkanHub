import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../services/users';
import type { User, Role } from '../../types/api';

interface Props {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  role: Role;
  users: User[];
}

export function UserRoleModal({ modalRef, role, users }: Props) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (role) {
      setSelected(new Set((role.users ?? []).map((u) => u.user.id)));
    }
  }, [role, modalRef]);

  const mutation = useMutation({
    mutationFn: async () => {
      const current = new Set((role.users ?? []).map((u) => u.user.id));
      for (const id of current) {
        if (!selected.has(id)) {
          await usersService.removeRole(id, role.id);
        }
      }
      for (const id of selected) {
        if (!current.has(id)) {
          await usersService.assignRole(id, role.id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      modalRef.current?.close();
    },
  });

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box w-full max-w-md">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => modalRef.current?.close()}>
          ✕
        </button>
        <h3 className="font-bold text-lg mb-1">{role.name}</h3>
        <p className="text-sm text-base-content/50 mb-4">Selecione os usuários deste papel</p>

        <div className="max-h-80 overflow-y-auto space-y-1">
          {users.map((u) => (
            <label key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={selected.has(u.id)}
                onChange={() => toggle(u.id)}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{u.name}</p>
                <p className="text-xs text-base-content/40 truncate">{u.email}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={() => modalRef.current?.close()}>Cancelar</button>
          <button className="btn btn-primary" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? <span className="loading loading-spinner loading-xs" /> : 'Salvar'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>fechar</button>
      </form>
    </dialog>
  );
}
