/**
 * English localization for checkout page
 */
import { CheckoutTranslations } from '@/types';

export const en: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "Checkout",
  yourPurchase: "Your Purchase",
  
  // Form fields
  emailAddress: "Email Address",
  emailPlaceholder: "email@example.com",
  firstName: "First Name",
  firstNamePlaceholder: "John",
  lastName: "Last Name",
  lastNamePlaceholder: "Doe",
  phoneNumber: "Phone Number",
  phonePlaceholder: "+1 234 567 8900",
  companyName: "Company Name",
  companyNameOptional: "Company Name (Optional)",
  companyPlaceholder: "Example Company Inc.",
  
  // Shipping address
  shippingAddress: "Shipping Address",
  fullName: "Full Name",
  fullNamePlaceholder: "John Doe",
  country: "Country",
  selectCountry: "Select Country",
  address: "Address",
  addressPlaceholder: "123 Example St.",
  zipCode: "ZIP Code",
  zipPlaceholder: "12345",
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
  payButton: "Pay Now",
  processingPayment: "Processing Payment...",
  
  // Errors
  paymentError: "Payment Error",
  paymentNotLoadedError: "The payment system is not fully loaded yet. Please try again.",
  missingInformation: "Missing Information",
  missingNameError: "Please provide your name for delivery.",
  missingPhoneError: "Please provide your phone number for delivery updates.",
  missingShippingError: "Please complete all shipping address fields.",
  paymentFailedTitle: "Payment Failed",
  paymentFailedDefault: "Payment failed. Please try again.",
  unexpectedError: "An unexpected error occurred during payment. Please try again later."
};