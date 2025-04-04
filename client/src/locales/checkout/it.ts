/**
 * Italian localization for checkout page
 */
import { CheckoutTranslations } from '@/types';

export const it: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "Checkout",
  yourPurchase: "Il Tuo Acquisto",
  
  // Form fields
  emailAddress: "Indirizzo Email",
  emailPlaceholder: "email@esempio.it",
  firstName: "Nome",
  firstNamePlaceholder: "Mario",
  lastName: "Cognome",
  lastNamePlaceholder: "Rossi",
  phoneNumber: "Numero di Telefono",
  phonePlaceholder: "+39 123 456 7890",
  companyName: "Nome Azienda",
  companyNameOptional: "Nome Azienda (Opzionale)",
  companyPlaceholder: "Azienda Esempio S.r.l.",
  
  // Shipping address
  shippingAddress: "Indirizzo di Spedizione",
  fullName: "Nome Completo",
  fullNamePlaceholder: "Mario Rossi",
  country: "Paese",
  selectCountry: "Seleziona Paese",
  address: "Indirizzo",
  addressPlaceholder: "Via Esempio 123",
  zipCode: "CAP",
  zipPlaceholder: "00100",
  city: "Città",
  cityPlaceholder: "Roma",
  
  // Order summary
  subtotal: "Subtotale",
  price: "Prezzo",
  tax: "IVA",
  total: "Totale",
  
  // Payment related
  paymentInformation: "Informazioni di Pagamento",
  cardInformation: "Informazioni Carta",
  paymentMethods: "Metodi di Pagamento",
  payButton: "Paga Ora",
  processingPayment: "Elaborazione Pagamento...",
  
  // Errors
  paymentError: "Errore di Pagamento",
  paymentNotLoadedError: "Il sistema di pagamento non è ancora completamente caricato. Si prega di riprovare.",
  missingInformation: "Informazioni Mancanti",
  missingNameError: "Si prega di fornire nome e cognome per la consegna.",
  missingPhoneError: "Si prega di fornire il numero di telefono per gli aggiornamenti sulla consegna.",
  missingShippingError: "Si prega di completare tutti i campi dell'indirizzo di spedizione.",
  paymentFailedTitle: "Pagamento Fallito",
  paymentFailedDefault: "Pagamento fallito. Si prega di riprovare.",
  unexpectedError: "Si è verificato un errore inaspettato durante il pagamento. Si prega di riprovare più tardi."
};