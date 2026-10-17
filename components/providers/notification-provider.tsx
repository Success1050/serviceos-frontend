"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useSocket } from "./socket-provider";
import { playNotificationSound } from "@/lib/utils/sound";
import { AppNotification } from "@/lib/types";
import { NotificationDrawer } from "../notifications/notification-drawer";
import { NotificationToast } from "../notifications/notification-toast";

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  soundEnabled: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  toggleSound: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  sendTestNotification: (payload?: Partial<AppNotification>) => void;
  isSendingTest: boolean;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isDrawerOpen: false,
  soundEnabled: true,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
  toggleSound: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  sendTestNotification: () => {},
  isSendingTest: false,
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize sound preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("serviceos_sound_enabled");
      if (stored !== null) {
        setSoundEnabled(stored === "true");
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("serviceos_sound_enabled", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery<AppNotification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<AppNotification[]>("/notifications/me");
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
    staleTime: 30000,
  });

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Mark single as read mutation with optimistic update
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/notifications/${id}/read`);
      return id;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData<AppNotification[]>(["notifications"]) || [];

      queryClient.setQueryData<AppNotification[]>(
        ["notifications"],
        previous.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read mutation with optimistic update
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch("/notifications/read-all");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData<AppNotification[]>(["notifications"]) || [];

      queryClient.setQueryData<AppNotification[]>(
        ["notifications"],
        previous.map((n) => ({ ...n, isRead: true }))
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Send test notification mutation
  const sendTestMutation = useMutation({
    mutationFn: async (payload?: Partial<AppNotification>) => {
      const res = await apiClient.post<AppNotification>("/notifications/test", payload || {});
      return res.data;
    },
  });

  // Listen to WebSocket events for real-time notification push
  useEffect(() => {
    if (!socket) return;

    const handleNotificationEvent = (incoming: any) => {
      console.log("🔔 [NotificationCenter] Realtime push received:", incoming);
      if (!incoming) return;

      const notif: AppNotification = {
        id: incoming.id || `ws-${Date.now()}`,
        tenantId: incoming.tenantId || "",
        userId: incoming.userId || null,
        title: incoming.title || "New Notification",
        message: incoming.message || "You have a new update in ServiceOS.",
        type: incoming.type || "INFO",
        isRead: false,
        linkUrl: incoming.linkUrl || null,
        createdAt: incoming.createdAt || new Date().toISOString(),
        updatedAt: incoming.updatedAt || new Date().toISOString(),
      };

      // Play audio chime if sound is enabled
      if (soundEnabled) {
        playNotificationSound();
      }

      // Show floating toast alert
      setActiveToast(notif);

      // Prepend to React Query notifications list immediately
      queryClient.setQueryData<AppNotification[]>(["notifications"], (old = []) => {
        const exists = old.some((item) => item.id === notif.id);
        if (exists) return old;
        return [notif, ...old];
      });

      // Invalidate to ensure sync with server
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    socket.on("notification", handleNotificationEvent);

    return () => {
      socket.off("notification", handleNotificationEvent);
    };
  }, [socket, soundEnabled, queryClient]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const markAsRead = useCallback(
    (id: string) => {
      markAsReadMutation.mutate(id);
    },
    [markAsReadMutation]
  );

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const sendTestNotification = useCallback(
    (payload?: Partial<AppNotification>) => {
      sendTestMutation.mutate(payload);
    },
    [sendTestMutation]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        isDrawerOpen,
        soundEnabled,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        toggleSound,
        markAsRead,
        markAllAsRead,
        sendTestNotification,
        isSendingTest: sendTestMutation.isPending,
      }}
    >
      {children}

      {/* Global Notification Toast */}
      <NotificationToast
        notification={activeToast}
        onDismiss={() => setActiveToast(null)}
        onOpenDrawer={openDrawer}
      />

      {/* Global Slide-over Drawer */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        notifications={notifications}
        isLoading={isLoading}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onSendTestNotification={sendTestNotification}
        isSendingTest={sendTestMutation.isPending}
      />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}

export default NotificationProvider;
