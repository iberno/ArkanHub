export interface Toast {
  id: string;
  title: string;
  body: string;
  type: string;
  ticketId?: string;
}

let toastId = 0;

const listeners = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

function notify() {
  listeners.forEach((fn) => fn(toasts));
}

export const toastStore = {
  subscribe(fn: (toasts: Toast[]) => void) {
    listeners.add(fn);
    fn(toasts);
    return () => listeners.delete(fn);
  },

  getSnapshot() {
    return toasts;
  },

  add(t: Omit<Toast, 'id'>) {
    const id = String(++toastId);
    toasts = [...toasts, { ...t, id }];
    notify();
    setTimeout(() => this.remove(id), 6000);
  },

  remove(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
};
