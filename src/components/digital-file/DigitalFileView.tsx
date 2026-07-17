"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, GripHorizontal, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatGrid } from "@/components/ui/StatGrid";
import { FeatureGrid } from "@/components/ui/FeatureGrid";
import { DataTable } from "@/components/ui/DataTable";
import {
  formatToday,
  loadDocuments,
  saveDocuments,
  type DigitalDocument,
} from "@/lib/digital-file/store";

const DOC_TYPES = [
  "IC",
  "Passport",
  "Certificate",
  "Offer Letter",
  "Confirmation",
  "Warning Letter",
  "Medical",
  "Contract",
  "Other",
];

const emptyForm = {
  employee: "",
  document: "Passport",
  version: "v1.0",
};

export function DigitalFileView() {
  const [docs, setDocs] = useState<DigitalDocument[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
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
    setDocs(loadDocuments());
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setForm(emptyForm);
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
    setForm(emptyForm);
    setError("");
    setOffset({ x: 0, y: 0 });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const employee = form.employee.trim();
    const document = form.document.trim();
    const version = form.version.trim() || "v1.0";
    if (!employee || !document) {
      setError("Employee name and document type are required.");
      return;
    }
    const next: DigitalDocument = {
      id: `doc-${Date.now()}`,
      employee,
      document,
      version,
      updated: formatToday(),
    };
    const list = [next, ...docs];
    setDocs(list);
    saveDocuments(list);
    setMessage("Document added.");
    closeForm();
    setTimeout(() => setMessage(""), 2500);
  };

  const stats = [
    { label: "Documents", value: String(docs.length), color: "blue" as const },
    { label: "Latest Version", value: "98%", color: "green" as const },
    { label: "Expired", value: 14, color: "red" as const },
    {
      label: "Uploads This Month",
      value: docs.filter((d) => d.updated === formatToday()).length || docs.length,
      color: "purple" as const,
    },
  ];

  const features = [
    "IC",
    "Passport",
    "Certificate",
    "Offer Letter",
    "Confirmation",
    "Warning Letter",
    "Medical",
    "Contract",
    "Document Versioning",
  ].map((name) => ({ name }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Employee File"
        description="Digital employee files with document versioning"
        action={
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Add New
          </button>
        }
      />

      {message && (
        <p className="rounded-lg bg-success/10 px-4 py-2 text-sm text-success">{message}</p>
      )}

      <StatGrid stats={stats} />
      <FeatureGrid features={features} title="Module Features" />
      <DataTable
        title="Recent Documents"
        columns={[
          { key: "employee", label: "Employees" },
          { key: "document", label: "Documents" },
          { key: "version", label: "Version" },
          { key: "updated", label: "Updated" },
        ]}
        data={docs as unknown as Record<string, unknown>[]}
      />

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
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-text">
                    <FileText className="h-5 w-5 text-primary" />
                    Add Document
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

              <form onSubmit={handleSubmit} className="space-y-3 p-6 pt-4">
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Employee name</label>
                  <input
                    value={form.employee}
                    onChange={(e) => setForm((f) => ({ ...f, employee: e.target.value }))}
                    placeholder="e.g. John Doe"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-text focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Document type</label>
                  <select
                    value={form.document}
                    onChange={(e) => setForm((f) => ({ ...f, document: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-text"
                  >
                    {DOC_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Version</label>
                  <input
                    value={form.version}
                    onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
                    placeholder="v1.0"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-text focus:border-primary focus:outline-none"
                  />
                </div>
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
