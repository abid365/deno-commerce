import { request } from "./api";
import type { Admin, AuthResponse, LoginPayload } from "../types/admin";

const TOKEN_KEY = "ease_admin_token";
const ADMIN_KEY = "ease_admin_profile";

export async function loginAdmin(payload: LoginPayload): Promise<AuthResponse> {
  const authResponse = await request<AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  localStorage.setItem(TOKEN_KEY, authResponse.token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(authResponse.admin));

  return authResponse;
}

export function logoutAdmin(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentAdmin(): Admin | null {
  const raw = localStorage.getItem(ADMIN_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Admin;
  } catch {
    logoutAdmin();
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}
