export type UserRole = "admin" | "hr" | "staff";

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface Session {
  userId: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
}

export type UserInput = Omit<User, "id"> & { id?: string };