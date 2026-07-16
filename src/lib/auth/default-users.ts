import type { User } from "./types";

/** Mock users — password plain text untuk debug mudah (production: hash) */
export const DEFAULT_USERS: User[] = [
  {
    id: "usr-001",
    username: "admin",
    password: "admin123",
    name: "System Admin",
    email: "admin@msnc.com",
    role: "admin",
    active: true,
  },
  {
    id: "usr-002",
    username: "hr",
    password: "hr123",
    name: "KP KUP Shah",
    email: "hr@msnc.com",
    role: "hr",
    active: true,
  },
  {
    id: "usr-003",
    username: "staff",
    password: "staff123",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "staff",
    active: true,
  },
];

export const DEMO_CREDENTIALS = DEFAULT_USERS.map((u) => ({
  role: u.role,
  username: u.username,
  password: u.password,
}));