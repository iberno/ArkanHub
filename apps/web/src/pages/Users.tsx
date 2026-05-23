import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, UserPlus } from 'lucide-react';
import { usersService } from '../services/users';
import { UserCreateModal } from '../components/users/UserCreateModal';

export function Users() {
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Usuários</h1>
        <button className="btn btn-primary" onClick={() => modalRef.current?.showModal()}>
          <UserPlus size={18} />
          Novo Usuário
        </button>
      </div>

      <UserCreateModal modalRef={modalRef} />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-box shadow-sm border border-base-200">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Status</th>
                <th>Criado em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(!users || users.length === 0) ? (
                <tr>
                  <td colSpan={5} className="text-center text-base-content/50 py-8">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover">
                    <td>{u.name}</td>
                    <td className="text-sm">{u.email}</td>
                    <td>
                      <span className={`badge badge-sm ${u.active ? 'badge-success' : 'badge-ghost'}`}>
                        {u.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="text-sm text-base-content/60">
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => { if (confirm('Remover usuário?')) deleteMutation.mutate(u.id); }}
                      >
                        <Trash2 size={14} />
                      </button>
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
