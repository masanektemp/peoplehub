import type { User, UserRole } from "./types";
import authDefaults from "../../../config-projek/auth-defaults.json";

/** Mock users — loaded from config-projek/auth-defaults.json (Phase 1) */
export const DEFAULT_USERS: User[] = authDefaults.users as User[];

export const DEMO_CREDENTIALS = authDefaults.demoCredentials as {
  role: UserRole;
  username: string;
  password: string;
}[];