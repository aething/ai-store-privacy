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
// Используем импорт типа, а не значения
import type { Stripe } from "@stripe/stripe-js";

const CheckoutForm = ({ productId, amount, currency }: { productId: number; amount: number; currency: 'usd' | 'eur' }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Проверяем состояние Stripe при монтировании компонента
  useEffect(() => {
    if (!stripe) {
      console.warn("Stripe.js hasn't loaded yet.");
    }
  }, [stripe]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Сбрасываем предыдущие ошибки
    setPaymentError(null);
    
    if (!stripe || !elements || !user) {
      setPaymentError(!stripe 
        ? "Payment system not available. Please refresh the page."
        : !elements 
          ? "Payment form not initialized correctly."
          : "Please log in to continue.");
      
      toast({
        title: "Payment Error",
        description: !stripe 
          ? "Payment system not available. Please refresh the page."
          : !elements 
            ? "Payment form not initialized correctly."
            : "Please log in to continue.",
        variant: "destructive",
      });
      
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Проверяем валидность формы перед отправкой
      const { error: validationError } = await elements.submit();
      
      if (validationError) {
        setPaymentError(`Validation failed: ${validationError.message}`);
        toast({
          title: "Form Validation Error",
          description: validationError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/confirmation",
          payment_method_data: {
            billing_details: {
              email: user.email || undefined,
              name: user.name || user.username || undefined,
            }
          }
        },
      });
      
      if (error) {
        console.error("Payment error:", error);
        setPaymentError(error.message || "Payment failed");
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Payment succeeded, redirect will happen automatically
        toast({
          title: "Processing Payment",
          description: "Your payment is being processed...",
        });
      }
    } catch (err: any) {
      console.error("Unexpected payment error:", err);
      const errorMessage = err?.message || "An unexpected error occurred during payment";
      setPaymentError(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Анимация для кнопки оплаты
  const buttonClasses = `
    bg-blue-600 text-white w-full py-3 rounded-full font-medium 
    hover:bg-blue-700 disabled:opacity-70 transition-all duration-300
    md-btn-effect touch-ripple
  `;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-scale">
      {paymentError && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg mb-4 animate-shake">
          <p className="text-sm">{paymentError}</p>
        </div>
      )}
      
      <PaymentElement className="md-input-effect" />
      
      <div className="mt-4">
        <button 
          type="submit"
          disabled={!stripe || isLoading}
          className={buttonClasses}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : "Pay Now"}
        </button>
      </div>
      
      <div className="text-xs text-gray-500 mt-4">
        <p>Your payment information is securely processed by Stripe.</p>
      </div>
    </form>
  );
};

export default function Checkout() {
  const [match, params] = useRoute("/checkout/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAppContext();
  const [clientSecret, setClientSecret] = useState("");
  
  const productId = match ? parseInt(params.id) : null;
  
  const { data: product } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  // Determine currency and price based on user's country
  const currency = getCurrencyForCountry(user?.country);
  const price = product ? getPriceForCountry(product, user?.country) : 0;
  
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
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not initialize payment",
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
            className="material-icons mr-2"
            onClick={() => setLocation("/")}
          >
            arrow_back
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
            className="material-icons mr-2"
            onClick={() => setLocation("/")}
          >
            arrow_back
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
  
  // Отслеживание ошибок Stripe
  const [stripeError, setStripeError] = useState<string | null>(null);
  
  // Обработчик повторной попытки загрузки Stripe
  const handleRetryStripe = () => {
    setStripeError(null);
    // Перезагрузка страницы для повторной инициализации Stripe
    window.location.reload();
  };
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <button 
          className="material-icons mr-2"
          onClick={() => setLocation(`/product/${productId}`)}
        >
          arrow_back
        </button>
        <h2 className="text-lg font-medium">Checkout</h2>
      </div>
      
      <Card className="p-4 mb-6 md-card-hover">
        <div className="flex items-center mb-4">
          <img 
            src={product.imageUrl} 
            alt={product.title}
            className="w-16 h-16 object-cover rounded mr-4 hover-expand"
          />
          <div>
            <h3 className="font-medium">{product.title}</h3>
            <p className="text-lg">{formatPrice(price, currency)}</p>
          </div>
        </div>
        
        <div className="border-t border-b py-3 my-3">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>{formatPrice(price, currency)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(price, currency)}</span>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <h3 className="font-medium mb-4">Payment Information</h3>
        
        {stripeError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            <p className="font-medium">Error loading Stripe</p>
            <p className="text-sm mb-2">{stripeError}</p>
            <button 
              onClick={handleRetryStripe}
              className="bg-red-600 text-white px-4 py-1 rounded-full text-sm hover:bg-red-700 md-btn-effect"
            >
              Retry
            </button>
          </div>
        )}
        
        {!stripeError && clientSecret ? (
          <div className="relative animate-fade-scale">
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
              <CheckoutForm 
                productId={productId as number} 
                amount={price} 
                currency={currency} 
              />
            </Elements>
            
            {/* Обработка ошибок при инициализации Stripe */}
            <div className="mt-4 text-gray-500 text-sm">
              <p>If you experience any issues with payment, please try refreshing the page or contact support.</p>
            </div>
          </div>
        ) : !stripeError ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3"></div>
            <p className="text-gray-600">Initializing payment system...</p>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
