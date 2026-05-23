import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, BellRing, Trash2, CheckCheck } from 'lucide-react';
import { notificationsService } from '../services/notifications';

export function Notifications() {
  const queryClient = useQueryClient();

  const { data: notifs, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.findAll,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }) },
  });

  const markAllRead = useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }) },
  });

  const remove = useMutation({
    mutationFn: (id: string) => notificationsService.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }) },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Bell size={24} className="text-primary" />
          <h1 className="text-3xl font-bold">Notificações</h1>
        </div>
        <button className="btn btn-ghost btn-sm gap-1" onClick={() => markAllRead.mutate()}>
          <CheckCheck size={16} /> Marcar todas como lidas
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
      ) : !notifs || notifs.length === 0 ? (
        <div className="text-center text-base-content/50 py-12 bg-base-100 rounded-box border border-base-200">
          Nenhuma notificação
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 p-4 rounded-box border ${
                n.read ? 'bg-base-100 border-base-200' : 'bg-primary/5 border-primary/20'
              }`}
            >
              <div className={`mt-0.5 ${n.read ? 'text-base-content/30' : 'text-primary'}`}>
                {n.read ? <Bell size={18} /> : <BellRing size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className={`font-medium text-sm ${n.read ? '' : 'font-semibold'}`}>{n.title}</h3>
                    <p className="text-sm text-base-content/70 mt-0.5">{n.body}</p>
                    <p className="text-xs text-base-content/40 mt-1">{new Date(n.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && (
                      <button className="btn btn-ghost btn-xs" onClick={() => markRead.mutate(n.id)}>
                        <CheckCheck size={14} />
                      </button>
                    )}
                    <button className="btn btn-ghost btn-xs text-error" onClick={() => remove.mutate(n.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
