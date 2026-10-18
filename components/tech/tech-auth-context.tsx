"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import apiClient from "@/lib/api/client";

export interface TechUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tenantId: string;
  tenantName?: string;
  departmentName?: string;
  avatarUrl?: string;
  bio?: string;
  certifications?: string[];
  rating?: number;
  jobsCompletedCount?: number;
  termsAcknowledged?: boolean;
  commissionRate?: number;
  isFieldTech?: boolean;
}

interface TechAuthContextType {
  user: TechUser | null;
  token: string | null;
  isLoading: boolean;
  isOnline: boolean;
  isAuthenticated: boolean;
  loginSession: (token: string, user: TechUser, requiresTerms: boolean) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const TechAuthContext = createContext<TechAuthContextType | undefined>(undefined);

export function TechAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<TechUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // 1. Detect field network connectivity
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // 2. Hydrate session from offline storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedToken = localStorage.getItem("serviceos_tech_token");
        const storedUser = localStorage.getItem("serviceos_tech_user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Failed to hydrate technician session from offline storage:", err);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const loginSession = (newToken: string, newUser: TechUser, requiresTerms: boolean) => {
    setToken(newToken);
    setUser(newUser);

    if (typeof window !== "undefined") {
      localStorage.setItem("serviceos_tech_token", newToken);
      localStorage.setItem("serviceos_tech_user", JSON.stringify(newUser));
    }

    if (requiresTerms) {
      router.push("/tech/terms");
    } else {
      router.push("/tech/jobs");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("serviceos_tech_token");
      localStorage.removeItem("serviceos_tech_user");
    }

    router.push("/tech/login");
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await apiClient.get<TechUser>("/hr/technicians/me");
      if (res.data) {
        setUser(res.data);
        if (typeof window !== "undefined") {
          localStorage.setItem("serviceos_tech_user", JSON.stringify(res.data));
        }
      }
    } catch (err) {
      console.warn("Could not refresh technician profile online, maintaining cached session:", err);
    }
  };

  return (
    <TechAuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isOnline,
        isAuthenticated: !!token && !!user,
        loginSession,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </TechAuthContext.Provider>
  );
}

export function useTechAuth() {
  const context = useContext(TechAuthContext);
  if (!context) {
    throw new Error("useTechAuth must be used within a TechAuthProvider");
  }
  return context;
}
