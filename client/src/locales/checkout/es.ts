/**
 * Spanish localization for checkout page
 */
import { CheckoutTranslations } from '@/types';

export const es: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "Finalizar Compra",
  yourPurchase: "Tu Compra",
  
  // Form fields
  emailAddress: "Correo Electrónico",
  emailPlaceholder: "email@ejemplo.es",
  firstName: "Nombre",
  firstNamePlaceholder: "Juan",
  lastName: "Apellido",
  lastNamePlaceholder: "Pérez",
  phoneNumber: "Número de Teléfono",
  phonePlaceholder: "+34 612 345 678",
  companyName: "Nombre de la Empresa",
  companyNameOptional: "Nombre de la Empresa (Opcional)",
  companyPlaceholder: "Empresa Ejemplo S.L.",
  
  // Shipping address
  shippingAddress: "Dirección de Envío",
  fullName: "Nombre Completo",
  fullNamePlaceholder: "Juan Pérez",
  country: "País",
  selectCountry: "Seleccionar País",
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
  cardInformation: "Información de Tarjeta",
  paymentMethods: "Métodos de Pago",
  payButton: "Pagar Ahora",
  processingPayment: "Procesando Pago...",
  
  // Errors
  paymentError: "Error de Pago",
  paymentNotLoadedError: "El sistema de pago aún no está completamente cargado. Inténtalo de nuevo.",
  missingInformation: "Falta Información",
  missingNameError: "Por favor, proporciona tu nombre para la entrega.",
  missingPhoneError: "Por favor, proporciona tu número de teléfono para actualizaciones de entrega.",
  missingShippingError: "Por favor, completa todos los campos de la dirección de envío.",
  paymentFailedTitle: "Pago Fallido",
  paymentFailedDefault: "El pago ha fallado. Por favor, inténtalo de nuevo.",
  unexpectedError: "Ha ocurrido un error inesperado durante el pago. Por favor, inténtalo más tarde."
};