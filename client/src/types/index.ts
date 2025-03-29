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
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number; // in USD cents
  priceEUR: number; // in EUR cents
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
  currency: string; // 'usd' or 'eur'
  stripePaymentId?: string;
  createdAt: Date;
}

export interface Policy {
  id: string;
  title: string;
  content: string;
}

export interface InfoPage {
  id: number;
  title: string;
  description: string;
  content: string; // Может содержать HTML-разметку для форматирования
}
