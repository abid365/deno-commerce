import { Context } from "oak";
import { 
  createProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct 
} from "../services/productService.ts";
import { CreateProductInput, UpdateProductInput } from "../types/product.ts";

export async function getProductsController(ctx: Context): Promise<void> {
  const products = getAllProducts();
  ctx.response.status = 200;
  ctx.response.body = products;
}

export async function getProductController(ctx: Context): Promise<void> {
  const id = ctx.params.id;
  
  if (!id) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Product ID is required" };
    return;
  }

  const product = getProductById(id);

  if (!product) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Product not found" };
    return;
  }

  ctx.response.status = 200;
  ctx.response.body = product;
}

export async function createProductController(ctx: Context): Promise<void> {
  const body = await ctx.request.body.json().catch(() => null);

  if (!body || !body.name || !body.price || !body.quantity) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Name, price, and quantity are required" };
    return;
  }

  const input: CreateProductInput = {
    name: body.name,
    price: Number(body.price),
    quantity: Number(body.quantity),
    size: body.size || "",
    colors: body.colors || [],
    description: body.description || "",
  };

  const product = createProduct(input);
  ctx.response.status = 201;
  ctx.response.body = product;
}

export async function updateProductController(ctx: Context): Promise<void> {
  const id = ctx.params.id;

  if (!id) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Product ID is required" };
    return;
  }

  const body = await ctx.request.body.json().catch(() => null);

  if (!body) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Request body is required" };
    return;
  }

  const input: UpdateProductInput = {
    name: body.name,
    price: body.price ? Number(body.price) : undefined,
    quantity: body.quantity ? Number(body.quantity) : undefined,
    size: body.size,
    colors: body.colors,
    description: body.description,
  };

  const product = updateProduct(id, input);

  if (!product) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Product not found" };
    return;
  }

  ctx.response.status = 200;
  ctx.response.body = product;
}

export async function deleteProductController(ctx: Context): Promise<void> {
  const id = ctx.params.id;

  if (!id) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Product ID is required" };
    return;
  }

  const deleted = deleteProduct(id);

  if (!deleted) {
    ctx.response.status = 404;
    ctx.response.body = { error: "Product not found" };
    return;
  }

  ctx.response.status = 200;
  ctx.response.body = { message: "Product deleted successfully" };
}