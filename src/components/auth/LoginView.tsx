"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_CREDENTIALS } from "@/lib/auth/default-users";
import { roleLabel } from "@/lib/auth/auth-store";

export function LoginView() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(username, password);
    if (!result.ok) setError(result.error ?? "Login failed.");
    setSubmitting(false);
  };

  const fillDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError("");
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-primary/20 via-background to-accent/10 p-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <div className="flex gap-0.5">
              <div className="h-5 w-1 rounded-full bg-white/90" />
              <div className="h-5 w-1 rounded-full bg-white/70" />
              <div className="h-5 w-1 rounded-full bg-white/50" />
            </div>
          </div>
          <div>
            <p className="font-semibold text-text">MSNC PeopleHub</p>
            <p className="text-xs text-text-dim">HRMS Enterprise</p>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-text">Enterprise HR System</h2>
          <p className="mt-2 max-w-md text-text-muted">
            Mock login for development — easy to debug before connecting a real database.
          </p>
        </div>
        <p className="text-xs text-text-dim">© 2026 MSNC Group · On-premise ready</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-lg font-semibold text-text">MSNC PeopleHub</p>
            <p className="text-sm text-text-dim">Sign in to your account</p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-8 shadow-xl">
            <h1 className="text-xl font-semibold text-text">Sign In</h1>
            <p className="mt-1 text-sm text-text-muted">Enter your username and password</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-muted">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin / hr / staff"
                    className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-muted">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign In
              </button>
            </form>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-surface/50 p-4">
            <p className="mb-2 text-xs font-medium text-text-muted">Demo accounts (click to fill)</p>
            <div className="space-y-1.5">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.username}
                  type="button"
                  onClick={() => fillDemo(cred.username, cred.password)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-left text-xs transition-colors hover:border-primary/50"
                >
                  <span className="font-medium text-text">{roleLabel(cred.role)}</span>
                  <span className="text-text-dim">
                    {cred.username} / {cred.password}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}