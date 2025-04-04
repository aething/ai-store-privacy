/**
 * English (en) checkout translations
 */

import { CheckoutTranslations } from '@/types';

const translations: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "Checkout",
  yourPurchase: "Your Purchase",
  
  // Form fields
  emailAddress: "Email Address",
  emailPlaceholder: "your.email@example.com",
  firstName: "First Name",
  firstNamePlaceholder: "John",
  lastName: "Last Name",
  lastNamePlaceholder: "Doe",
  phoneNumber: "Phone Number",
  phonePlaceholder: "+1 (555) 123-4567",
  companyName: "Company Name",
  companyNameOptional: "Company Name (Optional)",
  companyPlaceholder: "Your Company Ltd",
  
  // Shipping address
  shippingAddress: "Shipping Address",
  fullName: "Full Name",
  fullNamePlaceholder: "John Doe",
  country: "Country",
  selectCountry: "Select a country",
  address: "Address",
  addressPlaceholder: "123 Main Street",
  zipCode: "ZIP / Postal Code",
  zipPlaceholder: "10001",
  city: "City",
  cityPlaceholder: "New York",
  
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
  paymentNotLoadedError: "Payment system not loaded. Please try again or contact support.",
  missingInformation: "Missing Information",
  missingNameError: "Please provide your name",
  missingPhoneError: "Please provide your phone number",
  missingShippingError: "Please provide shipping information",
  paymentFailedTitle: "Payment Failed",
  paymentFailedDefault: "There was an error processing your payment. Please try again.",
  unexpectedError: "An unexpected error occurred. Please try again."
};

export default translations;