import { CheckoutTranslations } from '@/types';

export const de: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "Zur Kasse",
  yourPurchase: "Ihr Einkauf",
  
  // Form fields
  emailAddress: "E-Mail-Adresse",
  emailPlaceholder: "beispiel@domain.de",
  firstName: "Vorname",
  firstNamePlaceholder: "Geben Sie Ihren Vornamen ein",
  lastName: "Nachname",
  lastNamePlaceholder: "Geben Sie Ihren Nachnamen ein",
  phoneNumber: "Telefonnummer",
  phonePlaceholder: "+49 XXX XXXXXXX",
  companyName: "Firma",
  companyNameOptional: "Firma (optional)",
  companyPlaceholder: "Firmenname",
  
  // Shipping address
  shippingAddress: "Lieferadresse",
  fullName: "Vollständiger Name",
  fullNamePlaceholder: "Vollständigen Namen eingeben",
  country: "Land",
  selectCountry: "Land auswählen",
  address: "Adresse",
  addressPlaceholder: "Straße, Hausnummer, etc.",
  zipCode: "Postleitzahl",
  zipPlaceholder: "z.B. 10115",
  city: "Stadt",
  cityPlaceholder: "z.B. Berlin",
  
  // Order summary
  subtotal: "Zwischensumme",
  price: "Preis",
  tax: "MwSt.",
  total: "Gesamtsumme",
  
  // Payment related
  paymentInformation: "Zahlungsinformationen",
  cardInformation: "Karteninformationen",
  paymentMethods: "Zahlungsmethoden",
  payButton: "Bezahlen",
  processingPayment: "Zahlung wird bearbeitet...",
  
  // Errors
  paymentError: "Zahlungsfehler",
  paymentNotLoadedError: "Zahlungsinformationen konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
  missingInformation: "Fehlende Informationen",
  missingNameError: "Bitte geben Sie Ihren vollständigen Namen an",
  missingPhoneError: "Bitte geben Sie eine gültige Telefonnummer an",
  missingShippingError: "Bitte vervollständigen Sie alle Versandinformationen",
  paymentFailedTitle: "Zahlung fehlgeschlagen",
  paymentFailedDefault: "Wir konnten Ihre Zahlung nicht verarbeiten. Bitte überprüfen Sie die Details und versuchen Sie es erneut.",
  unexpectedError: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
};