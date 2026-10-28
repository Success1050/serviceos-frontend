"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Tenant, Role } from "@/lib/types";
import apiClient from "@/lib/api/client";
import { disconnectSocket } from "@/lib/socket/socket-client";

interface AuthContextValue {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User, tenant?: Tenant) => void;
  logout: () => void;
  hasRole: (roles: Role | Role[]) => boolean;
  hasPermission: (permission: string) => boolean;
  setTenant: (tenant: Tenant) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenantState] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate session on client mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("serviceos_token");
      const storedUser = localStorage.getItem("serviceos_user");
      const storedTenant = localStorage.getItem("serviceos_tenant");

      if (storedToken && storedUser) {
        setToken(storedToken);
        document.cookie = `serviceos_token=${storedToken}; path=/; max-age=86400; SameSite=Lax`;
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (storedTenant) {
          setTenantState(JSON.parse(storedTenant));
        }

        // Verify session freshness with backend /auth/me
        apiClient
          .get("/auth/me")
          .then((res) => {
            if (res.data?.user) {
              setUser(res.data.user);
              localStorage.setItem("serviceos_user", JSON.stringify(res.data.user));
            }
            if (res.data?.tenant) {
              setTenantState(res.data.tenant);
              localStorage.setItem("serviceos_tenant", JSON.stringify(res.data.tenant));
            }
          })
          .catch(() => {
            // If /auth/me returns 401, client interceptor will handle redirect
          });
      } else {
        // No client session: drop any orphaned cookie so proxy.ts doesn't bounce /login -> /app (redirect loop)
        document.cookie = "serviceos_token=; path=/; max-age=0; SameSite=Lax";
      }
    } catch (e) {
      console.error("Failed to hydrate auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newToken: string, newUser: User, newTenant?: Tenant) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("serviceos_token", newToken);
    localStorage.setItem("serviceos_user", JSON.stringify(newUser));
    document.cookie = `serviceos_token=${newToken}; path=/; max-age=86400; SameSite=Lax`;

    if (newTenant) {
      setTenantState(newTenant);
      localStorage.setItem("serviceos_tenant", JSON.stringify(newTenant));
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setTenantState(null);
    localStorage.removeItem("serviceos_token");
    localStorage.removeItem("serviceos_user");
    localStorage.removeItem("serviceos_tenant");
    document.cookie = "serviceos_token=; path=/; max-age=0";
    disconnectSocket();
    window.location.href = "/login";
  }, []);

  const setTenant = useCallback((newTenant: Tenant) => {
    setTenantState(newTenant);
    localStorage.setItem("serviceos_tenant", JSON.stringify(newTenant));
  }, []);

  const hasRole = useCallback(
    (roles: Role | Role[]): boolean => {
      if (!user) return false;
      const roleList = Array.isArray(roles) ? roles : [roles];
      return roleList.includes(user.role);
    },
    [user]
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (user.role === "PLATFORM_ADMIN" || user.role === "TENANT_OWNER") return true;
      return user.permissions?.includes(permission) ?? false;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        hasRole,
        hasPermission,
        setTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function usePermissions() {
  const { user, hasPermission, hasRole } = useAuth();
  return {
    permissions: user?.permissions || [],
    hasPermission,
    hasRole,
    isSuperAdmin: Boolean(user?.isSuperAdmin || user?.role === "PLATFORM_ADMIN"),
    isOwner: user?.role === "TENANT_OWNER",
  };
}

export default AuthProvider;
