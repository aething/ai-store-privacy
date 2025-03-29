export interface User {
  id: number;
  username: string;
  email: string;
  isVerified: boolean;
  name?: string;
  phone?: string;
  country?: string;
  street?: string;
  house?: string;
  apartment?: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number; // in cents
  imageUrl: string;
  category: string;
  features: string[];
  specifications: string[];
}

export interface Order {
  id: number;
  userId: number;
  productId: number;
  status: string;
  amount: number;
  stripePaymentId?: string;
  createdAt: Date;
}

export interface Policy {
  id: string;
  title: string;
  content: string;
}
