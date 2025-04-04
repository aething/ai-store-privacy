/**
 * Italian (it) checkout translations
 */

import { CheckoutTranslations } from '@/types';

const translations: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "Pagamento",
  yourPurchase: "Il tuo acquisto",
  
  // Form fields
  emailAddress: "Indirizzo email",
  emailPlaceholder: "tua.email@esempio.it",
  firstName: "Nome",
  firstNamePlaceholder: "Mario",
  lastName: "Cognome",
  lastNamePlaceholder: "Rossi",
  phoneNumber: "Numero di telefono",
  phonePlaceholder: "+39 123 456 7890",
  companyName: "Nome azienda",
  companyNameOptional: "Nome azienda (Opzionale)",
  companyPlaceholder: "La Tua Azienda S.r.l.",
  
  // Shipping address
  shippingAddress: "Indirizzo di spedizione",
  fullName: "Nome completo",
  fullNamePlaceholder: "Mario Rossi",
  country: "Paese",
  selectCountry: "Seleziona un paese",
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
  paymentInformation: "Informazioni di pagamento",
  cardInformation: "Informazioni carta",
  paymentMethods: "Metodi di pagamento",
  payButton: "Paga",
  processingPayment: "Elaborazione pagamento...",
  
  // Errors
  paymentError: "Errore di pagamento",
  paymentNotLoadedError: "Il sistema di pagamento non è stato caricato. Riprova o contatta l'assistenza.",
  missingInformation: "Informazioni mancanti",
  missingNameError: "Inserisci il tuo nome",
  missingPhoneError: "Inserisci il tuo numero di telefono",
  missingShippingError: "Inserisci il tuo indirizzo di spedizione",
  paymentFailedTitle: "Pagamento fallito",
  paymentFailedDefault: "Si è verificato un errore durante l'elaborazione del pagamento. Riprova.",
  unexpectedError: "Si è verificato un errore imprevisto. Riprova."
};

export default translations;