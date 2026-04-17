import { Admin, LoginInput, AuthResponse } from "../types/admin.ts";

const admins: Map<string, Admin> = new Map();

const DEFAULT_ADMIN_EMAIL = "admin@easecommerce.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

function generateToken(admin: Admin): string {
  const payload = { adminId: admin.id, email: admin.email };
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  return btoa(String.fromCharCode(...data));
}

export async function initializeDefaultAdmin(): Promise<void> {
  const existingAdmin = admins.get(DEFAULT_ADMIN_EMAIL);
  if (!existingAdmin) {
    const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
    const admin: Admin = {
      id: crypto.randomUUID(),
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      createdAt: new Date(),
    };
    admins.set(DEFAULT_ADMIN_EMAIL, admin);
  }
}

export async function login(input: LoginInput): Promise<AuthResponse | null> {
  const admin = admins.get(input.email);
  if (!admin) return null;

  const isValid = await verifyPassword(input.password, admin.passwordHash);
  if (!isValid) return null;

  const token = generateToken(admin);
  const { passwordHash: _passwordHash, ...adminWithoutPassword } = admin;

  return { token, admin: adminWithoutPassword };
}

export function verifyToken(token: string): Omit<Admin, "passwordHash"> | null {
  try {
    const jsonPayload = atob(token);
    const payload = JSON.parse(jsonPayload) as { adminId?: string };

    if (!payload.adminId) {
      return null;
    }

    return getAdminById(payload.adminId);
  } catch {
    return null;
  }
}

export function getAdminById(id: string): Omit<Admin, "passwordHash"> | null {
  for (const admin of admins.values()) {
    if (admin.id === id) {
      const { passwordHash: _passwordHash, ...adminWithoutPassword } = admin;
      return adminWithoutPassword;
    }
  }
  return null;
}
