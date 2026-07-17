"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Moon, Search, Sparkles, Sun, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { roleLabel } from "@/lib/auth/auth-store";

interface HeaderProps {
  showCopilot?: boolean;
  onToggleCopilot?: () => void;
  copilotOpen?: boolean;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Header({
  showCopilot = true,
  onToggleCopilot,
  copilotOpen = false,
}: HeaderProps) {
  const { session, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!session) return null;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
        <input
          type="search"
          placeholder="Search employees, modules, reports..."
          className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm text-text placeholder:text-text-dim focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title={theme === "dark" ? "Light theme" : "Dark theme"}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button
          type="button"
          className="relative rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-elevated"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-white">
              {initials(session.name)}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-text">{session.name}</p>
              <p className="text-xs text-text-dim">{roleLabel(session.role)}</p>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-text-dim transition-transform", menuOpen && "rotate-180")} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-border bg-surface py-1 shadow-xl">
              <div className="border-b border-border px-4 py-2">
                <p className="text-sm font-medium text-text">{session.name}</p>
                <p className="text-xs text-text-dim">{session.email}</p>
              </div>
              {isAdmin && (
                <Link
                  href="/users"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-elevated hover:text-text"
                >
                  <UserCog className="h-4 w-4" />
                  Manage Users
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger/10"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {showCopilot && (
          <button
            type="button"
            onClick={onToggleCopilot}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              copilotOpen
                ? "bg-primary text-white"
                : "bg-primary text-white hover:bg-primary-hover"
            )}
          >
            <Sparkles className="h-4 w-4" />
            AI Copilot
          </button>
        )}
      </div>
    </header>
  );
}