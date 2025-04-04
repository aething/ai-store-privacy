/**
 * French (fr) checkout translations
 */

import { CheckoutTranslations } from '@/types';

const translations: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "Paiement",
  yourPurchase: "Votre Achat",
  
  // Form fields
  emailAddress: "Adresse e-mail",
  emailPlaceholder: "votre.email@exemple.fr",
  firstName: "Prénom",
  firstNamePlaceholder: "Jean",
  lastName: "Nom",
  lastNamePlaceholder: "Dupont",
  phoneNumber: "Numéro de téléphone",
  phonePlaceholder: "+33 1 23 45 67 89",
  companyName: "Nom de l'entreprise",
  companyNameOptional: "Nom de l'entreprise (Optionnel)",
  companyPlaceholder: "Votre Entreprise SARL",
  
  // Shipping address
  shippingAddress: "Adresse de livraison",
  fullName: "Nom complet",
  fullNamePlaceholder: "Jean Dupont",
  country: "Pays",
  selectCountry: "Sélectionnez un pays",
  address: "Adresse",
  addressPlaceholder: "123 Rue de l'Exemple",
  zipCode: "Code postal",
  zipPlaceholder: "75001",
  city: "Ville",
  cityPlaceholder: "Paris",
  
  // Order summary
  subtotal: "Sous-total",
  price: "Prix",
  tax: "TVA",
  total: "Total",
  
  // Payment related
  paymentInformation: "Informations de paiement",
  cardInformation: "Informations de carte",
  paymentMethods: "Méthodes de paiement",
  payButton: "Payer",
  processingPayment: "Traitement du paiement...",
  
  // Errors
  paymentError: "Erreur de paiement",
  paymentNotLoadedError: "Le système de paiement n'a pas été chargé. Veuillez réessayer ou contacter le support.",
  missingInformation: "Informations manquantes",
  missingNameError: "Veuillez fournir votre nom",
  missingPhoneError: "Veuillez fournir votre numéro de téléphone",
  missingShippingError: "Veuillez fournir votre adresse de livraison",
  paymentFailedTitle: "Paiement échoué",
  paymentFailedDefault: "Une erreur s'est produite lors du traitement de votre paiement. Veuillez réessayer.",
  unexpectedError: "Une erreur inattendue s'est produite. Veuillez réessayer."
};

export default translations;