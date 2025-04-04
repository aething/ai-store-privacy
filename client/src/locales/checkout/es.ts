/**
 * Spanish (es) checkout translations
 */

import { CheckoutTranslations } from '@/types';

const translations: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "Pago",
  yourPurchase: "Tu Compra",
  
  // Form fields
  emailAddress: "Correo Electrónico",
  emailPlaceholder: "tu.email@ejemplo.com",
  firstName: "Nombre",
  firstNamePlaceholder: "Juan",
  lastName: "Apellido",
  lastNamePlaceholder: "Pérez",
  phoneNumber: "Número de Teléfono",
  phonePlaceholder: "+34 123 456 789",
  companyName: "Nombre de la Empresa",
  companyNameOptional: "Nombre de la Empresa (Opcional)",
  companyPlaceholder: "Tu Empresa S.L.",
  
  // Shipping address
  shippingAddress: "Dirección de Envío",
  fullName: "Nombre Completo",
  fullNamePlaceholder: "Juan Pérez",
  country: "País",
  selectCountry: "Seleccionar país",
  address: "Dirección",
  addressPlaceholder: "Calle Ejemplo 123",
  zipCode: "Código Postal",
  zipPlaceholder: "28001",
  city: "Ciudad",
  cityPlaceholder: "Madrid",
  
  // Order summary
  subtotal: "Subtotal",
  price: "Precio",
  tax: "IVA",
  total: "Total",
  
  // Payment related
  paymentInformation: "Información de Pago",
  cardInformation: "Información de la Tarjeta",
  paymentMethods: "Métodos de Pago",
  payButton: "Pagar",
  processingPayment: "Procesando Pago...",
  
  // Errors
  paymentError: "Error de Pago",
  paymentNotLoadedError: "El sistema de pago no se ha cargado. Por favor, inténtelo de nuevo o contacte con soporte.",
  missingInformation: "Información Faltante",
  missingNameError: "Por favor, proporcione su nombre",
  missingPhoneError: "Por favor, proporcione su número de teléfono",
  missingShippingError: "Por favor, proporcione su dirección de envío",
  paymentFailedTitle: "Pago Fallido",
  paymentFailedDefault: "Hubo un error al procesar su pago. Por favor, inténtelo de nuevo.",
  unexpectedError: "Ocurrió un error inesperado. Por favor, inténtelo de nuevo."
};

export default translations;