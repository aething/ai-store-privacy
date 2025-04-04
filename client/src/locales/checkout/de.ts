/**
 * German localization for checkout page
 */
import { CheckoutTranslations } from '@/types';

export const de: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "Kasse",
  yourPurchase: "Ihr Einkauf",
  
  // Form fields
  emailAddress: "E-Mail-Adresse",
  emailPlaceholder: "email@beispiel.de",
  firstName: "Vorname",
  firstNamePlaceholder: "Hans",
  lastName: "Nachname",
  lastNamePlaceholder: "Müller",
  phoneNumber: "Telefonnummer",
  phonePlaceholder: "+49 123 4567890",
  companyName: "Firmenname",
  companyNameOptional: "Firmenname (Optional)",
  companyPlaceholder: "Beispiel GmbH",
  
  // Shipping address
  shippingAddress: "Lieferadresse",
  fullName: "Vollständiger Name",
  fullNamePlaceholder: "Hans Müller",
  country: "Land",
  selectCountry: "Land auswählen",
  address: "Adresse",
  addressPlaceholder: "Beispielstraße 123",
  zipCode: "Postleitzahl",
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
  paymentMethods: "Zahlungsmethoden",
  payButton: "Jetzt bezahlen",
  processingPayment: "Zahlung wird verarbeitet...",
  
  // Errors
  paymentError: "Zahlungsfehler",
  paymentNotLoadedError: "Das Zahlungssystem ist noch nicht vollständig geladen. Bitte versuchen Sie es erneut.",
  missingInformation: "Fehlende Informationen",
  missingNameError: "Bitte geben Sie Ihren Namen für die Lieferung an.",
  missingPhoneError: "Bitte geben Sie Ihre Telefonnummer für Lieferaktualisierungen an.",
  missingShippingError: "Bitte füllen Sie alle Felder der Lieferadresse aus.",
  paymentFailedTitle: "Zahlung fehlgeschlagen",
  paymentFailedDefault: "Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.",
  unexpectedError: "Bei der Zahlung ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es später erneut."
};