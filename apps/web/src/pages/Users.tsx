import { useQuery } from '@tanstack/react-query';
import { Shield, Users as UsersIcon } from 'lucide-react';
import { rolesService } from '../services/roles';

const AVATAR_COLORS = [
  'bg-primary',
  'bg-secondary',
  'bg-accent',
  'bg-info',
  'bg-success',
  'bg-warning',
  'bg-error',
  'bg-neutral',
];

function Avatar({ name, className }: { name: string; className?: string }) {
  const colorIdx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return (
    <div
      className={`w-8 h-8 rounded-full ${AVATAR_COLORS[colorIdx]} text-primary-content flex items-center justify-center text-xs font-semibold shrink-0 ${className ?? ''}`}
      title={name}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function Users() {
  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesService.findAll,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="text-center text-base-content/50 py-12">
        Nenhum papel encontrado
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield size={24} className="text-primary" />
        <h1 className="text-3xl font-bold">Papéis & Permissões</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {roles.map((role) => {
          const members = role.users ?? [];
          const visible = members.slice(0, 10);
          const remaining = members.length - visible.length;

          return (
            <div key={role.id} className="bg-base-100 rounded-box shadow-sm border border-base-200 p-5">
              <div className="flex items-center gap-3 mb-3">
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

              {role.permissions && role.permissions.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {role.permissions.map((rp) => (
                    <span key={rp.permission.id} className="badge badge-sm badge-outline badge-ghost">
                      {rp.permission.key}
                    </span>
                  ))}
                </div>
              )}

              <div className="border-t border-base-200 pt-3">
                <div className="flex items-center gap-1.5 mb-2 text-xs text-base-content/60">
                  <UsersIcon size={14} />
                  <span>{members.length} {members.length === 1 ? 'usuário' : 'usuários'}</span>
                </div>

                {members.length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-2">
                      {visible.map((ur) => (
                        <Avatar key={ur.user.id} name={ur.user.name} />
                      ))}
                    </div>
                    {remaining > 0 && (
                      <span className="text-xs text-base-content/40 font-medium ml-1">
                        +{remaining}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-base-content/30 italic">Nenhum usuário vinculado</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
