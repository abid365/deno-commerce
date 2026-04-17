import { Context } from "oak";
import { login } from "../services/authService.ts";
import { LoginInput } from "../types/admin.ts";

export async function loginController(ctx: Context): Promise<void> {
  const body = await ctx.request.body.json().catch(() => null);
  
  if (!body || !body.email || !body.password) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Email and password are required" };
    return;
  }

  const input: LoginInput = {
    email: body.email,
    password: body.password,
  };

  const result = await login(input);

  if (!result) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid email or password" };
    return;
  }

  ctx.response.status = 200;
  ctx.response.body = result;
}