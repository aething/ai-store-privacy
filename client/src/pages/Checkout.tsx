import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { useEffect, useState } from "react";
import stripePromise, { createPaymentIntent } from "@/lib/stripe";
import { formatPrice, getCurrencyForCountry, getPriceForCountry } from "@/lib/currency";
import { apiRequest } from "@/lib/queryClient";
import type { Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { TaxDisplayBoxSimple } from "@/components/TaxDisplayBoxSimple";

const CheckoutForm = ({ productId, amount, currency }: { productId: number; amount: number; currency: 'usd' | 'eur' }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !user) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/confirmation",
        },
      });
      
      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Payment succeeded, redirect will happen automatically
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred during payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
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
  const { user } = useAppContext();
  const [clientSecret, setClientSecret] = useState("");
  const [stripeLoadingFailed, setStripeLoadingFailed] = useState(false);
  const [paymentIntentError, setPaymentIntentError] = useState(false);
  const [taxInfo, setTaxInfo] = useState<{rate: number; label: string; amount: number}>({ rate: 0, label: 'Tax', amount: 0 });
  const [stripeTaxInfo, setStripeTaxInfo] = useState<{amount: number; rate: number; label: string; display: string} | null>(null);
  
  const productId = match ? parseInt(params.id) : null;
  
  const { data: product } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  // Determine currency and price based on user's country
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

  useEffect(() => {
    const getPaymentIntent = async () => {
      if (!productId || !user || !product) return;
      
      try {
        // Use our helper function to create a payment intent
        const data = await createPaymentIntent(
          productId, 
          user.id, 
          user.country
        );
        
        setClientSecret(data.clientSecret);
        setPaymentIntentError(false);
        
        // Сохраняем информацию о налогах, полученную от Stripe
        console.log('Получены данные из API:', data);
        if (data.tax) {
          console.log('Получена налоговая информация от Stripe:', data.tax);
          setStripeTaxInfo({
            amount: data.tax.amount || 0,
            rate: data.tax.rate || 0,
            label: data.tax.label || 'Tax',
            display: data.tax.label || 'Tax'
          });
          
          // Устанавливаем информацию о налогах также в обычный state
          setTaxInfo({
            rate: data.tax.rate || DEFAULT_TAX_RATE,
            label: data.tax.label || DEFAULT_TAX_LABEL,
            amount: data.tax.amount || Math.round(price * DEFAULT_TAX_RATE),
          });
          
          console.log('Tax information updated:', {
            stripeTaxInfo: {
              amount: data.tax.amount || 0,
              rate: data.tax.rate || 0,
              label: data.tax.label || 'Tax',
              display: data.tax.label || 'Tax'
            }
          });
        } else {
          // Если нет налоговой информации от Stripe, используем наши расчеты
          const country = user?.country || defaultCountry;
          const { rate, label } = calculateTaxRate(country);
          const amount = rate > 0 ? Math.round(price * rate) : 0;
          
          console.log('Using local tax calculation:', { rate, label, amount });
          
          // Обновляем оба state для согласованности данных
          setTaxInfo({ rate, label, amount });
          setStripeTaxInfo({
            amount: amount,
            rate: rate,
            label: label,
            display: label
          });
        }
      } catch (error) {
        setPaymentIntentError(true);
        toast({
          title: "Payment System Error",
          description: "Could not initialize payment. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    getPaymentIntent();
  }, [productId, user, product, toast]);
  
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
  
  // Мы модифицируем эту логику, чтобы показывать информацию о товаре и налогах
  // даже если пользователь не авторизован, но при этом блокировать процесс оплаты
  
  const renderProductInfo = () => (
    <Card className="p-4 mb-6">
      <div className="flex items-center mb-4">
        <img 
          src={product.imageUrl} 
          alt={product.title}
          className="w-16 h-16 object-cover rounded mr-4"
        />
        <div>
          <h3 className="font-medium">{product.title}</h3>
          <p className="text-lg">{formatPrice(price, currency, isStripePrice)}</p>
        </div>
      </div>
      
      <div className="border-t border-b py-3 my-3">
        {/* Используем таблицу с явным указанием ширины для лучшего выравнивания */}
        <table className="w-full">
          <tbody>
            <tr className="mb-2">
              <td className="text-left pb-2">Subtotal</td>
              <td className="text-right pb-2">{formatPrice(price, currency, isStripePrice)}</td>
            </tr>
            
            {/* Налоговая информация - всегда отображаем, используя запасные значения */}
            <tr className="mb-2 bg-yellow-50">
              <td className="text-left pb-2 pt-2 font-medium">
                <span className="flex items-center">
                  {taxLabel}
                  <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-1 py-0.5 rounded">{defaultCountry}</span>
                </span>
              </td>
              <td className="text-right pb-2 pt-2 font-medium">
                {formatPrice(taxAmount, currency, isStripePrice)}
              </td>
            </tr>
            
            {/* Добавляем строку с пояснением о налогах */}
            <tr className="mb-2 bg-blue-50">
              <td colSpan={2} className="text-left pb-2 pt-2 px-2 text-xs text-blue-600 italic rounded">
                {"* Prices exclude VAT (19%), which is added at checkout"}
              </td>
            </tr>
            
            <tr className="mb-2">
              <td className="text-left pb-2">Shipping</td>
              <td className="text-right pb-2">Free</td>
            </tr>
            
            <tr className="font-bold text-lg bg-green-50">
              <td className="text-left pt-2 pb-2 border-t">Total</td>
              <td className="text-right pt-2 pb-2 border-t">
                {formatPrice(price + taxAmount, currency, isStripePrice)}
              </td>
            </tr>
          </tbody>
        </table>
        
        {/* Используем компонент TaxDisplayBoxSimple для отображения информации о налоге */}
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium mb-2 flex items-center">
            <AlertTriangle size={16} className="mr-2 text-amber-500" />
            Tax Calculation Details:
          </h4>
          <TaxDisplayBoxSimple 
            tax={{
              rate: taxRate,
              label: taxLabel,
              amount: taxAmount,
              display: `${(taxRate * 100).toFixed(1)}% ${taxLabel} (${defaultCountry})`
            }}
            subtotal={price}
            currency={currency}
            showDetails={true}
            className="shadow-sm"
          />
        </div>
        
        {/* Пояснительный текст о налогах */}
        <div className="mt-3 text-xs text-gray-500 p-2 bg-gray-50 rounded-md">
          <div className="font-medium mb-1">Tax Information:</div>
          <div>* Prices exclude 19% German VAT (MwSt.), which is added at checkout.</div>
          <div>* VAT ID: DE123456789</div>
        </div>
      </div>
    </Card>
  );
  
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
        </div>
        
        {/* Отображаем информацию о продукте и налогах */}
        {renderProductInfo()}
        
        <Card className="p-4">
          <p className="text-error mb-4">Please log in to continue with checkout.</p>
          <button 
            className="bg-blue-600 text-white w-full py-2 rounded-full hover:bg-blue-700"
            onClick={() => setLocation("/account")}
          >
            Go to Account
          </button>
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
      </div>
      
      <Card className="p-4 mb-6">
        <div className="flex items-center mb-4">
          <img 
            src={product.imageUrl} 
            alt={product.title}
            className="w-16 h-16 object-cover rounded mr-4"
          />
          <div>
            <h3 className="font-medium">{product.title}</h3>
            <p className="text-lg">{formatPrice(price, currency, isStripePrice)}</p>
          </div>
        </div>
        
        <div className="border-t border-b py-3 my-3">
          {/* Используем таблицу с явным указанием ширины для лучшего выравнивания */}
          <table className="w-full">
            <tbody>
              <tr className="mb-2">
                <td className="text-left pb-2">Subtotal</td>
                <td className="text-right pb-2">{formatPrice(price, currency, isStripePrice)}</td>
              </tr>
              
              {/* Налоговая информация - всегда отображаем, независимо от состояния 
                  Мы гарантированно показываем строку с налогом, даже если произошли ошибки */}
              <tr className="mb-2 bg-yellow-50">
                <td className="text-left pb-2 pt-2 font-medium">
                  <span className="flex items-center">
                    {stripeTaxInfo?.display || taxLabel || "VAT 19%"}
                    <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-1 py-0.5 rounded">{user?.country || 'DE'}</span>
                  </span>
                </td>
                <td className="text-right pb-2 pt-2 font-medium">
                  {stripeTaxInfo 
                    ? formatPrice(stripeTaxInfo.amount, currency, true) 
                    : formatPrice(taxAmount || Math.round(price * 0.19), currency, isStripePrice)}
                </td>
              </tr>
              
              {/* Дополнительная строка с налогом для диагностики - будет отображаться всегда */}
              <tr className="mb-2 bg-green-50 border-t border-b border-dashed border-green-300">
                <td className="text-left pb-2 pt-2 text-green-700">
                  <span className="flex items-center">
                    <strong>Tax Display Check:</strong>
                  </span>
                </td>
                <td className="text-right pb-2 pt-2 font-medium text-green-700">
                  {formatPrice(Math.round(price * 0.19), currency, isStripePrice)}
                </td>
              </tr>
              
              {/* Добавляем строку с пояснением о налогах */}
              <tr className="mb-2 bg-blue-50">
                <td colSpan={2} className="text-left pb-2 pt-2 px-2 text-xs text-blue-600 italic rounded">
                  {user?.country === 'DE' 
                    ? "* Prices exclude VAT (19%), which is added at checkout" 
                    : user?.country === 'US'
                      ? "* No sales tax is applied (nexus thresholds not reached)"
                      : "* Tax rates are calculated based on your location"}
                </td>
              </tr>
              
              <tr className="mb-2">
                <td className="text-left pb-2">Shipping</td>
                <td className="text-right pb-2">Free</td>
              </tr>
              
              <tr className="font-bold text-lg bg-green-50">
                <td className="text-left pt-2 pb-2 border-t">Total</td>
                <td className="text-right pt-2 pb-2 border-t">
                  {stripeTaxInfo 
                    ? formatPrice(price + stripeTaxInfo.amount, currency, true) 
                    : formatPrice(price + (taxAmount || Math.round(price * 0.19)), currency, isStripePrice)}
                </td>
              </tr>
            </tbody>
          </table>
          
          {/* Используем компонент TaxDisplayBoxSimple для отображения информации о налоге */}
          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium mb-2 flex items-center">
              <AlertTriangle size={16} className="mr-2 text-amber-500" />
              Tax Calculation Details:
            </h4>
            <TaxDisplayBoxSimple 
              tax={{
                rate: stripeTaxInfo?.rate || taxRate,
                label: stripeTaxInfo?.display || taxLabel,
                amount: stripeTaxInfo?.amount || taxAmount,
                display: `${((stripeTaxInfo?.rate || taxRate) * 100).toFixed(1)}% ${stripeTaxInfo?.label || taxLabel} (${user?.country || defaultCountry})`
              }}
              subtotal={price}
              currency={currency}
              showDetails={true}
              className="shadow-sm"
            />
          </div>
          
          {/* Пояснительный текст о налогах */}
          <div className="mt-3 text-xs text-gray-500 p-2 bg-gray-50 rounded-md">
            {user?.country === 'DE' ? (
              <>
                <div className="font-medium mb-1">Tax Information:</div>
                <div>* Prices exclude 19% German VAT (MwSt.), which is added at checkout.</div>
                <div>* VAT ID: DE123456789</div>
              </>
            ) : user?.country === 'US' ? (
              <>
                <div className="font-medium mb-1">Tax Information:</div>
                <div>* No sales tax is applied as nexus thresholds have not been reached.</div>
                <div>* Sales will be tracked for future tax compliance.</div>
              </>
            ) : (
              <>
                <div className="font-medium mb-1">Tax Information:</div>
                <div>* Tax calculation is based on your country's regulations.</div>
                <div>* Complete tax details will be shown on your invoice.</div>
              </>
            )}
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <h3 className="font-medium mb-4">Payment Information</h3>
        
        {/* Показываем запасной вариант, если Stripe не загрузился или произошла ошибка */}
        {stripeLoadingFailed || paymentIntentError ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 text-red-800 rounded-lg">
              <h4 className="font-semibold mb-2">Payment System Temporarily Unavailable</h4>
              <p className="mb-3">We're experiencing technical difficulties with our payment processor. Please try again later or use an alternative payment method.</p>
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
                <p className="text-center">support@yourdomain.com</p>
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
                }
              }
            }}
          >
            <CheckoutForm productId={productId as number} amount={price} currency={currency} />
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
