import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield, Users as UsersIcon, Pencil, Trash2, UserPlus, UserCog,
} from 'lucide-react';
import { rolesService } from '../services/roles';
import { permissionsService } from '../services/permissions';
import { usersService } from '../services/users';
import { RoleFormModal } from '../components/roles/RoleFormModal';
import { UserCreateModal } from '../components/users/UserCreateModal';
import { UserEditModal } from '../components/users/UserEditModal';
import { UserRoleModal } from '../components/roles/UserRoleModal';
import type { Role, User } from '../types/api';

const AVATAR_COLORS = [
  'bg-primary', 'bg-secondary', 'bg-accent', 'bg-info',
  'bg-success', 'bg-warning', 'bg-error', 'bg-neutral',
];

function Avatar({ name }: { name: string }) {
  const colorIdx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return (
    <div
      className={`w-8 h-8 rounded-full ${AVATAR_COLORS[colorIdx]} text-primary-content flex items-center justify-center text-xs font-semibold shrink-0`}
      title={name}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function Users() {
  const createRoleRef = useRef<HTMLDialogElement | null>(null);
  const editRoleRef = useRef<HTMLDialogElement | null>(null);
  const createUserRef = useRef<HTMLDialogElement | null>(null);
  const userRoleRef = useRef<HTMLDialogElement | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [managingRole, setManagingRole] = useState<Role | null>(null);
  const editUserRef = useRef<HTMLDialogElement | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesService.findAll,
  });

  const { data: permissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionsService.findAll,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.findAll,
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => rolesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Shield size={24} className="text-primary" />
            <h1 className="text-3xl font-bold">Usuários</h1>
          </div>
          <button className="btn btn-primary" onClick={() => createUserRef.current?.showModal()}>
            <UserPlus size={18} />
            Novo Usuário
          </button>
        </div>

        <RoleFormModal modalRef={createRoleRef} permissions={permissions ?? []} />
        <RoleFormModal
          modalRef={editRoleRef}
          permissions={permissions ?? []}
          role={editingRole ?? undefined}
        />
        <UserCreateModal modalRef={createUserRef} />
        <UserRoleModal
          modalRef={userRoleRef}
          role={managingRole ?? ({} as Role)}
          users={users ?? []}
        />
        <UserEditModal
          modalRef={editUserRef}
          user={editingUser}
        />

        {rolesLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <button
              className="bg-base-100 rounded-box shadow-sm border-2 border-dashed border-base-300 p-5 flex flex-col items-center justify-center gap-3 min-h-[200px] hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
              onClick={() => createRoleRef.current?.showModal()}
            >
              <img src="/svg/role.svg" alt="Criar papel" className="w-12 h-12 opacity-40" />
              <span className="text-sm font-medium text-base-content/50">Criar Papel</span>
            </button>

            {roles && roles.length > 0 ? roles.map((role) => {
              const members = role.users ?? [];
              const visible = members.slice(0, 10);
              const remaining = members.length - visible.length;

              return (
                <div key={role.id} className="bg-base-100 rounded-box shadow-sm border border-base-200 p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Shield size={20} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{role.name}</h3>
                        {role.description && (
                          <p className="text-xs text-base-content/50 truncate">{role.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => { setEditingRole(role); editRoleRef.current?.showModal(); }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => { if (confirm(`Remover papel "${role.name}"?`)) deleteRoleMutation.mutate(role.id); }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-base-200 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-base-content/60">
                        <UsersIcon size={14} />
                        <span>{members.length} {members.length === 1 ? 'usuário' : 'usuários'}</span>
                      </div>
                      <button
                        className="btn btn-ghost btn-xs gap-1"
                        onClick={() => { setManagingRole(role); userRoleRef.current?.showModal(); }}
                      >
                        <UserCog size={12} />
                        Gerenciar
                      </button>
                    </div>

                    {members.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2">
                          {visible.map((ur) => (
                            <Avatar key={ur.user.id} name={ur.user.name} />
                          ))}
                        </div>
                        {remaining > 0 && (
                          <span className="text-xs text-base-content/40 font-medium ml-1">+{remaining}</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-base-content/30 italic">Nenhum usuário vinculado</p>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full text-center text-base-content/50 py-12 bg-base-100 rounded-box border border-base-200">
                Nenhum papel encontrado
              </div>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Lista de Usuários</h2>

        {usersLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-md" />
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
                </tr>
              </thead>
              <tbody>
                {(!users || users.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="text-center text-base-content/50 py-8">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover cursor-pointer"
                      onDoubleClick={() => { setEditingUser(u); editUserRef.current?.showModal(); }}
                    >
                      <td className="flex items-center gap-2">
                        <Avatar name={u.name} />
                        {u.name}
                      </td>
                      <td className="text-sm">{u.email}</td>
                      <td>
                        <span className={`badge badge-sm ${u.active ? 'badge-success' : 'badge-ghost'}`}>
                          {u.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="text-sm text-base-content/60">
                        {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
