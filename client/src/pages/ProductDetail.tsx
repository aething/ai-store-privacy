import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, getCurrencyForCountry, getPriceForCountry } from "@/lib/currency";
import SwipeBack from "@/components/SwipeBack";
import { useLocale } from "@/context/LocaleContext";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAppContext();
  const { t } = useLocale();
  const [couponCode, setCouponCode] = useState('');
  
  const productId = match ? parseInt(params.id) : null;
  
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center mb-4">
          <div className="h-6 w-6 bg-gray-200 rounded-full mr-2"></div>
          <div className="h-6 w-40 bg-gray-200 rounded"></div>
        </div>
        <div className="rounded-lg overflow-hidden bg-gray-200 h-72 mb-6"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div>
        <div className="flex items-center mb-4">
          <button 
            className="p-1 mr-2"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-medium">Product Details</h2>
        </div>
        <Card className="p-4">
          <p className="text-error">Error loading product details</p>
        </Card>
      </div>
    );
  }
  
  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Account Required",
        description: "Please create an account or log in to make a purchase.",
        variant: "destructive",
      });
      return;
    }
    
    // Сохраняем купон в localStorage для использования на странице оформления заказа
    if (couponCode.trim()) {
      localStorage.setItem('currentCouponCode', couponCode.trim());
      toast({
        title: "Coupon Applied",
        description: `Coupon code "${couponCode}" will be applied to your order.`,
        variant: "default",
      });
    } else {
      localStorage.removeItem('currentCouponCode');
    }
    
    setLocation(`/checkout/${product.id}`);
  };
  
  return (
    <SwipeBack onSwipeBack={() => setLocation("/")}>
      <div>
        <div className="flex items-center mb-4">
          <button 
            className="p-1 mr-2"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-medium">Product Details</h2>
        </div>
        
        {/* Подсказка для свайпа */}
        <div className="text-gray-400 text-xs text-center py-1 mb-2 border-y flex items-center justify-center">
          <ArrowLeft size={14} className="mr-1" />
          {t("swipeRightToGoBack")}
        </div>
        
        {/* Image Section */}
        <div className="h-64 bg-surface mb-4 rounded-lg overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Title, Coupon and Buy Button */}
        <div className="mb-6">
          <h1 className="font-medium text-xl mb-3">{product.title}</h1>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">
              {formatPrice(getPriceForCountry(product, user?.country), getCurrencyForCountry(user?.country))}
            </span>
          </div>
          
          {/* Coupon Field */}
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Enter coupon code (optional)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-grow"
              />
              <button 
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <Card className="rounded-lg p-4 bg-white mb-6">
          <h2 className="font-medium text-lg mb-3">Description</h2>
          <p className="text-text-secondary">{product.description}</p>
        </Card>
        
        {/* Features */}
        <Card className="rounded-lg p-4 bg-white mb-6">
          <h2 className="font-medium text-lg mb-3">Features</h2>
          <ul className="list-disc list-inside text-text-secondary">
            {product.features.map((feature, index) => (
              <li key={index} className="mb-2">{feature}</li>
            ))}
          </ul>
        </Card>
        
        {/* Specifications */}
        <Card className="rounded-lg p-4 bg-white mb-6">
          <h2 className="font-medium text-lg mb-3">Specifications</h2>
          <table className="w-full">
            <tbody>
              {product.specifications.map((spec, index) => {
                const [label, value] = spec.split(": ");
                return (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="py-2 px-3 text-text-secondary">{label}</td>
                    <td className="py-2 px-3">{value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </SwipeBack>
  );
}
