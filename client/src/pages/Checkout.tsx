import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import stripePromise from "@/lib/stripe";

const CheckoutForm = ({ productId, amount }: { productId: number; amount: number }) => {
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
        className="bg-primary text-white w-full py-3 rounded-full font-medium disabled:opacity-70"
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
  
  const productId = match ? parseInt(params.id) : null;
  
  const { data: product } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  useEffect(() => {
    const getPaymentIntent = async () => {
      if (!productId || !user || !product) return;
      
      try {
        const response = await apiRequest("POST", "/api/create-payment-intent", {
          amount: product.price,
          userId: user.id,
          productId: productId
        });
        
        const data = await response.json();
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
            className="bg-primary text-white w-full py-2 rounded"
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
          className="material-icons mr-2"
          onClick={() => setLocation(`/product/${productId}`)}
        >
          arrow_back
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
            <p className="text-lg">${(product.price / 100).toFixed(2)}</p>
          </div>
        </div>
        
        <div className="border-t border-b py-3 my-3">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>${(product.price / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${(product.price / 100).toFixed(2)}</span>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <h3 className="font-medium mb-4">Payment Information</h3>
        {clientSecret ? (
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
            <CheckoutForm productId={productId || 0} amount={product.price} />
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
