/**
 * German (de) checkout translations
 */

import { CheckoutTranslations } from '@/types';

const translations: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "Kasse",
  yourPurchase: "Ihr Einkauf",
  
  // Form fields
  emailAddress: "E-Mail-Adresse",
  emailPlaceholder: "ihre.email@beispiel.de",
  firstName: "Vorname",
  firstNamePlaceholder: "Max",
  lastName: "Nachname",
  lastNamePlaceholder: "Mustermann",
  phoneNumber: "Telefonnummer",
  phonePlaceholder: "+49 123 456789",
  companyName: "Firmenname",
  companyNameOptional: "Firmenname (Optional)",
  companyPlaceholder: "Ihre Firma GmbH",
  
  // Shipping address
  shippingAddress: "Lieferadresse",
  fullName: "Vollständiger Name",
  fullNamePlaceholder: "Max Mustermann",
  country: "Land",
  selectCountry: "Land auswählen",
  address: "Adresse",
  addressPlaceholder: "Musterstraße 123",
  zipCode: "PLZ",
  zipPlaceholder: "12345",
  city: "Stadt",
  cityPlaceholder: "Berlin",
  
  // Order summary
  subtotal: "Zwischensumme",
  price: "Preis",
  tax: "MwSt.",
  total: "Gesamtsumme",
  
  // Payment related
  paymentInformation: "Zahlungsinformationen",
  cardInformation: "Karteninformationen",
  paymentMethods: "Zahlungsarten",
  payButton: "Bezahlen",
  processingPayment: "Zahlung wird verarbeitet...",
  
  // Errors
  paymentError: "Zahlungsfehler",
  paymentNotLoadedError: "Zahlungssystem konnte nicht geladen werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
  missingInformation: "Fehlende Informationen",
  missingNameError: "Bitte geben Sie Ihren Namen an",
  missingPhoneError: "Bitte geben Sie Ihre Telefonnummer an",
  missingShippingError: "Bitte geben Sie Ihre Lieferadresse an",
  paymentFailedTitle: "Zahlung fehlgeschlagen",
  paymentFailedDefault: "Bei der Verarbeitung Ihrer Zahlung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
  unexpectedError: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
};

export default translations;