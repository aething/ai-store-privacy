import { CheckoutTranslations } from '@/types';

export const es: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "Finalizar Compra",
  yourPurchase: "Tu Compra",
  
  // Form fields
  emailAddress: "Correo Electrónico",
  emailPlaceholder: "ejemplo@dominio.com",
  firstName: "Nombre",
  firstNamePlaceholder: "Introduce tu nombre",
  lastName: "Apellidos",
  lastNamePlaceholder: "Introduce tus apellidos",
  phoneNumber: "Número de Teléfono",
  phonePlaceholder: "+34 XXX XXX XXX",
  companyName: "Empresa",
  companyNameOptional: "Empresa (opcional)",
  companyPlaceholder: "Nombre de la empresa",
  
  // Shipping address
  shippingAddress: "Dirección de Envío",
  fullName: "Nombre Completo",
  fullNamePlaceholder: "Introduce nombre completo",
  country: "País",
  selectCountry: "Selecciona un país",
  address: "Dirección",
  addressPlaceholder: "Calle, número, piso",
  zipCode: "Código Postal",
  zipPlaceholder: "Ej. 28001",
  city: "Ciudad",
  cityPlaceholder: "Ej. Madrid",
  
  // Order summary
  subtotal: "Subtotal",
  price: "Precio",
  tax: "Impuestos",
  total: "Total",
  
  // Payment related
  paymentInformation: "Información de Pago",
  cardInformation: "Información de Tarjeta",
  paymentMethods: "Métodos de Pago",
  payButton: "Pagar",
  processingPayment: "Procesando Pago...",
  
  // Errors
  paymentError: "Error de Pago",
  paymentNotLoadedError: "No se pudo cargar la información de pago. Por favor, intenta de nuevo.",
  missingInformation: "Información Incompleta",
  missingNameError: "Por favor, proporciona tu nombre completo",
  missingPhoneError: "Por favor, proporciona un número de teléfono válido",
  missingShippingError: "Por favor, completa toda la información de envío",
  paymentFailedTitle: "Pago Fallido",
  paymentFailedDefault: "No pudimos procesar tu pago. Por favor, verifica los detalles e intenta de nuevo.",
  unexpectedError: "Ha ocurrido un error inesperado. Por favor, intenta de nuevo."
};