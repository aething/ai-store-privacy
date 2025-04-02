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
import { ArrowLeft } from "lucide-react";

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
  
  const productId = match ? parseInt(params.id) : null;
  
  const { data: product } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  // Determine currency and price based on user's country
  const currency = getCurrencyForCountry(user?.country);
  const price = product ? getPriceForCountry(product, user?.country) : 0;
  
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
  
  // Вычисляем информацию о налоге при изменении цены или страны пользователя
  useEffect(() => {
    if (!user?.country || !price) return;
    
    const { rate, label } = calculateTaxRate(user.country);
    console.log(`Tax calculation for ${user.country}: rate=${rate}, label=${label}`);
    
    // Даже если ставка 0, мы всё равно покажем информацию (например, "No Sales Tax" для США)
    const amount = rate > 0 ? Math.round(price * rate) : 0;
    setTaxInfo({ rate, label, amount });
  }, [user?.country, price]);

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
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>{formatPrice(taxInfo.rate > 0 ? price - taxInfo.amount : price, currency, isStripePrice)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>{taxInfo?.label || 'Tax'}</span>
            <span>{formatPrice(taxInfo?.amount || 0, currency, isStripePrice)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(price, currency, isStripePrice)}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {taxInfo && taxInfo.rate > 0 
              ? `* Prices include ${taxInfo.label} according to ${user?.country} tax regulations` 
              : `* No tax applied for ${user?.country} according to current regulations`
            }
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
