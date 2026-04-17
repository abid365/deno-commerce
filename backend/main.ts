import { Application, Context, Next } from "oak";
import { createAuthRouter } from "./routes/auth.ts";
import { createProductRouter } from "./routes/product.ts";
import { initializeDefaultAdmin } from "./services/authService.ts";

const app = new Application();
const authRouter = createAuthRouter();
const productRouter = createProductRouter();

app.use(async (ctx: Context, next: Next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  ctx.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
    return;
  }
  await next();
});

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

app.use(productRouter.routes());
app.use(productRouter.allowedMethods());

await initializeDefaultAdmin();

const PORT = 3000;
console.log(`Server running on http://localhost:${PORT}`);

await app.listen({ port: PORT });
