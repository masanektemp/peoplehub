"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, MessageSquarePlus, UserCog, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { navGroups } from "@/lib/modules";
import { useAuth } from "@/contexts/AuthContext";

/** Pin buka mesti survive remount bila tukar page (setiap route ada AppShell sendiri) */
const PINNED_OPEN_KEY = "peoplehub-sidebar-pinned-open-v3";
/** Tunggu hover sekurang-kurangnya ni sebelum auto expand (kurang sensitif) */
const HOVER_EXPAND_MS = 1500;

function loadPinnedOpen(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(PINNED_OPEN_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function savePinnedOpen(groups: Set<string>) {
  try {
    sessionStorage.setItem(PINNED_OPEN_KEY, JSON.stringify([...groups]));
  } catch {
    /* ignore */
  }
}

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type SidebarGroup = {
  label: string;
  items: NavItem[];
};

/**
 * ONE rule for every group (Main, Finance, Additional, Admin, …):
 * - Hover → open; leave → auto tutup (kecuali pin buka ATAU group page semasa)
 * - Page semasa dalam group → group tu KEKAL buka (route soft-open) — semua kategori
 * - Klik semasa buka hover je → PIN BUKA
 * - Klik semasa pin buka / route open → manual tutup sementara
 * - Leave → clear manual tutup; route group auto buka semula
 */
export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const [hovered, setHovered] = useState<string | null>(null);
  const [pinnedOpen, setPinnedOpen] = useState<Set<string>>(() => loadPinnedOpen());
  /** Manual tutup — sementara; clear bila leave */
  const [pinnedClosed, setPinnedClosed] = useState<Set<string>>(() => new Set());
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverTimer = () => {
    if (hoverTimerRef.current != null) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  // Kekal pin buka lepas navigate Vehicle → Meeting Room dsb.
  useEffect(() => {
    savePinnedOpen(pinnedOpen);
  }, [pinnedOpen]);

  useEffect(() => () => clearHoverTimer(), []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const feedbackActive = isActive("/feedback");

  const allGroups: SidebarGroup[] = useMemo(() => {
    const groups: SidebarGroup[] = navGroups.map((g) => ({
      label: g.label,
      items: g.items.map((item) => ({
        href: item.href,
        label: item.label,
        icon: item.icon,
      })),
    }));
    if (isAdmin) {
      groups.push({
        label: "Admin",
        items: [{ href: "/users", label: "Manage Users", icon: UserCog }],
      });
    }
    return groups;
  }, [isAdmin]);

  /** Group yang ada page aktif — kekal buka (semua kategori sama) */
  const routeOpenLabels = useMemo(() => {
    const labels = new Set<string>();
    for (const group of allGroups) {
      if (group.items.some((item) => isActive(item.href))) {
        labels.add(group.label);
      }
    }
    return labels;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, allGroups]);

  const isOpen = (label: string) => {
    if (pinnedClosed.has(label)) return false;
    if (pinnedOpen.has(label)) return true;
    if (routeOpenLabels.has(label)) return true;
    return hovered === label;
  };

  const groupHasActive = (items: NavItem[]) =>
    items.some((item) => isActive(item.href));

  const toggleGroup = (label: string) => {
    const open = isOpen(label);
    const isRoute = routeOpenLabels.has(label);
    const isPinned = pinnedOpen.has(label);
    const isHoverOnly = hovered === label && !isPinned && !isRoute;

    if (!open) {
      setPinnedClosed((prev) => {
        const next = new Set(prev);
        next.delete(label);
        return next;
      });
      setPinnedOpen((prev) => new Set(prev).add(label));
      return;
    }

    // Buka sebab hover je → pin buka (kekal buka lepas leave)
    if (isHoverOnly) {
      setPinnedClosed((prev) => {
        const next = new Set(prev);
        next.delete(label);
        return next;
      });
      setPinnedOpen((prev) => new Set(prev).add(label));
      return;
    }

    // Pin buka atau route open → manual tutup sementara
    setPinnedOpen((prev) => {
      const next = new Set(prev);
      next.delete(label);
      return next;
    });
    setPinnedClosed((prev) => new Set(prev).add(label));
    setHovered((h) => (h === label ? null : h));
  };

  const onGroupEnter = (label: string) => {
    if (pinnedClosed.has(label)) return;
    // Dah buka (pin / route) — tak perlu timer expand
    if (pinnedOpen.has(label) || routeOpenLabels.has(label)) {
      clearHoverTimer();
      setHovered(label);
      return;
    }
    clearHoverTimer();
    hoverTimerRef.current = setTimeout(() => {
      hoverTimerRef.current = null;
      setHovered(label);
    }, HOVER_EXPAND_MS);
  };

  const onGroupLeave = (label: string) => {
    clearHoverTimer();
    setHovered((h) => (h === label ? null : h));
    setPinnedClosed((prev) => {
      if (!prev.has(label)) return prev;
      const next = new Set(prev);
      next.delete(label);
      return next;
    });
  };

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <div className="flex gap-0.5">
            <div className="h-4 w-1 rounded-full bg-white/90" />
            <div className="h-4 w-1 rounded-full bg-white/70" />
            <div className="h-4 w-1 rounded-full bg-white/50" />
          </div>
        </div>
        <div>
          <span className="block text-sm font-semibold tracking-tight text-text">
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

      <nav className="sidebar-nav flex-1 overflow-y-auto px-2 py-3 [scrollbar-gutter:stable]">
        {allGroups.map((group) => {
          const open = isOpen(group.label);
          const activeSection = groupHasActive(group.items);
          return (
            <SidebarGroupBlock
              key={group.label}
              label={group.label}
              open={open}
              activeSection={activeSection}
              onEnter={() => onGroupEnter(group.label)}
              onLeave={() => onGroupLeave(group.label)}
              onToggle={() => toggleGroup(group.label)}
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
            </SidebarGroupBlock>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border px-4 py-3">
        <p className="text-[10px] text-text-dim">46 modules · v1.0.0</p>
      </div>
    </aside>
  );
}

function SidebarGroupBlock({
  label,
  open,
  activeSection,
  onEnter,
  onLeave,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  activeSection: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="mb-1" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "mb-0.5 grid w-full grid-cols-[1fr_auto] items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors duration-[900ms] ease-out",
          open
            ? "bg-primary/20 text-text ring-1 ring-primary/40"
            : activeSection
              ? "bg-primary/10 text-text ring-1 ring-primary/25 hover:bg-primary/15"
              : "text-text-muted hover:bg-primary/15 hover:text-text hover:ring-1 hover:ring-primary/35"
        )}
      >
        <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 justify-self-end transition-transform duration-[900ms] ease-[cubic-bezier(0.34,1.4,0.64,1)]",
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
            {children}
          </ul>
        </div>
      </div>
    </div>
  );
}
