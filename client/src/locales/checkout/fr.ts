import { CheckoutTranslations } from '@/types';

export const fr: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "Paiement",
  yourPurchase: "Votre Achat",
  
  // Form fields
  emailAddress: "Adresse Email",
  emailPlaceholder: "exemple@domaine.fr",
  firstName: "Prénom",
  firstNamePlaceholder: "Entrez votre prénom",
  lastName: "Nom",
  lastNamePlaceholder: "Entrez votre nom",
  phoneNumber: "Numéro de Téléphone",
  phonePlaceholder: "+33 X XX XX XX XX",
  companyName: "Société",
  companyNameOptional: "Société (facultatif)",
  companyPlaceholder: "Nom de la société",
  
  // Shipping address
  shippingAddress: "Adresse de Livraison",
  fullName: "Nom Complet",
  fullNamePlaceholder: "Entrez votre nom complet",
  country: "Pays",
  selectCountry: "Sélectionnez un pays",
  address: "Adresse",
  addressPlaceholder: "Rue, numéro, appartement, etc.",
  zipCode: "Code Postal",
  zipPlaceholder: "ex. 75001",
  city: "Ville",
  cityPlaceholder: "ex. Paris",
  
  // Order summary
  subtotal: "Sous-total",
  price: "Prix",
  tax: "TVA",
  total: "Total",
  
  // Payment related
  paymentInformation: "Informations de Paiement",
  cardInformation: "Informations de Carte",
  paymentMethods: "Méthodes de Paiement",
  payButton: "Payer",
  processingPayment: "Traitement du Paiement...",
  
  // Errors
  paymentError: "Erreur de Paiement",
  paymentNotLoadedError: "Impossible de charger les informations de paiement. Veuillez réessayer.",
  missingInformation: "Informations Manquantes",
  missingNameError: "Veuillez fournir votre nom complet",
  missingPhoneError: "Veuillez fournir un numéro de téléphone valide",
  missingShippingError: "Veuillez compléter toutes les informations de livraison",
  paymentFailedTitle: "Échec du Paiement",
  paymentFailedDefault: "Nous n'avons pas pu traiter votre paiement. Veuillez vérifier les détails et réessayer.",
  unexpectedError: "Une erreur inattendue s'est produite. Veuillez réessayer."
};