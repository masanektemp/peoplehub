"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GripHorizontal, Pencil, Plus, RotateCcw, Trash2, UserCog, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { roleLabel } from "@/lib/auth/auth-store";
import type { User, UserRole } from "@/lib/auth/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/utils";

const ROLES: UserRole[] = ["admin", "hr", "staff"];

const emptyForm = {
  username: "",
  password: "",
  name: "",
  email: "",
  role: "staff" as UserRole,
  active: true,
};

export function UserManagementView() {
  const { users, addUser, editUser, removeUser, resetMockUsers, session, isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /** Panel offset from centered position (drag) */
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
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
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setOffset({
        x: dragRef.current.originX + dx,
        y: dragRef.current.originY + dy,
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

  if (!isAdmin) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <UserCog className="mb-3 h-10 w-10 text-danger" />
        <h1 className="text-lg font-semibold text-text">Access Denied</h1>
        <p className="mt-1 text-sm text-text-muted">Only Admins can manage users.</p>
      </div>
    );
  }

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setOffset({ x: 0, y: 0 });
    setShowForm(true);
  };

  const openEdit = (user: User) => {
    setEditingId(user.id);
    setForm({
      username: user.username,
      password: "",
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    });
    setError("");
    setOffset({ x: 0, y: 0 });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.name || !form.email) {
      setError("Username, name and email are required.");
      return;
    }
    if (!editingId && !form.password) {
      setError("Password is required for new users.");
      return;
    }

    const result = editingId ? editUser(editingId, form) : addUser(form);

    if (!result.ok) {
      setError(result.error ?? "Operation failed.");
      return;
    }

    setMessage(editingId ? "User updated." : "New user added.");
    closeForm();
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDelete = (user: User) => {
    if (!confirm(`Delete user "${user.name}"?`)) return;
    const result = removeUser(user.id);
    if (!result.ok) setError(result.error ?? "Failed to delete.");
    else setMessage("User deleted.");
  };

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Mock user management — add, edit, activate/deactivate. Data stored in localStorage."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (confirm("Reset all users to default demo accounts?")) {
                  resetMockUsers();
                  setMessage("Users reset to defaults.");
                }
              }}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-text"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Demo
            </button>
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </div>
        }
      />

      {message && (
        <p className="rounded-lg bg-success/10 px-4 py-2 text-sm text-success">{message}</p>
      )}
      {error && !showForm && (
        <p className="rounded-lg bg-danger/10 px-4 py-2 text-sm text-danger">{error}</p>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-elevated">
              {["Name", "Username", "Email", "Role", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-dim">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border/50 hover:bg-surface-elevated/40">
                <td className="px-4 py-3 font-medium text-text">
                  {user.name}
                  {user.id === session?.userId && (
                    <span className="ml-2 text-[10px] text-primary">(you)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-muted">{user.username}</td>
                <td className="px-4 py-3 text-text-muted">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                    {roleLabel(user.role)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      user.active ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                    )}
                  >
                    {user.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(user)}
                      className="rounded-lg p-2 text-text-muted hover:bg-surface-elevated hover:text-primary"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(user)}
                      disabled={user.id === session?.userId}
                      className="rounded-lg p-2 text-text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-30"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div
          className="modal-backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeForm}
          role="presentation"
        >
          {/* Outer: drag position only — does not fight pop animation */}
          <div
            style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="user-form-title"
              className="modal-pop-in w-full rounded-2xl border border-border bg-surface shadow-2xl"
            >
            {/* Drag handle */}
            <div
              onMouseDown={startDrag}
              className="flex cursor-grab items-center justify-between border-b border-border px-4 py-3 active:cursor-grabbing"
            >
              <div className="flex items-center gap-2">
                <GripHorizontal className="h-4 w-4 text-text-dim" />
                <h2 id="user-form-title" className="text-lg font-semibold text-text">
                  {editingId ? "Edit User" : "Add User"}
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
              {[
                { key: "name", label: "Full Name", type: "text" },
                { key: "username", label: "Username", type: "text" },
                { key: "email", label: "Email", type: "email" },
                {
                  key: "password",
                  label: editingId ? "Password (leave blank to keep)" : "Password",
                  type: "text",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-xs text-text-muted">{field.label}</label>
                  <input
                    type={field.type}
                    value={form[field.key as keyof typeof form] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-text focus:border-primary focus:outline-none"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs text-text-muted">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-text"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {roleLabel(r)}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-text-muted">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="rounded border-border"
                />
                Active account
              </label>
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
