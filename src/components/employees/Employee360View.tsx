"use client";

import { useState } from "react";
import {
  Award,
  ChevronDown,
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = ["Personal Info", "Job Details", "Timeline", "Documents"] as const;

const timeline = [
  {
    year: "2022",
    title: "Promoted to Senior Engineer",
    subtitle: "Promotion based on excellent performance",
    badge: "OT7",
    badgeColor: "bg-primary/20 text-primary",
    highlight: true,
  },
  {
    year: "2021",
    title: "Performance Warning",
    subtitle: "Written warning — project delivery delays",
    badge: "OTP",
    badgeColor: "bg-warning/20 text-warning",
    highlight: false,
  },
  {
    year: "2020",
    title: "Completed Training Program",
    subtitle: "Leadership & Technical Certification",
    badge: "GTP",
    badgeColor: "bg-success/20 text-success",
    highlight: false,
  },
];

const documents = [
  { name: "Identity Card", version: "v2.0", icon: "🪪" },
  { name: "Passport", version: "v2.9", icon: "📘" },
  { name: "Offer Letter", version: "v1.9", icon: "📄" },
  { name: "Medical Records", version: "v4.5", icon: "🏥" },
  { name: "Background Check", version: "v2.0", icon: "✅" },
];

export function Employee360View() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Personal Info");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-6 lg:flex-row lg:items-start">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/30 text-3xl font-bold text-primary">
          JD
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text">John Doe</h1>
              <p className="text-sm text-text-muted">EMP001 · Senior Software Engineer</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["AR", "SA", "MH"].map((initials) => (
                  <div
                    key={initials}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-elevated text-[10px] font-medium text-primary"
                  >
                    {initials}
                  </div>
                ))}
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-warning/20 text-[10px] font-medium text-warning">
                  +3
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-3 py-1.5">
                <Award className="h-4 w-4 text-warning" />
                <span className="text-sm font-semibold text-text">KPI 92</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Position", value: "Senior Software Engineer" },
              { label: "Start Date", value: "15 Jan 2020" },
              { label: "Department", value: "Engineering" },
              { label: "Status", value: "Active" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-surface-elevated px-3 py-2">
                <p className="text-[10px] text-text-dim">{item.label}</p>
                <p className="text-sm font-medium text-text">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-3 text-sm font-semibold text-text">Personal Information</h2>
            <ul className="space-y-3">
              {[
                { icon: User, label: "Employee ID", value: "EMP001" },
                { icon: Mail, label: "Email", value: "john.doe@company.com" },
                { icon: Phone, label: "Phone", value: "+60 12-345 6789" },
                { icon: MapPin, label: "Location", value: "Kuala Lumpur" },
                { icon: Shield, label: "Position", value: "Senior Software Engineer" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-center gap-3 text-sm">
                    <Icon className="h-4 w-4 shrink-0 text-text-dim" />
                    <div>
                      <p className="text-[10px] text-text-dim">{item.label}</p>
                      <p className="text-text-muted">{item.value}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="flex gap-1 border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2.5 text-sm transition-colors",
                  activeTab === tab
                    ? "border-b-2 border-primary font-medium text-primary"
                    : "text-text-muted hover:text-text"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Personal Info" && (
            <div className="space-y-3">
              {timeline.map((event) => (
                <div
                  key={event.year + event.title}
                  className={cn(
                    "rounded-xl border p-4",
                    event.highlight
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-surface"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">
                          {event.title} — {event.year}
                        </p>
                        <p className="mt-0.5 text-xs text-text-dim">{event.subtitle}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded px-2 py-0.5 text-[10px] font-medium",
                        event.badgeColor
                      )}
                    >
                      {event.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Job Details" && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Grade", "E7"],
                  ["Reports To", "Ahmad Rizal"],
                  ["Employment Type", "Full Time"],
                  ["Work Location", "HQ Kuala Lumpur"],
                  ["Basic Salary", "RM 12,500"],
                  ["EPF", "11%"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-text-dim">{label}</p>
                    <p className="text-sm font-medium text-text">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Timeline" && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-sm text-text-muted">
                Full timeline covering promotions, transfers, warnings, training and performance — per HRMS Enterprise module 2.
              </p>
            </div>
          )}

          {activeTab === "Documents" && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-sm text-text-muted">
                All documents are available in the Digital Employee File panel below.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-text">Digital Employee File</h2>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-text-muted hover:text-text"
          >
            All documents
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {documents.map((doc) => (
            <div
              key={doc.name}
              className="group cursor-pointer rounded-xl border border-border bg-surface-elevated p-4 transition-colors hover:border-primary/50"
            >
              <div className="mb-3 flex h-16 items-center justify-center rounded-lg bg-background text-2xl">
                {doc.icon}
              </div>
              <p className="text-xs font-medium text-text">{doc.name}</p>
              <p className="text-[10px] text-text-dim">{doc.version}</p>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full w-full rounded-full bg-primary/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}