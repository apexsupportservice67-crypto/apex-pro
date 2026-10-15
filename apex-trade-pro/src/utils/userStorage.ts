import { RegisteredUser } from "../types";

export const REGISTERED_USERS_STORAGE_KEY = "apex_registered_users";

export function loadStoredRegisteredUsers(): Record<string, RegisteredUser> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load registered users from localStorage:", e);
    return {};
  }
}

export function saveStoredRegisteredUsers(users: Record<string, RegisteredUser>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REGISTERED_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save registered users to localStorage:", e);
  }
}
