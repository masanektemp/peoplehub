"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  createUser,
  deleteUser,
  getSession,
  getUsers,
  login as authLogin,
  logout as authLogout,
  resetUsers,
  updateUser,
} from "@/lib/auth/auth-store";
import type { Session, User, UserInput } from "@/lib/auth/types";

interface AuthContextValue {
  session: Session | null;
  users: User[];
  loading: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refreshUsers: () => void;
  addUser: (input: UserInput) => { ok: boolean; error?: string };
  editUser: (id: string, input: Partial<UserInput>) => { ok: boolean; error?: string };
  removeUser: (id: string) => { ok: boolean; error?: string };
  resetMockUsers: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSessionState] = useState<Session | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUsers = useCallback(() => {
    setUsers(getUsers());
  }, []);

  useEffect(() => {
    setSessionState(getSession());
    refreshUsers();
    setLoading(false);
  }, [refreshUsers]);

  const login = useCallback(
    async (username: string, password: string) => {
      const result = authLogin(username, password);
      if (!result.ok) return { ok: false, error: result.error };
      setSessionState(result.session);
      router.push("/");
      router.refresh();
      return { ok: true };
    },
    [router]
  );

  const logout = useCallback(() => {
    authLogout();
    setSessionState(null);
    router.push("/login");
    router.refresh();
  }, [router]);

  const addUser = useCallback(
    (input: UserInput) => {
      const result = createUser(input);
      if (!result.ok) return { ok: false, error: result.error };
      refreshUsers();
      return { ok: true };
    },
    [refreshUsers]
  );

  const editUser = useCallback(
    (id: string, input: Partial<UserInput>) => {
      const result = updateUser(id, input);
      if (!result.ok) return { ok: false, error: result.error };
      refreshUsers();
      if (session?.userId === id) setSessionState(getSession());
      return { ok: true };
    },
    [refreshUsers, session?.userId]
  );

  const removeUser = useCallback(
    (id: string) => {
      if (!session) return { ok: false, error: "Session expired." };
      const result = deleteUser(id, session.userId);
      if (!result.ok) return { ok: false, error: result.error };
      refreshUsers();
      return { ok: true };
    },
    [refreshUsers, session]
  );

  const resetMockUsers = useCallback(() => {
    resetUsers();
    refreshUsers();
  }, [refreshUsers]);

  const value = useMemo(
    () => ({
      session,
      users,
      loading,
      login,
      logout,
      refreshUsers,
      addUser,
      editUser,
      removeUser,
      resetMockUsers,
      isAdmin: session?.role === "admin",
    }),
    [session, users, loading, login, logout, refreshUsers, addUser, editUser, removeUser, resetMockUsers]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}