import type { Product, ProductPayload } from "../types/product";
import { request } from "./api";

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export function getProducts(token: string): Promise<Product[]> {
  return request<Product[]>("/products", {
    headers: authHeader(token),
  });
}

export function createProduct(
  token: string,
  payload: ProductPayload,
): Promise<Product> {
  return request<Product>("/products", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export function updateProduct(
  token: string,
  productId: string,
  payload: ProductPayload,
): Promise<Product> {
  return request<Product>(`/products/${productId}`, {
    method: "PUT",
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(
  token: string,
  productId: string,
): Promise<{ message: string }> {
  return request<{ message: string }>(`/products/${productId}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}
