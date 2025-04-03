import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { useStripe, Elements, PaymentElement, useElements, LinkAuthenticationElement, AddressElement } from '@stripe/react-stripe-js';
import { useEffect, useState } from "react";
import stripePromise, { REGISTERED_DOMAIN_ID } from "@/lib/stripe";
import { formatPrice, getCurrencyForCountry, getPriceForCountry } from "@/lib/currency";
import { apiRequest } from "@/lib/queryClient";
import type { Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { TaxDisplayBoxSimple } from "@/components/TaxDisplayBoxSimple";
import { COMPANY_INFO, getVatIdForCountry } from "@shared/companyInfo";
import { createPaymentIntent, updatePaymentIntentQuantity } from "@/api/payments";

const CheckoutForm = ({ 
  productId, 
  amount, 
  currency, 
  product,
  stripeTaxInfo,
  clientSecret
}: { 
  productId: number; 
  amount: number; 
  currency: 'usd' | 'eur'; 
  product?: Product;
  stripeTaxInfo?: {amount: number; rate: number; label: string; display: string} | null;
  clientSecret: string;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  
  // Обработчик отслеживания изменения метода оплаты для диагностики
  useEffect(() => {
    if (!elements) return;
    
    const onChange = (event: any) => {
      if (event.type === 'change' && event.payload) {
        console.log('PaymentElement изменен:', event.payload);
        if (event.payload.value && event.payload.value.type) {
          setPaymentMethod(event.payload.value.type);
          console.log('Выбран метод оплаты:', event.payload.value.type);
        }
      }
    };
    
    const element = elements.getElement(PaymentElement);
    if (element) {
      element.on('change', onChange);
      return () => element.off('change', onChange);
    }
  }, [elements]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !user) {
      console.error('Stripe, elements или user недоступны:', { 
        stripeAvailable: !!stripe, 
        elementsAvailable: !!elements, 
        userAvailable: !!user 
      });
      
      toast({
        title: "Payment Error",
        description: "Payment system is not fully loaded yet. Please try again.",
        variant: "destructive",
      });
      
      return;
    }
    
    // Начинаем обработку платежа
    setIsLoading(true);
    console.log('Начинаем обработку платежа...');
    console.log('Выбранный метод оплаты:', paymentMethod);
    
    try {
      // Получаем email из элемента LinkAuthenticationElement
      const linkAuthentication = elements.getElement(LinkAuthenticationElement);
      
      // Для отладки: проверка состояния элементов
      const paymentElement = elements.getElement(PaymentElement);
      console.log('PaymentElement status:', paymentElement ? 'loaded' : 'not loaded');
      console.log('LinkAuthentication status:', linkAuthentication ? 'loaded' : 'not loaded');
      
      // Дополнительные параметры для confirmParams
      const confirmParams = {
        // URL для перенаправления после успешного платежа
        return_url: window.location.origin + "/confirmation",
        // Метаданные для отслеживания платежа
        payment_method_data: {
          billing_details: {
            email: user.email,
            name: user.username,
          }
        },
        // Зарегистрированный домен не указываем в confirmParams,
        // так как эти настройки используются автоматически из конфигурации Stripe
        receipt_email: user.email,
      };
      
      console.log('Используем confirmPayment с параметрами:', {
        returnUrl: confirmParams.return_url,
        email: user.email,
      });
      
      // Разные методы подтверждения в зависимости от выбранного способа оплаты
      let result;
      
      // Специфические обработки для разных платежных методов
      if (paymentMethod === 'link') {
        console.log('Используем особый процесс для Link...');
        const { error: linkError } = await stripe.confirmPayment({
          elements,
          confirmParams,
          redirect: 'if_required', // 'always' в продакшене
        });
        
        result = { error: linkError };
      } 
      else if (paymentMethod === 'apple_pay') {
        console.log('Используем особый процесс для Apple Pay...');
        // Стандартная обработка для Apple Pay - специфические настройки не требуются
        // поскольку они настраиваются в платежном намерении на сервере
        const { error: applePayError } = await stripe.confirmPayment({
          elements,
          confirmParams,
          redirect: 'if_required',
        });
        
        result = { error: applePayError };
      }
      else if (paymentMethod === 'google_pay') {
        console.log('Используем особый процесс для Google Pay...');
        // Стандартная обработка для Google Pay - специфические настройки не требуются
        // поскольку они настраиваются в платежном намерении на сервере
        const { error: googlePayError } = await stripe.confirmPayment({
          elements,
          confirmParams,
          redirect: 'if_required',
        });
        
        result = { error: googlePayError };
      }
      else {
        // Стандартное подтверждение для всех остальных методов (обычные карты)
        result = await stripe.confirmPayment({
          elements,
          confirmParams,
          redirect: 'if_required',
        });
      }
      
      const { error, paymentIntent } = result;
      
      if (error) {
        console.error('Ошибка подтверждения платежа:', error);
        
        // Отображение понятной ошибки пользователю
        let errorMessage = "Payment failed. Please try again.";
        
        if (error.type === 'card_error' || error.type === 'validation_error') {
          errorMessage = error.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (paymentIntent) {
        // Платеж успешно обработан без перенаправления
        console.log('Платеж успешно выполнен:', paymentIntent);
        
        // Ручное перенаправление на страницу успеха
        const confirmationUrl = `${window.location.origin}/confirmation?payment_intent=${paymentIntent.id}&payment_intent_client_secret=${clientSecret}&redirect_status=succeeded`;
        window.location.href = confirmationUrl;
      } else {
        console.log('Платеж успешно инициирован, ожидаем перенаправление...');
        // В этом случае перенаправление будет выполнено автоматически
      }
    } catch (err) {
      console.error('Неожиданная ошибка при обработке платежа:', err);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred during payment. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Элемент аутентификации для Link (сохраняет email для будущих покупок) */}
      {/* Элемент Link для аутентификации пользователя */}
      <LinkAuthenticationElement
        id="link-authentication-element"
        options={{
          defaultValues: {
            email: user?.email || '',
          },
          // Всегда показывать поле email для Link
          emailRequired: true
        }}
      />
      
      {/* Информация о заказе */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm shadow-sm">
        <h3 className="text-center font-bold text-gray-800 text-base mb-3 border-b pb-2">
          {product?.title || 'Your Purchase'}
        </h3>
        <div className="flex justify-between items-center mb-2 text-gray-700">
          <span>Price:</span>
          <span className="font-medium">{formatPrice(amount, currency)}</span>
        </div>
        {stripeTaxInfo && stripeTaxInfo.amount > 0 && (
          <div className="flex justify-between items-center mb-2 text-gray-700">
            <span>{stripeTaxInfo.label || 'Tax'}:</span>
            <span>{formatPrice(stripeTaxInfo.amount, currency)}</span>
          </div>
        )}
        <div className="flex justify-between items-center mt-3 pt-2 border-t text-green-700 font-bold">
          <span>Total:</span>
          <span>{formatPrice(amount + (stripeTaxInfo?.amount || 0), currency)}</span>
        </div>
      </div>

      {/* Основной элемент оплаты с поддержкой Apple Pay, Google Pay и Link */}
      <PaymentElement 
        id="payment-element"
        options={{
          layout: {
            type: 'tabs', 
            defaultCollapsed: false,
          },
          defaultValues: {
            billingDetails: {
              email: user?.email || '',
              name: user?.username || '',
            }
          },
          fields: {
            billingDetails: {
              // Показываем только необходимые поля
              email: 'never', // Email уже собираем в LinkAuthenticationElement
              phone: 'auto',
              address: {
                country: 'auto',
                postalCode: 'auto',
                line1: 'auto',
                line2: 'never', // Упрощаем форму
                city: 'auto',
                state: 'auto',
              }
            }
          }
        }}
      />
      
      <button 
        type="submit"
        disabled={!stripe || isLoading}
        className="bg-blue-600 text-white w-full py-3 rounded-full font-medium hover:bg-blue-700 disabled:opacity-70"
      >
        {isLoading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

export default function Checkout() {
  const [match, params] = useRoute("/checkout/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user: authUser } = useAppContext();
  const [clientSecret, setClientSecret] = useState("");
  const [stripeLoadingFailed, setStripeLoadingFailed] = useState(false);
  const [paymentIntentError, setPaymentIntentError] = useState(false);
  const [taxInfo, setTaxInfo] = useState<{rate: number; label: string; amount: number}>({ rate: 0, label: 'Tax', amount: 0 });
  const [stripeTaxInfo, setStripeTaxInfo] = useState<{amount: number; rate: number; label: string; display: string} | null>(null);
  const [demoUser, setDemoUser] = useState<any>(null);
  
  // Добавляем состояние для отслеживания количества и ID PaymentIntent
  const [quantity, setQuantity] = useState(1);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  
  // Получаем productId из URL-параметров или из query-строки
  let productId: number | null = null;
  const searchParams = new URLSearchParams(window.location.search);
  const isDemoMode = searchParams.get('demo') === 'true';
  
  // Сначала проверяем параметр из route
  if (match && params.id) {
    productId = parseInt(params.id);
  } 
  // Если не найден, проверяем query-параметр
  else {
    const productIdParam = searchParams.get('productId');
    if (productIdParam) {
      productId = parseInt(productIdParam);
    }
  }
  
  // Проверяем демо-режим и загружаем данные демо-пользователя при необходимости
  useEffect(() => {
    if (isDemoMode) {
      try {
        const storedDemoUser = localStorage.getItem('demo_user');
        if (storedDemoUser) {
          const parsedUser = JSON.parse(storedDemoUser);
          setDemoUser(parsedUser);
          console.log('Используем демо-режим с пользователем:', parsedUser);
        }
      } catch (error) {
        console.error('Ошибка при загрузке демо-пользователя:', error);
      }
    }
  }, [isDemoMode]);
  
  const { data: product } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  // Объединяем обычного пользователя и демо-пользователя, если он активен
  const user = demoUser || authUser;
  
  // Определяем валюту и цену на основе страны пользователя
  // Если пользователь не авторизован, используем 'DE' (Германию) по умолчанию
  const defaultCountry = 'DE'; 
  const currency = getCurrencyForCountry(user?.country || defaultCountry);
  const price = product ? getPriceForCountry(product, user?.country || defaultCountry) : 0;
  
  // Определяем источник цены (Stripe или обычные данные)
  const isStripePrice = product?.stripeProductId ? true : false;
  
  // Функция для определения ставки налога на основе страны пользователя
  const calculateTaxRate = (country?: string | null) => {
    if (!country) return { rate: 0, label: 'No VAT/Tax' };
    
    // Для США - специальная обработка
    if (country === 'US') {
      // В настоящий момент налоги для США не применяются, так как пороги nexus не достигнуты
      return { rate: 0, label: 'No Sales Tax' };
    }
    
    // Для стран ЕС и других - НДС по правилам каждой страны
    const euVatRates: Record<string, { rate: number; label: string }> = {
      // Страны ЕС
      'AT': { rate: 0.20, label: 'MwSt. 20%' }, // Австрия
      'BE': { rate: 0.21, label: 'BTW 21%' },   // Бельгия
      'BG': { rate: 0.20, label: 'ДДС 20%' },   // Болгария
      'HR': { rate: 0.25, label: 'PDV 25%' },   // Хорватия
      'CY': { rate: 0.19, label: 'ΦΠΑ 19%' },   // Кипр
      'CZ': { rate: 0.21, label: 'DPH 21%' },   // Чехия
      'DK': { rate: 0.25, label: 'MOMS 25%' },  // Дания
      'EE': { rate: 0.20, label: 'KM 20%' },    // Эстония
      'FI': { rate: 0.24, label: 'ALV 24%' },   // Финляндия
      'FR': { rate: 0.20, label: 'TVA 20%' },   // Франция
      'DE': { rate: 0.19, label: 'MwSt. 19%' }, // Германия
      'GR': { rate: 0.24, label: 'ΦΠΑ 24%' },   // Греция
      'HU': { rate: 0.27, label: 'ÁFA 27%' },   // Венгрия
      'IE': { rate: 0.23, label: 'VAT 23%' },   // Ирландия
      'IT': { rate: 0.22, label: 'IVA 22%' },   // Италия
      'LV': { rate: 0.21, label: 'PVN 21%' },   // Латвия
      'LT': { rate: 0.21, label: 'PVM 21%' },   // Литва
      'LU': { rate: 0.17, label: 'TVA 17%' },   // Люксембург
      'MT': { rate: 0.18, label: 'VAT 18%' },   // Мальта
      'NL': { rate: 0.21, label: 'BTW 21%' },   // Нидерланды
      'PL': { rate: 0.23, label: 'VAT 23%' },   // Польша
      'PT': { rate: 0.23, label: 'IVA 23%' },   // Португалия
      'RO': { rate: 0.19, label: 'TVA 19%' },   // Румыния
      'SK': { rate: 0.20, label: 'DPH 20%' },   // Словакия
      'SI': { rate: 0.22, label: 'DDV 22%' },   // Словения
      'ES': { rate: 0.21, label: 'IVA 21%' },   // Испания
      'SE': { rate: 0.25, label: 'MOMS 25%' },  // Швеция
      'GB': { rate: 0.20, label: 'VAT 20%' },   // Великобритания
    };
    
    return euVatRates[country] || { rate: 0, label: 'No VAT/Tax' };
  };

  // Проверка загрузки Stripe
  useEffect(() => {
    // Если Stripe не загрузится за 5 секунд, показываем запасной вариант
    const stripeLoadTimeout = setTimeout(() => {
      if (!stripePromise) {
        setStripeLoadingFailed(true);
        toast({
          title: "Payment System Unavailable",
          description: "The payment system is currently unavailable. Please try again later.",
          variant: "destructive",
        });
      }
    }, 5000);

    return () => clearTimeout(stripeLoadTimeout);
  }, [toast]);
  
  // Константы для налоговой информации
  // Важно: мы используем константы вместо зависимости от хуков 
  // React, чтобы избежать проблем с рендерингом
  const DEFAULT_TAX_RATE = 0.19; // 19% для Германии (по умолчанию)
  const DEFAULT_TAX_LABEL = 'MwSt. 19%'; // Налог по умолчанию
  
  // Вычисляем информацию о налоге при изменении цены или страны пользователя
  useEffect(() => {
    if (!price) return;
    
    // Получаем страну пользователя или используем значение по умолчанию
    const country = user?.country || defaultCountry;
    const { rate, label } = calculateTaxRate(country);
    
    // Рассчитываем сумму налога
    const amount = rate > 0 ? Math.round(price * rate) : 0;
    
    // Обновляем налоговую информацию
    setTaxInfo({ rate, label, amount });
    
    console.log(`Tax calculation: ${price} (${currency}) + ${amount} (${rate * 100}%) = ${price + amount}`);
  }, [user?.country, price, currency, defaultCountry]);
  
  // Определяем базовые значения налоговой информации, чтобы они всегда были доступны
  // даже если хук useEffect не сработал
  const taxRate = taxInfo?.rate || DEFAULT_TAX_RATE;
  const taxLabel = taxInfo?.label || DEFAULT_TAX_LABEL;
  const taxAmount = taxInfo?.amount || Math.round(price * DEFAULT_TAX_RATE);

  // Этот useEffect отвечает за создание PaymentIntent
  useEffect(() => {
    // Выходим сразу, если нет необходимых данных
    if (!productId || !user || !product) return;
    
    const fetchPaymentIntent = async () => {
      try {
        console.log('Initializing payment with quantity:', quantity);
        
        // Создаем платежное намерение с текущим количеством
        console.log('Creating payment intent with:', {
          productId,
          userId: user.id,
          country: user.country,
          price,
          currency,
          quantity
        });
        
        const data = await createPaymentIntent(
          productId, 
          user.id, 
          user.country,
          price,
          currency,
          quantity
        );
        
        setClientSecret(data.clientSecret);
        
        // Сохраняем ID PaymentIntent для последующего обновления
        if (data.id) {
          console.log('Получен ID платежа:', data.id);
          setPaymentIntentId(data.id);
        } else {
          console.warn('ID платежа не получен в ответе API');
        }
        
        setPaymentIntentError(false);
        
        // Если пришла налоговая информация от Stripe, используем ее
        if (data.tax) {
          console.log('Получена налоговая информация от Stripe:', data.tax);
          
          // Преобразование налоговой суммы из центов в основную валюту
          let taxAmountFixed = data.tax.amount || taxAmount;
          if (taxAmountFixed > price * 0.5) {
            console.log('Конвертируем tax.amount из центов в основную валюту:', taxAmountFixed, '→', taxAmountFixed / 100);
            taxAmountFixed = Math.round(taxAmountFixed / 100);
          }
          
          const stripeTax = {
            amount: taxAmountFixed,
            rate: data.tax.rate || taxRate,
            label: data.tax.label || taxLabel,
            display: data.tax.label || `${(taxRate * 100).toFixed(1)}% ${taxLabel} (${user.country})`
          };
          
          setStripeTaxInfo(stripeTax);
          
          // Также обновляем базовую налоговую информацию
          setTaxInfo({
            rate: data.tax.rate || taxRate,
            label: data.tax.label || taxLabel,
            amount: taxAmountFixed
          });
        } else {
          // Если нет налоговой информации от Stripe, используем локальные расчеты
          console.log('No tax information from Stripe, using local calculation');
          
          setStripeTaxInfo({
            amount: taxAmount,
            rate: taxRate,
            label: taxLabel,
            display: `${(taxRate * 100).toFixed(1)}% ${taxLabel} (${user.country || defaultCountry})`
          });
        }
        
        console.log('Payment intent created successfully');
      } catch (error) {
        console.error('Payment initialization error:', error);
        setPaymentIntentError(true);
        
        // Даже при ошибке платежной системы показываем правильную налоговую информацию
        setStripeTaxInfo({
          amount: taxAmount,
          rate: taxRate,
          label: taxLabel,
          display: `${(taxRate * 100).toFixed(1)}% ${taxLabel} (${user?.country || defaultCountry})`
        });
        
        toast({
          title: "Payment Error",
          description: "Could not initialize the payment. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    fetchPaymentIntent();
  }, [productId, user, product, quantity, taxRate, taxLabel, taxAmount, price, defaultCountry, toast]);

  if (!product) {
    return (
      <div>
        <div className="flex items-center mb-4">
          <button 
            className="p-1 mr-2"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-medium">Checkout</h2>
        </div>
        <Card className="p-4">
          <p>Loading product information...</p>
        </Card>
      </div>
    );
  }
  
  // Вычисляем стоимость с учетом количества
  const basePrice = price * quantity;
  const calculatedTaxAmount = taxAmount * quantity;
  const totalPrice = basePrice + calculatedTaxAmount;
  
  // Функция для обновления количества и PaymentIntent
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    
    setIsUpdatingQuantity(true);
    
    try {
      // Сначала обновляем визуально количество
      setQuantity(newQuantity);
      
      // Если пользователь не авторизован или нет ID платежа, просто обновляем UI
      if (!user || !paymentIntentId) {
        console.log('User not authenticated or PaymentIntent ID not available, skipping API call');
        return;
      }
      
      // Вызываем API для обновления PaymentIntent с новым количеством
      try {
        const { amount, taxAmount: updatedTaxAmount } = await updatePaymentIntentQuantity(
          paymentIntentId,
          user.id,
          newQuantity
        );
        
        console.log(`Updated payment intent with new quantity ${newQuantity}:`, {
          amount,
          taxAmount: updatedTaxAmount
        });
        
        // Обновляем информацию о налогах
        if (updatedTaxAmount) {
          setTaxInfo(prev => ({
            ...prev,
            amount: updatedTaxAmount
          }));
        }
        
        toast({
          title: "Quantity updated",
          description: `Quantity changed to ${newQuantity}`,
        });
      } catch (apiError) {
        console.error("Error updating payment intent via API:", apiError);
        // Показываем уведомление, но не сбрасываем количество
        toast({
          title: "Payment update error",
          description: "The payment will be recalculated at checkout.",
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      // Восстанавливаем предыдущее значение в случае ошибки
      setQuantity(1);
      toast({
        title: "Error updating quantity",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingQuantity(false);
    }
  };

  const renderProductInfo = () => {
    // Проверка загрузки продукта
    if (!product) {
      return (
        <Card className="p-4 mb-6">
          <div className="flex items-center mb-4 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded mr-4"></div>
            <div>
              <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="h-10 bg-gray-200 rounded mb-3"></div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded"></div>
            <div className="h-5 bg-gray-200 rounded"></div>
            <div className="h-5 bg-gray-200 rounded"></div>
          </div>
          <div className="text-center mt-4">Loading product information...</div>
        </Card>
      );
    }
    
    return (
      <Card className="p-4 mb-6">
        {isDemoMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-2 mb-4 text-sm text-amber-800">
            <div className="flex items-center space-x-1 font-medium mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <span>Demo Mode</span>
            </div>
            <p>You are testing the checkout process with a demo account.</p>
            <p>No actual payments will be processed.</p>
          </div>
        )}
      
        <div className="flex items-center mb-4">
          <img 
            src={product.imageUrl} 
            alt={product.title}
            className="w-16 h-16 object-cover rounded mr-4"
          />
          <div>
            <h3 className="font-medium flex items-center">
              {product.title}
              {isDemoMode && (
                <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Demo</span>
              )}
            </h3>
            <p className="text-lg">{formatPrice(price, currency, isStripePrice)}</p>
          </div>
        </div>
        
        {/* Селектор количества */}
        <div className="border-b pb-4 mb-3">
          <div className="flex items-center justify-between">
            <label htmlFor="quantity" className="font-medium">Quantity:</label>
            <div className="flex items-center">
              <button 
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isUpdatingQuantity}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 
                          text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                -
              </button>
              <span className="mx-3 font-medium w-6 text-center">{quantity}</span>
              <button 
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= 10 || isUpdatingQuantity}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 
                          text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
          
          {isUpdatingQuantity && (
            <div className="text-center mt-2 text-sm text-blue-600">
              Updating quantity...
            </div>
          )}
        </div>
        
        <div className="border-t border-b py-3 my-3">
          {/* Используем таблицу с явным указанием ширины для лучшего выравнивания */}
          <table className="w-full">
            <tbody>
              <tr className="mb-2">
                <td className="text-left pb-2">Subtotal ({quantity} × {formatPrice(price, currency, isStripePrice)})</td>
                <td className="text-right pb-2">{formatPrice(basePrice, currency, isStripePrice)}</td>
              </tr>
              
              {/* Налоговая информация - всегда отображаем, используя запасные значения */}
              <tr className="mb-2 bg-yellow-50">
                <td className="text-left pb-2 pt-2 font-medium">
                  <span className="flex items-center">
                    {stripeTaxInfo?.display || taxLabel}
                    <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-1 py-0.5 rounded">{user?.country || defaultCountry}</span>
                  </span>
                </td>
                <td className="text-right pb-2 pt-2 font-medium">
                  {formatPrice(calculatedTaxAmount, currency, isStripePrice)}
                </td>
              </tr>
              
              <tr className="mb-2">
                <td className="text-left pb-2">Shipping</td>
                <td className="text-right pb-2">Free</td>
              </tr>
              
              <tr className="font-bold text-lg bg-green-50">
                <td className="text-left pt-2 pb-2 border-t">Total</td>
                <td className="text-right pt-2 pb-2 border-t">
                  {formatPrice(totalPrice, currency, isStripePrice)}
                </td>
              </tr>
            </tbody>
          </table>
          
          {/* Пояснительный текст о налогах */}
          <div className="mt-3 text-xs text-gray-500 p-2 bg-gray-50 rounded-md">
            <div className="font-medium mb-1">Tax Information:</div>
            <div>* VAT is applied according to EU regulations.</div>
            {isDemoMode && (
              <div className="mt-1 text-amber-600">
                * In demo mode, tax calculations are simulated based on country settings.
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };
  
  if (!user) {
    return (
      <div>
        <div className="flex items-center mb-4">
          <button 
            className="p-1 mr-2"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-medium">Checkout</h2>
          
          {isDemoMode && (
            <span className="ml-auto bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
              Demo Mode
            </span>
          )}
        </div>
        
        {/* Отображаем информацию о продукте и налогах */}
        {renderProductInfo()}
        
        <Card className="p-4">
          <p className="text-amber-600 mb-4">Please log in to continue with checkout.</p>
          <div className="space-y-3">
            <button 
              className="bg-blue-600 text-white w-full py-2 rounded-full hover:bg-blue-700"
              onClick={() => setLocation("/account")}
            >
              Go to Account
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <button
              type="button"
              className="bg-amber-500 text-white w-full py-2 rounded-full hover:bg-amber-600"
              onClick={() => {
                // Создаем тестового пользователя в localStorage для демонстрации функциональности
                const demoUser = {
                  id: 99999, // Тестовый ID
                  username: "demouser",
                  email: "demo@example.com",
                  country: "DE", // Используем Германию для демонстрации с налогом
                  accessLevel: 1
                };
                
                // Сохраняем во временное хранилище
                localStorage.setItem("demo_user", JSON.stringify(demoUser));
                
                // Перегружаем страницу, чтобы использовать демо-режим
                window.location.href = `/checkout/${productId}?demo=true`;
              }}
            >
              Test as Demo User
            </button>
            
            <p className="text-xs text-center text-gray-500 mt-2">
              Demo mode provides a simulated checkout experience.
              <br />No registration or login required.
            </p>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <button 
          className="p-1 mr-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-medium">Checkout</h2>
        
        {isDemoMode && (
          <span className="ml-auto bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
            Demo Mode
          </span>
        )}
      </div>
      
      {renderProductInfo()}
      
      <Card className="p-4">
        <h3 className="font-medium mb-4">Payment Information</h3>
        
        {/* Показываем запасной вариант, если Stripe не загрузился или произошла ошибка */}
        {stripeLoadingFailed || paymentIntentError ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 text-red-800 rounded-lg">
              <h4 className="font-semibold mb-2">
                Payment System Temporarily Unavailable
                {isDemoMode && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Demo Mode</span>}
              </h4>
              <p className="mb-3">
                {isDemoMode 
                  ? "In demo mode, the payment system is simulated. You can click 'Retry Payment' to attempt again."
                  : "We're experiencing technical difficulties with our payment processor. Please try again later or use an alternative payment method."
                }
              </p>
              <div className="space-y-2">
                <button 
                  className="bg-gray-700 text-white w-full py-3 rounded-full font-medium hover:bg-gray-800"
                  onClick={() => window.history.back()}
                >
                  Return to Previous Page
                </button>
                <button 
                  className="bg-blue-600 text-white w-full py-3 rounded-full font-medium hover:bg-blue-700"
                  onClick={() => window.location.reload()}
                >
                  Retry Payment
                </button>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-2">Having trouble? Contact our support team:</p>
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-center">support@aething.com</p>
              </div>
            </div>
          </div>
        ) : clientSecret ? (
          <Elements 
            stripe={stripePromise} 
            options={{ 
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#6200EE',
                  fontFamily: 'system-ui, sans-serif',
                  borderRadius: '8px'
                }
              },
              // Конфигурация в соответствии с документацией https://docs.stripe.com/payments/link/mobile-payment-element-link
              // и https://docs.stripe.com/payments/link/set-up-link-with-payment-element
              businessName: "Aething AI Platform",
              // При использовании clientSecret не нужно указывать режим payment и методы оплаты
              // Stripe настроит их автоматически на основе возможностей платежного намерения
              // Настройка кошельков (Google Pay и Apple Pay)
              wallets: {
                apple_pay: 'auto',
                google_pay: 'auto'
              },
              shipping: {
                allowed_countries: ['US', 'CA', 'DE', 'FR', 'GB', 'IT', 'ES'],
                // Цифровые товары, доставки не требуется
                type: 'digital'
              },
              // Добавляем режим отладки для диагностики
              loader: 'always'
            }}
          >
            <CheckoutForm 
              productId={productId as number} 
              amount={price} 
              currency={currency} 
              product={product} 
              stripeTaxInfo={stripeTaxInfo}
              clientSecret={clientSecret}
            />
          </Elements>
        ) : (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </Card>
    </div>
  );
}