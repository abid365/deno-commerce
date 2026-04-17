export interface Admin {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  admin: Admin;
}

export interface LoginPayload {
  email: string;
  password: string;
}
