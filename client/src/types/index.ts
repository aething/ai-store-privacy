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
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number; // in USD cents or USD depending on source (Stripe)
  priceEUR: number; // in EUR cents or EUR depending on source (Stripe)
  imageUrl: string;
  category: string;
  features: string[];
  specifications: string[];
  hardwareInfo?: string;
  softwareInfo?: string;
  stripeProductId?: string; // ID продукта в Stripe
  stripePriceId?: string; // ID цены в Stripe
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

/**
 * Локализованная информация о продукте
 */
export interface LocalizedProductInfo {
  title: string;
  description: string;
  hardwareInfo?: string;
  softwareInfo?: string;
  hardwareTabLabel?: string;
  softwareTabLabel?: string;
  hardwareSpecsLabel?: string;
  aiCapabilitiesLabel?: string;
  softwareArchitectureLabel?: string;
  learnMoreContent?: string;
  learnMoreTitle?: string;
}

/**
 * Тип для хранения переводов продуктов
 * Ключ - ID продукта
 */
export interface ProductTranslations {
  [productId: number]: LocalizedProductInfo;
}

/**
 * Тип для хранения общих UI переводов для продуктов
 */
export interface ProductUITranslations {
  hardwareTab: string;
  softwareTab: string;
  hardwareSpecsHeading: string;
  aiCapabilitiesHeading: string;
  softwareArchitectureHeading: string;
  noHardwareInfo: string;
  noSoftwareInfo: string;
  specificationLabel: string;
  imageDisclaimer: string;
  enterCouponCode: string;
  learnMore: string;
}
