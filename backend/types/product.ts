export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  totalSold: number;
  size: string;
  colors: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  price: number;
  quantity: number;
  size: string;
  colors: string[];
  description: string;
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  quantity?: number;
  size?: string;
  colors?: string[];
  description?: string;
}