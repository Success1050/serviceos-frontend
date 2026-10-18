"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { getSocket, resolveActiveToken, reconnectSocket, disconnectSocket } from "@/lib/socket/socket-client";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  subscribe: (event: string, handler: (data: any) => void) => () => void;
  reconnect: (newToken?: string) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  emit: () => {},
  subscribe: () => () => {},
  reconnect: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const currentTokenRef = useRef<string | null>(null);

  const connectOrUpdateSocket = useCallback((explicitToken?: string) => {
    const token = resolveActiveToken(explicitToken);

    if (!token) {
      if (socket && isConnected) {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
        currentTokenRef.current = null;
      }
      return;
    }

    // If token changed or socket not initialized, connect with active token
    if (!socket || currentTokenRef.current !== token) {
      currentTokenRef.current = token;
      const s = getSocket(token);
      setSocket(s);

      if (!s.connected) {
        s.connect();
      }
    } else if (!socket.connected) {
      socket.connect();
    }
  }, [socket, isConnected]);

  const reconnect = useCallback((newToken?: string) => {
    const s = reconnectSocket(newToken);
    setSocket(s);
    currentTokenRef.current = resolveActiveToken(newToken);
  }, []);

  // Sync socket on pathname changes or auth storage events
  useEffect(() => {
    connectOrUpdateSocket();

    const handleAuthChange = () => {
      connectOrUpdateSocket();
    };

    window.addEventListener("auth:change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth:change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [pathname, connectOrUpdateSocket]);

  // Wire up socket realtime listeners and query cache invalidations
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setIsConnected(true);
      console.log("⚡ [WebSocket] Connected to ServiceOS Realtime Gateway");
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log("⚡ [WebSocket] Disconnected from Realtime Gateway");
    };

    const invalidatePortalAndJobs = () => {
      queryClient.invalidateQueries({ queryKey: ["portal-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    };

    // Auto-invalidation handler: when backend pushes an event, invalidate matching TanStack queries
    const onRealtimeEvent = (payload: { entity?: string; type?: string; [key: string]: any }) => {
      console.log("⚡ [WebSocket] Realtime event received:", payload);
      invalidatePortalAndJobs();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("realtime_update", onRealtimeEvent);
    socket.on("job:assigned", invalidatePortalAndJobs);
    socket.on("job_dispatched", invalidatePortalAndJobs);
    socket.on("service_request_updated", invalidatePortalAndJobs);
    socket.on("customer_updated", () => queryClient.invalidateQueries({ queryKey: ["customers"] }));
    socket.on("invitation_claimed", () => queryClient.invalidateQueries({ queryKey: ["customers"] }));
    socket.on("notification", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["portal-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    });

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("realtime_update", onRealtimeEvent);
      socket.off("job:assigned", invalidatePortalAndJobs);
      socket.off("job_dispatched", invalidatePortalAndJobs);
      socket.off("service_request_updated", invalidatePortalAndJobs);
      socket.off("customer_updated");
      socket.off("invitation_claimed");
      socket.off("notification");
    };
  }, [socket, queryClient]);

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
    <SocketContext.Provider value={{ socket, isConnected, emit, subscribe, reconnect }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

export default SocketProvider;
