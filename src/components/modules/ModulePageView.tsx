"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GripHorizontal, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatGrid } from "@/components/ui/StatGrid";
import { FeatureGrid } from "@/components/ui/FeatureGrid";
import { DataTable } from "@/components/ui/DataTable";
import { AIAnalyticsSection } from "@/components/ai/AIAnalyticsSection";
import { loadModuleRows, saveModuleRows } from "@/lib/modules/module-rows-store";
import type { ModulePageData } from "@/lib/modules";

interface ModulePageViewProps {
  module: ModulePageData;
}

export function ModulePageView({ module }: ModulePageViewProps) {
  const showAnalytics = module.slug === "ai-analytics" || module.slug === "ai-copilot";
  const columns = module.tableColumns ?? [];
  const seed = useMemo(
    () => (module.tableData ?? []).map((r) => ({ ...r })),
    [module.tableData]
  );

  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    setRows(loadModuleRows(module.slug, seed));
  }, [module.slug, seed]);

  const actionLabel = module.primaryAction || "Add New";
  const isAddNew =
    !module.primaryAction ||
    module.primaryAction === "Add New" ||
    module.primaryAction.toLowerCase().startsWith("add");

  const closeForm = useCallback(() => {
    setShowForm(false);
    setForm({});
    setError("");
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!showForm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeForm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showForm, closeForm]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      setOffset({
        x: dragRef.current.originX + (e.clientX - dragRef.current.startX),
        y: dragRef.current.originY + (e.clientY - dragRef.current.startY),
      });
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const openAdd = () => {
    const empty: Record<string, string> = {};
    for (const col of columns) empty[col.key] = "";
    setForm(empty);
    setError("");
    setOffset({ x: 0, y: 0 });
    setShowForm(true);
  };

  const handlePrimaryClick = () => {
    if (module.primaryAction === "View Heatmap") {
      setMessage("Heatmap view opened (demo).");
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    if (module.primaryAction === "Approve All") {
      setMessage("All pending items approved (demo).");
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    if (module.primaryAction === "Open AI Copilot") {
      setMessage("Use the AI Copilot button in the header for the full panel.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    openAdd();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (columns.length === 0) {
      setMessage(`${actionLabel} completed (demo).`);
      closeForm();
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    const required = columns[0]?.key;
    if (required && !String(form[required] || "").trim()) {
      setError(`${columns[0].label} is required.`);
      return;
    }
    const row: Record<string, string> = {};
    for (const col of columns) {
      row[col.key] = String(form[col.key] ?? "").trim() || "—";
    }
    const next = [row, ...rows];
    setRows(next);
    saveModuleRows(module.slug, next);
    setMessage("Record added.");
    closeForm();
    setTimeout(() => setMessage(""), 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={module.title}
        description={module.description}
        action={
          <button
            type="button"
            onClick={handlePrimaryClick}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            {actionLabel}
          </button>
        }
      />

      {message && (
        <p className="rounded-lg bg-success/10 px-4 py-2 text-sm text-success">{message}</p>
      )}

      <StatGrid stats={module.stats} />

      <FeatureGrid features={module.features} title="Module Features" />

      {columns.length > 0 && (
        <DataTable
          title={module.tableTitle || "Records"}
          columns={columns}
          data={rows}
        />
      )}

      {showAnalytics && <AIAnalyticsSection />}

      {showForm && (
        <div
          className="modal-backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeForm}
          role="presentation"
        >
          <div
            style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="modal-pop-in w-full rounded-2xl border border-border bg-surface shadow-2xl"
            >
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  dragRef.current = {
                    startX: e.clientX,
                    startY: e.clientY,
                    originX: offset.x,
                    originY: offset.y,
                  };
                }}
                className="flex cursor-grab items-center justify-between border-b border-border px-4 py-3 active:cursor-grabbing"
              >
                <div className="flex items-center gap-2">
                  <GripHorizontal className="h-4 w-4 text-text-dim" />
                  <h2 className="text-lg font-semibold text-text">
                    {isAddNew ? `Add — ${module.title}` : actionLabel}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-surface-elevated hover:text-text"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-3 overflow-y-auto p-6 pt-4">
                {columns.length === 0 ? (
                  <p className="text-sm text-text-muted">
                    Confirm to run <strong>{actionLabel}</strong> for this module (demo).
                  </p>
                ) : (
                  columns.map((col) => (
                    <div key={col.key}>
                      <label className="mb-1 block text-xs text-text-muted">{col.label}</label>
                      <input
                        value={form[col.key] ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [col.key]: e.target.value }))
                        }
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-text focus:border-primary focus:outline-none"
                        placeholder={col.label}
                      />
                    </div>
                  ))
                )}
                {error && <p className="text-sm text-danger">{error}</p>}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex-1 rounded-lg border border-border py-2 text-sm text-text-muted hover:text-text"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary-hover"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
