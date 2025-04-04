import { CheckoutTranslations } from '@/types';

export const it: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "Pagamento",
  yourPurchase: "Il Tuo Acquisto",
  
  // Form fields
  emailAddress: "Indirizzo Email",
  emailPlaceholder: "esempio@dominio.it",
  firstName: "Nome",
  firstNamePlaceholder: "Inserisci il tuo nome",
  lastName: "Cognome",
  lastNamePlaceholder: "Inserisci il tuo cognome",
  phoneNumber: "Numero di Telefono",
  phonePlaceholder: "+39 XXX XXXXXXX",
  companyName: "Azienda",
  companyNameOptional: "Azienda (opzionale)",
  companyPlaceholder: "Nome dell'azienda",
  
  // Shipping address
  shippingAddress: "Indirizzo di Spedizione",
  fullName: "Nome Completo",
  fullNamePlaceholder: "Inserisci il nome completo",
  country: "Paese",
  selectCountry: "Seleziona un paese",
  address: "Indirizzo",
  addressPlaceholder: "Via, numero civico, ecc.",
  zipCode: "Codice Postale",
  zipPlaceholder: "es. 00100",
  city: "Città",
  cityPlaceholder: "es. Roma",
  
  // Order summary
  subtotal: "Subtotale",
  price: "Prezzo",
  tax: "IVA",
  total: "Totale",
  
  // Payment related
  paymentInformation: "Informazioni di Pagamento",
  cardInformation: "Informazioni della Carta",
  paymentMethods: "Metodi di Pagamento",
  payButton: "Paga",
  processingPayment: "Elaborazione Pagamento...",
  
  // Errors
  paymentError: "Errore di Pagamento",
  paymentNotLoadedError: "Impossibile caricare le informazioni di pagamento. Si prega di riprovare.",
  missingInformation: "Informazioni Mancanti",
  missingNameError: "Si prega di fornire il nome completo",
  missingPhoneError: "Si prega di fornire un numero di telefono valido",
  missingShippingError: "Si prega di completare tutte le informazioni di spedizione",
  paymentFailedTitle: "Pagamento Fallito",
  paymentFailedDefault: "Non è stato possibile elaborare il pagamento. Si prega di verificare i dettagli e riprovare.",
  unexpectedError: "Si è verificato un errore imprevisto. Si prega di riprovare."
};