"use client";

import { Cake, Calendar } from "lucide-react";
import { StatCard } from "./StatCard";
import { AttendanceChart } from "./AttendanceChart";
import { MiniCalendar } from "./MiniCalendar";
import { AIAnalyticsSection } from "@/components/ai/AIAnalyticsSection";

const contractExpiry = [
  { name: "Nurul Izzati", date: "15 Aug 2026", avatar: "NI" },
  { name: "Faizal Rahman", date: "22 Aug 2026", avatar: "FR" },
  { name: "Ahmad Zaki", date: "30 Aug 2026", avatar: "AZ" },
];

const pendingClaims = [
  { name: "KP KUP Shah", type: "Medical Claim", amount: "RM 250" },
  { name: "KP KUP Shah", type: "Mileage", amount: "RM 85" },
  { name: "KP KUP Shah", type: "Training", amount: "RM 1,200" },
];

export function DashboardView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Dashboard</h1>
        <p className="text-sm text-text-muted">HR summary for today — 17 July 2026</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
        <StatCard label="Attendance Today" value="187/212" className="col-span-2">
          <AttendanceChart />
        </StatCard>
        <StatCard label="Staff MC" value={8} dotColor="red" />
        <StatCard label="Staff on Leave" value={14} dotColor="green" />
        <StatCard label="Late Staff" value={12} dotColor="yellow" />
        <StatCard label="Staff OT" value={23} dotColor="yellow" />
        <StatCard label="Not Clocked In" value={23} dotColor="blue" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Contract Expiry" value={5} dotColor="red" />
        <StatCard label="License/Passport Expiry" value={3} dotColor="red" />
        <StatCard label="Probation Ending" value={2} dotColor="yellow" />
        <StatCard label="Claim Pending" value={12} dotColor="yellow" />
        <StatCard label="Leave Pending" value={5} dotColor="yellow" />
        <StatCard label="Payroll Pending" value={1} dotColor="blue" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs text-text-muted">Organization KPI</p>
          <p className="mt-1 text-4xl font-bold text-text">87%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-elevated">
            <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-success to-success/70" />
          </div>
        </div>

        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-primary/80">Today&apos;s Birthday</p>
              <p className="mt-1 text-lg font-semibold text-text">Muhammad Haziq</p>
              <p className="text-xs text-text-muted">Engineering Dept.</p>
            </div>
            <Cake className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">Contract Expiry</p>
            <Calendar className="h-4 w-4 text-text-dim" />
          </div>
          <p className="mt-1 text-lg font-semibold text-text">5 / 29 July</p>
          <MiniCalendar />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-text">Expiring Contracts</h2>
          <ul className="space-y-3">
            {contractExpiry.map((item) => (
              <li key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-xs font-medium text-primary">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{item.name}</p>
                    <p className="text-xs text-text-dim">{item.date}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-primary hover:text-primary"
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-text">Claim Approval</h2>
          <ul className="space-y-3">
            {pendingClaims.map((item, i) => (
              <li key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-medium text-white">
                    KS
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{item.name}</p>
                    <p className="text-xs text-text-dim">
                      {item.type} · {item.amount}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-success/15 px-3 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success/25"
                >
                  Approve
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AIAnalyticsSection />
    </div>
  );
}