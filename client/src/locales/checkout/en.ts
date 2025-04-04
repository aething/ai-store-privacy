import { CheckoutTranslations } from '@/types';

export const en: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "Checkout",
  yourPurchase: "Your Purchase",
  
  // Form fields
  emailAddress: "Email Address",
  emailPlaceholder: "example@domain.com",
  firstName: "First Name",
  firstNamePlaceholder: "Enter your first name",
  lastName: "Last Name",
  lastNamePlaceholder: "Enter your last name",
  phoneNumber: "Phone Number",
  phonePlaceholder: "+1 XXX XXX XXXX",
  companyName: "Company",
  companyNameOptional: "Company (optional)",
  companyPlaceholder: "Company name",
  
  // Shipping address
  shippingAddress: "Shipping Address",
  fullName: "Full Name",
  fullNamePlaceholder: "Enter full name",
  country: "Country",
  selectCountry: "Select a country",
  address: "Address",
  addressPlaceholder: "Street address, apt, suite, etc.",
  zipCode: "ZIP / Postal Code",
  zipPlaceholder: "e.g. 10001",
  city: "City",
  cityPlaceholder: "e.g. New York",
  
  // Order summary
  subtotal: "Subtotal",
  price: "Price",
  tax: "Tax",
  total: "Total",
  
  // Payment related
  paymentInformation: "Payment Information",
  cardInformation: "Card Information",
  paymentMethods: "Payment Methods",
  payButton: "Pay",
  processingPayment: "Processing Payment...",
  
  // Errors
  paymentError: "Payment Error",
  paymentNotLoadedError: "Could not load payment information. Please try again.",
  missingInformation: "Missing Information",
  missingNameError: "Please provide your full name",
  missingPhoneError: "Please provide a valid phone number",
  missingShippingError: "Please complete all shipping information",
  paymentFailedTitle: "Payment Failed",
  paymentFailedDefault: "We couldn't process your payment. Please check the details and try again.",
  unexpectedError: "An unexpected error occurred. Please try again."
};