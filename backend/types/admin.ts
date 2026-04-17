export interface Admin {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  admin: Omit<Admin, "passwordHash">;
}