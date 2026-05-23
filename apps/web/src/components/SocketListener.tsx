import { useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { toastStore } from '../store/toast';

export function SocketListener() {
  const socketRef = useSocket();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onNotification = (notif: { id: string; title: string; body: string; type: string }) => {
      toastStore.add({
        title: notif.title,
        body: notif.body,
        type: notif.type || 'system',
      });
    };

    socket.on('notification:new', onNotification);
    return () => { socket.off('notification:new', onNotification); };
  }, [socketRef.current]);

  return null;
}
