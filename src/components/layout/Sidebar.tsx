"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { navGroups } from "@/lib/modules";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
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

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-text-dim">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
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
        ))}

        {isAdmin && (
          <div className="mb-3">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-text-dim">
              Admin
            </p>
            <ul>
              <li>
                <Link
                  href="/users"
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
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
        )}
      </nav>

      <div className="shrink-0 border-t border-border px-4 py-3">
        <p className="text-[10px] text-text-dim">46 modules · v1.0.0</p>
      </div>
    </aside>
  );
}