import { Router } from "oak";
import {
  getProductsController,
  getProductController,
  createProductController,
  updateProductController,
  deleteProductController,
} from "../controllers/productController.ts";
import { requireAdminAuth } from "../middleware/auth.ts";

export function createProductRouter(): Router {
  const router = new Router({ prefix: "/products" });

  router.use(requireAdminAuth);

  router.get("/", getProductsController);
  router.get("/:id", getProductController);
  router.post("/", createProductController);
  router.put("/:id", updateProductController);
  router.delete("/:id", deleteProductController);

  return router;
}
