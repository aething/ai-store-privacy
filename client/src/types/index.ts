import { productUITranslations, en } from '@/locales/products/ui';

export interface CheckoutTranslations {
  // Page title and headers
  pageTitle: string;
  yourPurchase: string;
  
  // Form fields
  emailAddress: string;
  emailPlaceholder: string;
  firstName: string;
  firstNamePlaceholder: string;
  lastName: string;
  lastNamePlaceholder: string;
  phoneNumber: string;
  phonePlaceholder: string;
  companyName: string;
  companyNameOptional: string;
  companyPlaceholder: string;
  
  // Shipping address
  shippingAddress: string;
  fullName: string;
  fullNamePlaceholder: string;
  country: string;
  selectCountry: string;
  address: string;
  addressPlaceholder: string;
  zipCode: string;
  zipPlaceholder: string;
  city: string;
  cityPlaceholder: string;
  
  // Order summary
  subtotal: string;
  price: string;
  tax: string;
  total: string;
  
  // Payment related
  paymentInformation: string;
  cardInformation: string;
  paymentMethods: string;
  payButton: string;
  processingPayment: string;
  
  // Errors
  paymentError: string;
  paymentNotLoadedError: string;
  missingInformation: string;
  missingNameError: string;
  missingPhoneError: string;
  missingShippingError: string;
  paymentFailedTitle: string;
  paymentFailedDefault: string;
  unexpectedError: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  priceEUR: number;
  imageUrl: string;
  category: string;
  features?: string[];
  specifications?: string[];
  hardwareInfo?: string;
  softwareInfo?: string;
  stripeProductId?: string;
  currency?: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
  product: Product;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  phone?: string;
  country?: string;
  street?: string;
  house?: string;
  apartment?: string;
  language?: string;
  isVerified?: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  verificationToken?: string;
  shippingAddress?: ShippingAddress;
  billingAddress?: BillingAddress;
  orders?: Order[];
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
}

export interface BillingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
}

export interface Order {
  id: number;
  userId: number;
  status: string;
  items: OrderItem[];
  total: number;
  currency: string;
  tax?: number;
  taxRate?: string;
  paymentIntentId?: string;
  createdAt: string;
  subscriptionId?: string;
  isSubscription?: boolean;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  name: string;
  product?: Product;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
  items?: OrderItem[];
  taxAmount?: number;
  taxRate?: string;
  taxLabel?: string;
}

export interface Locale {
  code: string;
  name: string;
  flag: string;
}

export interface LocalizedProduct {
  id: number;
  name: string;
  description: string;
  specs?: Record<string, string>;
  aiCapabilities?: string;
  softwareInfo?: string;
  learnMoreTitle?: string;
  learnMoreContent?: string;
}

export interface ProductTranslation {
  title: string;
  description: string;
  features: string[];
  specifications: {
    [key: string]: string;
  };
  hardwareInfo?: string[];
  softwareInfo?: string[];
}

export interface ProductTranslations {
  [key: number]: ProductTranslation;
}

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
  // Статические компоненты вкладки Software
  cloudIntegration: string;
  cloudIntegrationDesc: string;
  dataPipelines: string;
  dataPipelinesDesc: string;
  aiPerformance: string;
  aiPerformanceDesc: string;
  softwareStack: string;
  softwareStackDesc: string;
  applications: string;
  applicationsDesc: string;
  apiIntegration: string;
  apiIntegrationDesc: string;
  edgeComputing: string;
}

// Определение интерфейса уже есть выше

export type ProductUILanguage = keyof typeof productUITranslations;

export interface InfoPage {
  id: number;
  title: string;
  description: string;
  content: string;
}

export const DEFAULT_LOCALE = 'en';
export const DEFAULT_CURRENCY = 'usd';