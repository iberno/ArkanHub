import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth';

let sharedSocket: Socket | null = null;
let sharedSubs = 0;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;

    if (!sharedSocket) {
      sharedSocket = io('/ws', {
        auth: { token },
        transports: ['websocket', 'polling'],
      });
    }
    sharedSubs++;
    socketRef.current = sharedSocket;

    return () => {
      sharedSubs--;
      if (sharedSubs <= 0 && sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
      }
      socketRef.current = null;
    };
  }, [token]);

  return socketRef;
}
