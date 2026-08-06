import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomName: string) => void;
  leaveRoom: (roomName: string) => void;
  emitEvent: (event: string, payload?: any) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinRoom: () => {},
  leaveRoom: () => {},
  emitEvent: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Resolve target backend URL dynamically
    const metaEnv = (import.meta as any).env || {};
    const backendUrl =
      metaEnv.VITE_SOCKET_URL ||
      metaEnv.VITE_API_URL ||
      (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);

    const socketInstance: Socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to CWC Socket.io Server:', socketInstance.id);
      setIsConnected(true);
      // Auto-join global & student dashboard rooms
      socketInstance.emit('join-room', 'global');
      socketInstance.emit('join-room', 'student-dashboard');
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('🔌 Disconnected from Socket.io Server:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinRoom = (roomName: string) => {
    if (socket && isConnected) {
      socket.emit('join-room', roomName);
    }
  };

  const leaveRoom = (roomName: string) => {
    if (socket && isConnected) {
      socket.emit('leave-room', roomName);
    }
  };

  const emitEvent = (event: string, payload?: any) => {
    if (socket && isConnected) {
      socket.emit(event, payload);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinRoom,
        leaveRoom,
        emitEvent,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
