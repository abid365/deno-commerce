import { Router } from "oak";
import { loginController } from "../controllers/authController.ts";

export function createAuthRouter(): Router {
  const router = new Router();

  router.post("/login", loginController);

  return router;
}