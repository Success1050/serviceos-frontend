"use client";

import React from "react";
import QueryProvider from "./query-provider";
import SocketProvider from "./socket-provider";
import AuthProvider from "./auth-provider";
import NotificationProvider from "./notification-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SocketProvider>
        <AuthProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </AuthProvider>
      </SocketProvider>
    </QueryProvider>
  );
}

export default AppProviders;
