import { DEFAULT_USERS } from "./default-users";
import type { Session, User, UserInput, UserRole } from "./types";

const USERS_KEY = "peoplehub-users";
const SESSION_KEY = "peoplehub-session";

function isBrowser() {
  return typeof window !== "undefined";
}

/** Add any DEFAULT_USERS missing from stored list (e.g. pilot terminal01–20) */
function mergeSeedUsers(stored: User[]): User[] {
  const byUsername = new Map(stored.map((u) => [u.username.toLowerCase(), u]));
  let changed = false;
  for (const seed of DEFAULT_USERS) {
    const key = seed.username.toLowerCase();
    if (!byUsername.has(key)) {
      byUsername.set(key, seed);
      changed = true;
    }
  }
  if (!changed) return stored;
  return Array.from(byUsername.values());
}

function readUsers(): User[] {
  if (!isBrowser()) return DEFAULT_USERS;
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    const parsed = JSON.parse(raw) as User[];
    const merged = mergeSeedUsers(parsed);
    if (merged.length !== parsed.length) {
      localStorage.setItem(USERS_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    return DEFAULT_USERS;
  }
}

function writeUsers(users: User[]) {
  if (!isBrowser()) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getUsers(): User[] {
  return readUsers();
}

export function resetUsers(): User[] {
  writeUsers(DEFAULT_USERS);
  return DEFAULT_USERS;
}

export function getSession(): Session | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as Session;
    const user = readUsers().find((u) => u.id === session.userId && u.active);
    if (!user) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function setSession(session: Session) {
  if (!isBrowser()) return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (!isBrowser()) return;
  localStorage.removeItem(SESSION_KEY);
}

export function login(username: string, password: string): { ok: true; session: Session } | { ok: false; error: string } {
  const user = readUsers().find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.active
  );

  if (!user) return { ok: false, error: "Username not found or account is inactive." };
  if (user.password !== password) return { ok: false, error: "Incorrect password." };

  const session: Session = {
    userId: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  setSession(session);
  return { ok: true, session };
}

export function logout() {
  clearSession();
}

export function createUser(input: UserInput): { ok: true; user: User } | { ok: false; error: string } {
  const users = readUsers();
  if (users.some((u) => u.username.toLowerCase() === input.username.trim().toLowerCase())) {
    return { ok: false, error: "Username already exists." };
  }
  if (users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
    return { ok: false, error: "Email already exists." };
  }

  const user: User = {
    id: `usr-${Date.now()}`,
    username: input.username.trim(),
    password: input.password,
    name: input.name.trim(),
    email: input.email.trim(),
    role: input.role,
    active: input.active,
  };
  writeUsers([...users, user]);
  return { ok: true, user };
}

export function updateUser(id: string, input: Partial<UserInput>): { ok: true; user: User } | { ok: false; error: string } {
  const users = readUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return { ok: false, error: "User not found." };

  const current = users[index];
  const username = input.username?.trim() ?? current.username;
  const email = input.email?.trim() ?? current.email;

  if (users.some((u) => u.id !== id && u.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, error: "Username already in use." };
  }
  if (users.some((u) => u.id !== id && u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: "Email already in use." };
  }

  const updated: User = {
    ...current,
    ...input,
    username,
    email,
    name: input.name?.trim() ?? current.name,
    password: input.password?.trim() ? input.password : current.password,
  };

  users[index] = updated;
  writeUsers(users);

  const session = getSession();
  if (session?.userId === id) {
    setSession({
      userId: updated.id,
      username: updated.username,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    });
  }

  return { ok: true, user: updated };
}

export function deleteUser(id: string, currentUserId: string): { ok: true } | { ok: false; error: string } {
  if (id === currentUserId) return { ok: false, error: "Cannot delete your own account while logged in." };
  const users = readUsers();
  if (users.length <= 1) return { ok: false, error: "At least one user is required." };
  writeUsers(users.filter((u) => u.id !== id));
  return { ok: true };
}

export function roleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: "Admin",
    hr: "HR Manager",
    staff: "Staff",
  };
  return labels[role];
}