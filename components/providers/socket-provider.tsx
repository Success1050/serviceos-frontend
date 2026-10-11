"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, disconnectSocket } from "@/lib/socket/socket-client";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  subscribe: (event: string, handler: (data: any) => void) => () => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  emit: () => {},
  subscribe: () => () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("serviceos_token") : null;
    if (!token) return;

    const s = getSocket(token);
    setSocket(s);

    if (!s.connected) {
      s.connect();
    }

    const onConnect = () => {
      setIsConnected(true);
      console.log("⚡ [WebSocket] Connected to ServiceOS Realtime Engine");
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log("⚡ [WebSocket] Disconnected");
    };

    // Auto-invalidation handler: when backend pushes an event, invalidate matching TanStack queries
    const onRealtimeEvent = (payload: { entity?: string; type?: string; [key: string]: any }) => {
      console.log("⚡ [WebSocket] Event received:", payload);
      const entity = payload?.entity || payload?.type?.split(".")[0];

      if (entity) {
        switch (entity.toLowerCase()) {
          case "job":
          case "dispatch":
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            queryClient.invalidateQueries({ queryKey: ["dispatch"] });
            break;
          case "quote":
            queryClient.invalidateQueries({ queryKey: ["quotes"] });
            break;
          case "invoice":
          case "payment":
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            break;
          case "wallet":
          case "payout":
            queryClient.invalidateQueries({ queryKey: ["wallet"] });
            queryClient.invalidateQueries({ queryKey: ["payout-requests"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            break;
          case "ticket":
          case "support":
          case "warranty":
          case "dispute":
            queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
            break;
          case "notification":
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            break;
          default:
            queryClient.invalidateQueries({ queryKey: [entity] });
        }
      }
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("realtime_update", onRealtimeEvent);
    s.on("notification", () => queryClient.invalidateQueries({ queryKey: ["notifications"] }));

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("realtime_update", onRealtimeEvent);
      s.off("notification");
    };
  }, [queryClient]);

  const emit = useCallback((event: string, data?: any) => {
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }, [socket]);

  const subscribe = useCallback((event: string, handler: (data: any) => void) => {
    if (socket) {
      socket.on(event, handler);
      return () => {
        socket.off(event, handler);
      };
    }
    return () => {};
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, emit, subscribe }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

export default SocketProvider;
