"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import apiClient from "@/lib/api/client";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { Building2, Lock, Mail, ShieldAlert, Sparkles, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  useEffect(() => {
    if (searchParams.get("session_expired") === "true") {
      setSessionExpiredNotice(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const { accessToken, user, tenant } = res.data;

      login(accessToken, user, tenant);

      // Route based on role
      if (user.role === "TECHNICIAN" || user.isFieldTech) {
        router.push("/tech");
      } else if (user.role === "PLATFORM_ADMIN" || user.isSuperAdmin) {
        router.push("/superadmin");
      } else if (user.role === "HQ_ADMIN") {
        router.push("/hq");
      } else {
        router.push("/app/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-[#006937] items-center justify-center text-white shadow-md mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">ServiceOS Enterprise</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-Tenant Operating System for Field Contractors</p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center pb-2">
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>Enter your email and credentials to access your tenant operations</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionExpiredNotice && (
              <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Your session has expired or authentication token was invalid. Please sign in again.</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                required
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600">
                  <input type="checkbox" className="rounded border-slate-300 text-[#006937] focus:ring-[#006937]" />
                  Remember me
                </label>
                <a href="#" className="font-semibold text-[#006937] hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full mt-2">
                Sign In
              </Button>
            </form>

            {/* Quick Demo Credentials for Testing */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Quick Demo Credentials (Click to fill)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("owner@sunshinesolar.com");
                    setPassword("Password123!");
                  }}
                  className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-semibold transition-all cursor-pointer"
                >
                  🏢 Tenant Owner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("hq@sunshinesolar.com");
                    setPassword("Password123!");
                  }}
                  className="px-2 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[11px] font-semibold transition-all cursor-pointer"
                >
                  🏛️ Franchise HQ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("superadmin@serviceos.platform");
                    setPassword("Password123!");
                  }}
                  className="px-2 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[11px] font-semibold transition-all cursor-pointer"
                >
                  👑 SuperAdmin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("tech@sunshinesolar.com");
                    setPassword("Password123!");
                  }}
                  className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-[11px] font-semibold transition-all cursor-pointer"
                >
                  ⚡ Field Tech
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2 text-center text-xs text-slate-500">
              <div>
                Don&apos;t have an enterprise account?{" "}
                <Link href="/register" className="font-semibold text-[#006937] hover:underline">
                  Register your company →
                </Link>
              </div>
              <div>
                Field Technician?{" "}
                <Link href="/tech/login" className="font-semibold text-[#006937] hover:underline">
                  Login with 4-Digit SMS PIN →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex w-12 h-12 rounded-xl bg-[#006937] items-center justify-center text-white shadow-md mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">ServiceOS Enterprise</h1>
              <p className="text-xs text-slate-500 mt-1">Multi-Tenant Operating System for Field Contractors</p>
            </div>
            <Card className="shadow-lg border-slate-200">
              <CardContent className="p-8 text-center text-slate-400 text-sm">
                Loading...
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

