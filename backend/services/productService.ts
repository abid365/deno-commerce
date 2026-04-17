import { Product, CreateProductInput, UpdateProductInput } from "../types/product.ts";

const products: Map<string, Product> = new Map();

export function createProduct(input: CreateProductInput): Product {
  const now = new Date();
  const product: Product = {
    id: crypto.randomUUID(),
    ...input,
    totalSold: 0,
    createdAt: now,
    updatedAt: now,
  };
  products.set(product.id, product);
  return product;
}

export function getAllProducts(): Product[] {
  return Array.from(products.values());
}

export function getProductById(id: string): Product | null {
  return products.get(id) || null;
}

export function updateProduct(id: string, input: UpdateProductInput): Product | null {
  const product = products.get(id);
  if (!product) return null;

  const updatedProduct: Product = {
    ...product,
    ...input,
    updatedAt: new Date(),
  };
  products.set(id, updatedProduct);
  return updatedProduct;
}

export function deleteProduct(id: string): boolean {
  return products.delete(id);
}