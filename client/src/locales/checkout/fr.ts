/**
 * French localization for checkout page
 */
import { CheckoutTranslations } from '@/types';

export const fr: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "Paiement",
  yourPurchase: "Votre Achat",
  
  // Form fields
  emailAddress: "Adresse Email",
  emailPlaceholder: "email@exemple.fr",
  firstName: "Prénom",
  firstNamePlaceholder: "Jean",
  lastName: "Nom",
  lastNamePlaceholder: "Dupont",
  phoneNumber: "Numéro de Téléphone",
  phonePlaceholder: "+33 6 12 34 56 78",
  companyName: "Nom de l'Entreprise",
  companyNameOptional: "Nom de l'Entreprise (Optionnel)",
  companyPlaceholder: "Entreprise Exemple SAS",
  
  // Shipping address
  shippingAddress: "Adresse de Livraison",
  fullName: "Nom Complet",
  fullNamePlaceholder: "Jean Dupont",
  country: "Pays",
  selectCountry: "Sélectionner un Pays",
  address: "Adresse",
  addressPlaceholder: "123 Rue Exemple",
  zipCode: "Code Postal",
  zipPlaceholder: "75001",
  city: "Ville",
  cityPlaceholder: "Paris",
  
  // Order summary
  subtotal: "Sous-total",
  price: "Prix",
  tax: "TVA",
  total: "Total",
  
  // Payment related
  paymentInformation: "Informations de Paiement",
  cardInformation: "Informations de Carte",
  paymentMethods: "Méthodes de Paiement",
  payButton: "Payer Maintenant",
  processingPayment: "Traitement du Paiement...",
  
  // Errors
  paymentError: "Erreur de Paiement",
  paymentNotLoadedError: "Le système de paiement n'est pas entièrement chargé. Veuillez réessayer.",
  missingInformation: "Informations Manquantes",
  missingNameError: "Veuillez fournir votre nom pour la livraison.",
  missingPhoneError: "Veuillez fournir votre numéro de téléphone pour les mises à jour de livraison.",
  missingShippingError: "Veuillez compléter tous les champs d'adresse de livraison.",
  paymentFailedTitle: "Échec du Paiement",
  paymentFailedDefault: "Le paiement a échoué. Veuillez réessayer.",
  unexpectedError: "Une erreur inattendue s'est produite lors du paiement. Veuillez réessayer plus tard."
};