import { useRoute, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, getCurrencyForCountry, getPriceForCountry } from "@/lib/currency";
import SwipeBack from "@/components/SwipeBack";
import { useLocale } from "@/context/LocaleContext";
import productTranslations from "@/locales/products";
import productUITranslations from "@/locales/products/ui";
import { ArrowLeft, Monitor, Cpu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProductImage } from "@/hooks/useProductImage";
import { getProductImage } from "@/lib/imagePreloader";
import { scrollToTop, saveScrollPositionForPath } from "@/lib/scrollUtils";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAppContext();
  const { t, currentLocale } = useLocale();
  const [couponCode, setCouponCode] = useState('');
  
  const productId = match ? parseInt(params.id) : null;
  
  const { imageSrc, isLoaded } = useProductImage(productId || 0, null);
  
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  useEffect(() => {
    scrollToTop(false);
    saveScrollPositionForPath();
    
    const handleBeforeUnload = () => {
      saveScrollPositionForPath();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  const handleGoBack = () => {
    saveScrollPositionForPath();
    window.history.back();
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (error || !product) {
    return <div>Error loading product details</div>;
  }

  // Получаем локализованные данные продукта и UI
  const localizedInfo = productTranslations[currentLocale]?.[product.id];
  const englishFallback = productTranslations['en']?.[product.id];
  const localizedProduct = localizedInfo || englishFallback || { 
    title: product.title,
    description: product.description,
    features: [],
    specifications: {},
    learnMoreTitle: '',
    learnMoreContent: ''
  };
  
  // Получаем локализованные UI элементы
  const uiText = productUITranslations[currentLocale] || productUITranslations['en'];
  
  const handleBuyNow = () => {
    setLocation(`/checkout/${product.id}`);
  };

  return (
    <SwipeBack onSwipeBack={handleGoBack}>
      <div>
        <div className="flex items-center mb-4">
          <button onClick={handleGoBack}>
            <ArrowLeft size={24} />
          </button>
          <h2>Product Details</h2>
        </div>
        
        <div>
          <h1>{localizedProduct.title}</h1>
          <button onClick={handleBuyNow}>
            {t('buyNow')}
          </button>
          
          <Tabs defaultValue="hardware" className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="hardware">{uiText.hardwareTab}</TabsTrigger>
              <TabsTrigger value="software">{uiText.softwareTab}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="hardware" className="p-0">
              {product.hardwareInfo ? (
                <div>Hardware info goes here</div>
              ) : (
                <div>{uiText.noHardwareInfo}</div>
              )}
            </TabsContent>
            
            <TabsContent value="software" className="p-0">
              {product.softwareInfo ? (
                <div>Software info goes here</div>
              ) : (
                <div>{uiText.noSoftwareInfo}</div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Learn More section */}
          {localizedProduct && localizedProduct.learnMoreTitle && localizedProduct.learnMoreContent && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-4">{t('learnMore')}</h3>
              <div className="prose prose-sm max-w-none">
                <h4>{localizedProduct.learnMoreTitle}</h4>
                <p>{localizedProduct.learnMoreContent}</p>
                <Link to={`/info/${product.id - 1}`}>
                  {t('readMore')} →
                </Link>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </SwipeBack>
  );
}
