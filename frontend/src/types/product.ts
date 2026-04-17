export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  totalSold: number;
  size: string;
  colors: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPayload {
  name: string;
  price: number;
  quantity: number;
  size: string;
  colors: string[];
  description: string;
}
