import { Router } from "oak";
import {
  getProductsController,
  getProductController,
  createProductController,
  updateProductController,
  deleteProductController,
} from "../controllers/productController.ts";

export function createProductRouter(): Router {
  const router = new Router();

  router.get("/", getProductsController);
  router.get("/:id", getProductController);
  router.post("/", createProductController);
  router.put("/:id", updateProductController);
  router.delete("/:id", deleteProductController);

  return router;
}