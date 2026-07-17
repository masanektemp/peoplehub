"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, MessageSquarePlus, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { navGroups } from "@/lib/modules";
import { useAuth } from "@/contexts/AuthContext";

const OPEN_GROUPS_KEY = "peoplehub-sidebar-open-v1";

function loadOpenGroups(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(OPEN_GROUPS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveOpenGroups(groups: Set<string>) {
  try {
    sessionStorage.setItem(OPEN_GROUPS_KEY, JSON.stringify([...groups]));
  } catch {
    /* ignore */
  }
}

/**
 * Expand/collapse is manual only (click).
 * Open state is persisted in sessionStorage so navigating pages
 * does not reset / auto-close other groups (AppShell remounts each route).
 */
export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => loadOpenGroups());

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const feedbackActive = isActive("/feedback");

  const activeGroupLabels = useMemo(() => {
    const labels = new Set<string>();
    for (const group of navGroups) {
      if (group.items.some((item) => isActive(item.href))) {
        labels.add(group.label);
      }
    }
    if (pathname === "/users") labels.add("Admin");
    return labels;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Persist — survive remount when clicking Asset / Leave / etc.
  useEffect(() => {
    saveOpenGroups(openGroups);
  }, [openGroups]);

  // Only ensure current page's group is open — never close others
  useEffect(() => {
    setOpenGroups((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const label of activeGroupLabels) {
        if (!next.has(label)) {
          next.add(label);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [activeGroupLabels]);

  const isOpen = (label: string) => openGroups.has(label);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-[#0d1321]">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <div className="flex gap-0.5">
            <div className="h-4 w-1 rounded-full bg-white/90" />
            <div className="h-4 w-1 rounded-full bg-white/70" />
            <div className="h-4 w-1 rounded-full bg-white/50" />
          </div>
        </div>
        <div>
          <span className="block text-sm font-semibold tracking-tight text-white">
            MSNC PeopleHub
          </span>
          <span className="text-[10px] text-text-dim">HRMS Enterprise</span>
        </div>
      </div>

      <div className="shrink-0 border-b border-border px-2 py-2">
        <Link
          href="/feedback"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors",
            feedbackActive
              ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
              : "bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/25 hover:bg-amber-500/20"
          )}
        >
          <MessageSquarePlus className="h-4 w-4 shrink-0" />
          <span>Feedback</span>
          <span className="ml-auto rounded bg-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-100">
            UAT
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {navGroups.map((group) => {
          const open = isOpen(group.label);
          return (
            <div key={group.label} className="mb-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className={cn(
                  "mb-0.5 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-all duration-[900ms] ease-out",
                  open
                    ? "bg-surface-elevated/60 text-slate-100 scale-[1.02]"
                    : "text-slate-300 hover:bg-surface-elevated/40 hover:text-slate-100 scale-100"
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {group.label}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.34,1.4,0.64,1)]",
                    open ? "rotate-0" : "-rotate-90"
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <ul
                    className={cn(
                      "origin-top space-y-0.5 pb-1 transition-all duration-[900ms] ease-[cubic-bezier(0.34,1.2,0.64,1)]",
                      open
                        ? "translate-y-0 scale-100 opacity-100"
                        : "-translate-y-1 scale-[0.96] opacity-0"
                    )}
                  >
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors duration-200",
                              active
                                ? "bg-primary/15 font-medium text-primary"
                                : "text-text-muted hover:bg-surface-elevated hover:text-text"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}

        {isAdmin && (
          <div className="mb-1">
            <button
              type="button"
              onClick={() => toggleGroup("Admin")}
              className={cn(
                "mb-0.5 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-all duration-[900ms] ease-out",
                isOpen("Admin")
                  ? "bg-surface-elevated/60 text-slate-100 scale-[1.02]"
                  : "text-slate-300 hover:bg-surface-elevated/40 hover:text-slate-100 scale-100"
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider">Admin</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.34,1.4,0.64,1)]",
                  isOpen("Admin") ? "rotate-0" : "-rotate-90"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                isOpen("Admin") ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <ul
                  className={cn(
                    "origin-top space-y-0.5 pb-1 transition-all duration-[900ms] ease-[cubic-bezier(0.34,1.2,0.64,1)]",
                    isOpen("Admin")
                      ? "translate-y-0 scale-100 opacity-100"
                      : "-translate-y-1 scale-[0.96] opacity-0"
                  )}
                >
                  <li>
                    <Link
                      href="/users"
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors duration-200",
                        pathname === "/users"
                          ? "bg-primary/15 font-medium text-primary"
                          : "text-text-muted hover:bg-surface-elevated hover:text-text"
                      )}
                    >
                      <UserCog className="h-3.5 w-3.5 shrink-0" />
                      Manage Users
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="shrink-0 border-t border-border px-4 py-3">
        <p className="text-[10px] text-text-dim">46 modules · v1.0.0</p>
      </div>
    </aside>
  );
}
