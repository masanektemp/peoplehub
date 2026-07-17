"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Eye,
  ImagePlus,
  Loader2,
  RefreshCw,
  Send,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { FeedbackItem, FeedbackStatus } from "@/lib/feedback/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "bug", label: "Bug / Error" },
  { value: "missing", label: "Missing feature" },
  { value: "ui", label: "UI / UX" },
  { value: "data", label: "Wrong data" },
  { value: "general", label: "General comment" },
];

function statusLabel(s: FeedbackStatus) {
  if (s === "done") return "Done";
  if (s === "reviewing") return "Reviewing";
  return "Open";
}

function statusClass(s: FeedbackStatus) {
  if (s === "done") return "bg-success/15 text-success";
  if (s === "reviewing") return "bg-warning/15 text-warning";
  return "bg-primary/15 text-primary";
}

export function FeedbackView() {
  const { session, isAdmin } = useAuth();
  const canInbox = isAdmin || session?.role === "hr";
  const [tab, setTab] = useState<"submit" | "inbox">("submit");

  const [category, setCategory] = useState("bug");
  const [moduleName, setModuleName] = useState("");
  const [comment, setComment] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [mime, setMime] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selected, setSelected] = useState<FeedbackItem | null>(null);
  const [listError, setListError] = useState("");

  const loadInbox = useCallback(async () => {
    setLoadingList(true);
    setListError("");
    try {
      const res = await fetch("/api/feedback", { cache: "no-store" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to load");
      setItems(data.items as FeedbackItem[]);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Failed to load inbox");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "inbox" && canInbox) loadInbox();
  }, [tab, canInbox, loadInbox]);

  const readFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please attach an image (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Screenshot max 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(String(reader.result || ""));
      setMime(file.type);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          readFile(file);
          return;
        }
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: session.username,
          userName: session.name,
          role: session.role,
          category,
          module: moduleName || "General",
          comment,
          screenshotBase64: preview,
          screenshotMime: mime,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Submit failed");
      setSuccess("Feedback sent. Thank you!");
      setComment("");
      setModuleName("");
      setCategory("bug");
      setPreview(null);
      setMime(null);
      if (canInbox) loadInbox();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSending(false);
    }
  };

  const setStatus = async (id: string, status: FeedbackStatus) => {
    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setItems((prev) => prev.map((i) => (i.id === id ? data.item : i)));
      if (selected?.id === id) setSelected(data.item);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="UAT Feedback"
        description="Send bugs, missing features, or comments with a screenshot. Admins can review live in the inbox."
      />

      <div className="flex gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setTab("submit")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            tab === "submit"
              ? "bg-primary text-white"
              : "bg-surface-elevated text-text-muted hover:text-text"
          )}
        >
          Send feedback
        </button>
        {canInbox && (
          <button
            type="button"
            onClick={() => setTab("inbox")}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === "inbox"
                ? "bg-primary text-white"
                : "bg-surface-elevated text-text-muted hover:text-text"
            )}
          >
            Inbox {items.length > 0 ? `(${items.length})` : ""}
          </button>
        )}
      </div>

      {tab === "submit" && (
        <form
          onSubmit={submit}
          onPaste={onPaste}
          className="mx-auto max-w-2xl space-y-4 rounded-xl border border-border bg-surface p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-text-muted">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-text outline-none focus:border-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-text-muted">Module / screen</span>
              <input
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="e.g. Leave, Payroll, Dashboard"
                className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-text outline-none focus:border-primary"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-text-muted">Comment</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              placeholder="What happened? What is missing? Paste a screenshot here (Ctrl+V) if needed."
              className="w-full resize-y rounded-lg border border-border bg-surface-elevated px-3 py-2 text-text outline-none focus:border-primary"
            />
          </label>

          <div
            role="button"
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileRef.current?.click();
              }
            }}
            onDragOver={onDragOver}
            onDragEnter={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
              "cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors",
              dragOver
                ? "border-primary bg-primary/15"
                : "border-border-light bg-surface-elevated/50 hover:border-primary/50 hover:bg-surface-elevated"
            )}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) readFile(f);
                e.target.value = "";
              }}
            />
            {!preview ? (
              <div className="flex flex-col items-center justify-center gap-2 py-4 text-center pointer-events-none">
                <ImagePlus
                  className={cn("h-10 w-10", dragOver ? "text-primary" : "text-text-dim")}
                />
                <p className="text-sm font-medium text-text">
                  {dragOver ? "Drop screenshot here" : "Drag & drop screenshot here"}
                </p>
                <p className="text-xs text-text-dim">
                  or click to browse · paste (Ctrl+V) · PNG / JPG / WebP · max 5 MB
                </p>
              </div>
            ) : (
              <div
                className="relative"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Screenshot preview"
                  className="mx-auto max-h-64 rounded-lg border border-border object-contain"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                    setMime(null);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-text-muted hover:text-danger"
                  aria-label="Remove screenshot"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="mt-2 text-center text-xs text-text-dim">
                  Drop another image to replace · or click X to remove
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}
          {success && (
            <p className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send feedback
          </button>
        </form>
      )}

      {tab === "inbox" && canInbox && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              Live feedback from testers · stored on this server
            </p>
            <button
              type="button"
              onClick={loadInbox}
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-elevated px-3 py-1.5 text-xs text-text-muted hover:text-text"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loadingList && "animate-spin")} />
              Refresh
            </button>
          </div>

          {listError && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{listError}</p>
          )}

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="space-y-2 lg:col-span-2">
              {loadingList && items.length === 0 && (
                <p className="text-sm text-text-dim">Loading…</p>
              )}
              {!loadingList && items.length === 0 && (
                <p className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-text-muted">
                  No feedback yet.
                </p>
              )}
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-colors",
                    selected?.id === item.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface hover:border-border-light"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-text">{item.userName}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                        statusClass(item.status)
                      )}
                    >
                      {statusLabel(item.status)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-text-muted">{item.comment}</p>
                  <p className="mt-1.5 text-[10px] text-text-dim">
                    {item.module} · {new Date(item.createdAt).toLocaleString()}
                    {item.screenshotFile ? " · 📷" : ""}
                  </p>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-surface p-4 lg:col-span-3">
              {!selected && (
                <div className="flex min-h-[240px] flex-col items-center justify-center text-text-dim">
                  <Eye className="mb-2 h-8 w-8 opacity-40" />
                  <p className="text-sm">Select a feedback item to view screenshot</p>
                </div>
              )}
              {selected && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-text">{selected.userName}</h3>
                    <p className="text-xs text-text-dim">
                      @{selected.username} · {selected.role} ·{" "}
                      {new Date(selected.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-surface-elevated px-2 py-1 text-text-muted">
                      {selected.category}
                    </span>
                    <span className="rounded-md bg-surface-elevated px-2 py-1 text-text-muted">
                      {selected.module}
                    </span>
                    <span className={cn("rounded-md px-2 py-1", statusClass(selected.status))}>
                      {statusLabel(selected.status)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-text">{selected.comment}</p>
                  {selected.screenshotFile ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/feedback/screenshot/${encodeURIComponent(selected.screenshotFile)}`}
                      alt="Feedback screenshot"
                      className="max-h-[480px] w-full rounded-lg border border-border object-contain bg-black/20"
                    />
                  ) : (
                    <p className="text-sm text-text-dim">No screenshot attached.</p>
                  )}
                  <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                    <span className="mr-2 self-center text-xs text-text-dim">Status:</span>
                    {(["open", "reviewing", "done"] as FeedbackStatus[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(selected.id, s)}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium",
                          selected.status === s
                            ? "bg-primary text-white"
                            : "bg-surface-elevated text-text-muted hover:text-text"
                        )}
                      >
                        {statusLabel(s)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
