import { Context, Next } from "oak";
import { verifyToken } from "../services/authService.ts";

export async function requireAdminAuth(
  ctx: Context,
  next: Next,
): Promise<void> {
  const authHeader = ctx.request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Authorization token is required" };
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const admin = verifyToken(token);

  if (!admin) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid or expired token" };
    return;
  }

  await next();
}
