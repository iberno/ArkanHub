import { useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, UserCheck, GitPullRequest, Info } from 'lucide-react';
import { toastStore, type Toast } from '../../store/toast';

const icons: Record<string, React.ReactNode> = {
  assignment: <UserCheck size={16} />,
  system: <Bell size={16} />,
  approval: <GitPullRequest size={16} />,
};

export function ToastContainer() {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getSnapshot);
  const navigate = useNavigate();

  if (toasts.length === 0) return null;

  return (
    <div className="toast toast-end toast-bottom z-[100] gap-2">
      {toasts.map((t: Toast) => (
        <div
          key={t.id}
          className={`alert shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl ${
            t.type === 'assignment' ? 'alert-info' :
            t.type === 'approval' ? 'alert-warning' : ''
          }`}
          onClick={() => {
            if (t.ticketId) navigate(`/tickets`);
            toastStore.remove(t.id);
          }}
        >
          <div className="flex items-start gap-3">
            <span className="shrink-0 mt-0.5">{icons[t.type] || <Info size={16} />}</span>
            <div className="min-w-0">
              <p className="font-semibold text-sm">{t.title}</p>
              <p className="text-xs text-base-content/70 line-clamp-2">{t.body}</p>
            </div>
            <button
              className="btn btn-ghost btn-xs btn-square shrink-0"
              onClick={(e) => { e.stopPropagation(); toastStore.remove(t.id); }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
