import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

let socketInstance = null;

export function useSocket() {
    const { token } = useAuth();
    const socketRef = useRef(null);

    useEffect(() => {
        if (!token) return;

        // Create socket connection once
        if (!socketInstance) {
            socketInstance = io(import.meta.env.VITE_WS_URL || 'http://localhost:8000', {
                auth: { token },
                transports: ['websocket'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
            });
        }

        socketRef.current = socketInstance;

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        socketInstance.on('connect_error', (err) => {
            console.warn('Socket connection error:', err.message);
        });

        return () => {
            // Don't disconnect on component unmount — keep alive
        };
    }, [token]);

    const emit = useCallback((event, data) => {
        socketRef.current?.emit(event, data);
    }, []);

    const on = useCallback((event, handler) => {
        socketRef.current?.on(event, handler);
        return () => socketRef.current?.off(event, handler);
    }, []);

    const off = useCallback((event, handler) => {
        socketRef.current?.off(event, handler);
    }, []);

    return { socket: socketRef.current, emit, on, off };
}

// Call this on logout to fully disconnect
export function disconnectSocket() {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
}