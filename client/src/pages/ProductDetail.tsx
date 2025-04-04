import { useRoute, useLocation } from "wouter";
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
// Используем локализованную информацию через контекст

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAppContext();
  const { t, currentLocale } = useLocale();
  const [couponCode, setCouponCode] = useState('');
  
  const productId = match ? parseInt(params.id) : null;
  
  // Используем наш новый хук для загрузки изображения
  const { imageSrc, isLoaded } = useProductImage(productId || 0, null);
  
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  // При монтировании компонента скроллим наверх и добавляем обработчик сохранения позиции
  useEffect(() => {
    // Сначала скроллим страницу наверх для удобства просмотра новой страницы
    scrollToTop(false);
    
    // Сохраняем текущую позицию скролла главной страницы перед уходом
    saveScrollPositionForPath();
    
    // Также добавляем событие перед уходом со страницы для сохранения позиции
    const handleBeforeUnload = () => {
      saveScrollPositionForPath();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  // Функция возврата на главную с сохранением позиции скролла
  const handleGoBack = () => {
    // Сохраняем текущую позицию скролла перед переходом
    saveScrollPositionForPath();
    console.log('[ProductDetail] Сохраняем позицию скролла перед уходом');
    
    // Используем history.back() для корректной работы системы восстановления позиции скролла
    window.history.back();
  };
  
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
            onClick={handleGoBack}
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

  // Получаем локализованные данные продукта и UI
  const localizedInfo = productTranslations[currentLocale]?.[product.id];
  const localizedProduct = localizedInfo || productTranslations['en']?.[product.id] || { 
    title: product.title,
    description: product.description
  };
  
  // Получаем локализованные UI элементы
  const uiText = productUITranslations[currentLocale] || productUITranslations['en'];
  
  // Отладочная информация
  console.log("Product debug:", {
    id: product.id,
    title: product.title,
    localizedTitle: localizedProduct.title,
    price: product.price,
    priceEUR: product.priceEUR,
    hasStripeId: !!product.stripeProductId,
    formattedPrice: formatPrice(
      getPriceForCountry(product, user?.country),
      getCurrencyForCountry(user?.country),
      !!product.stripeProductId
    )
  });
  
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
    <SwipeBack onSwipeBack={handleGoBack}>
      <div>
        <div className="flex items-center mb-4">
          <button 
            className="p-1 mr-2"
            onClick={handleGoBack}
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
        <div className="mb-4">
          <div className="h-64 bg-surface mb-1 rounded-lg overflow-hidden relative">
            {/* Placeholder/skeleton во время загрузки */}
            {!imageSrc && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse rounded-md bg-gray-200 h-full w-full"></div>
              </div>
            )}
            
            {/* Отображаем изображение, если оно загружено */}
            {imageSrc && (
              <img 
                src={imageSrc}
                alt={localizedProduct.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Если не удалось загрузить изображение по URL, используем локальное изображение
                  const fallbackImage = getProductImage(product.id);
                  if (e.currentTarget.src !== fallbackImage) {
                    e.currentTarget.src = fallbackImage;
                  }
                }}
              />
            )}
          </div>
          <p className="text-xs text-gray-500 italic text-center">
            {uiText.imageDisclaimer}
          </p>
        </div>
        
        {/* Title, Coupon and Buy Button */}
        <div className="mb-6">
          <h1 className="font-medium text-xl mb-3">{localizedProduct.title}</h1>
          
          {/* Price and Buy Button in one row */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">
              {formatPrice(
                getPriceForCountry(product, user?.country), 
                getCurrencyForCountry(user?.country),
                !!product.stripeProductId
              )}
              {product.stripeProductId && (
                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Stripe
                </span>
              )}
            </span>
            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700"
              onClick={handleBuyNow}
            >
              {t('buyNow')}
            </button>
          </div>
          
          {/* Coupon Field */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder={uiText.enterCouponCode}
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* Hardware & Software Tabs */}
          <Tabs defaultValue="hardware" className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="hardware" className="flex items-center">
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                  <rect x="9" y="9" width="6" height="6"></rect>
                  <line x1="9" y1="2" x2="9" y2="4"></line>
                  <line x1="15" y1="2" x2="15" y2="4"></line>
                  <line x1="9" y1="20" x2="9" y2="22"></line>
                  <line x1="15" y1="20" x2="15" y2="22"></line>
                  <line x1="20" y1="9" x2="22" y2="9"></line>
                  <line x1="20" y1="14" x2="22" y2="14"></line>
                  <line x1="2" y1="9" x2="4" y2="9"></line>
                  <line x1="2" y1="14" x2="4" y2="14"></line>
                </svg>
                {localizedProduct.hardwareTabLabel || uiText.hardwareTab}
              </TabsTrigger>
              <TabsTrigger value="software" className="flex items-center">
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                {localizedProduct.softwareTabLabel || uiText.softwareTab}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="hardware" className="p-0">
              {product.hardwareInfo ? (
                <div className="space-y-6">
                  <div className="bg-blue-50/15 rounded-lg p-4 border-l-2 border-blue-400">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">{localizedProduct.hardwareSpecsLabel || uiText.hardwareSpecsHeading}</h3>
                    <div className="space-y-4 text-gray-800">
                      {product.hardwareInfo && product.hardwareInfo.split('. ').map((paragraph, index) => (
                        paragraph.trim() && (
                          <p key={index} className="text-gray-700">
                            {paragraph.trim() + (paragraph.endsWith('.') ? '' : '.')}
                          </p>
                        )
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border-l-2 border-gray-400">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">{localizedProduct.aiCapabilitiesLabel || uiText.aiCapabilitiesHeading}</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-200 rounded-md p-1 text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="12" y1="20" x2="12" y2="20"/></svg>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{uiText.aiPerformance}:</span>
                          <p className="text-gray-700">{uiText.aiPerformanceDesc}</p>
                        </div>
                      </div>
                      
                      {uiText.generativeAI && (
                        <div className="flex items-start gap-3">
                          <div className="bg-gray-200 rounded-md p-1 text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{uiText.generativeAI}:</span>
                            <p className="text-gray-700">{uiText.generativeAIDesc}</p>
                          </div>
                        </div>
                      )}
                      
                      {uiText.energyEfficiency && (
                        <div className="flex items-start gap-3">
                          <div className="bg-gray-200 rounded-md p-1 text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{uiText.energyEfficiency}:</span>
                            <p className="text-gray-700">{uiText.energyEfficiencyDesc}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-200 rounded-md p-1 text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 5-10 8.5c-.14.12-.08.35.12.35l15.08-.05c.38 0 .55-.48.33-.75L14.25 5.05a.2.2 0 0 0-.25-.05Z"/><path d="m5 6 14 6"/><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/></svg>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{uiText.softwareStack}:</span>
                          <p className="text-gray-700">{uiText.softwareStackDesc}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-200 rounded-md p-1 text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m8 12 3 3 5-5"/></svg>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{uiText.applications}:</span>
                          <p className="text-gray-700">{uiText.applicationsDesc}</p>
                        </div>
                      </div>
                      
                      {uiText.features && (
                        <div className="flex items-start gap-3">
                          <div className="bg-gray-200 rounded-md p-1 text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{uiText.features}:</span>
                            <p className="text-gray-700">{uiText.featuresDesc}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-4">
                  No hardware information available
                </div>
              )}
            </TabsContent>
              <TabsContent value="software" className="p-0">
                {product.softwareInfo ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50/15 rounded-lg p-4 border-l-2 border-gray-400">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">{localizedProduct.softwareArchitectureLabel || uiText.softwareArchitectureHeading}</h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="bg-white rounded-lg shadow-sm p-3 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 flex items-center justify-center bg-emerald-100 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="8" y1="20" x2="8.01" y2="20"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="12" y1="22" x2="12.01" y2="22"/><line x1="16" y1="16" x2="16.01" y2="16"/><line x1="16" y1="20" x2="16.01" y2="20"/></svg>
                            </div>
                            <span className="font-medium">{uiText.cloudIntegration}</span>
                          </div>
                          <p className="text-sm text-gray-600">{uiText.cloudIntegrationDesc}</p>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm p-3 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 flex items-center justify-center bg-emerald-100 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                            </div>
                            <span className="font-medium">{uiText.dataPipelines}</span>
                          </div>
                          <p className="text-sm text-gray-600">{uiText.dataPipelinesDesc}</p>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm p-3 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 flex items-center justify-center bg-emerald-100 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                            </div>
                            <span className="font-medium">{uiText.softwareStack}</span>
                          </div>
                          <p className="text-sm text-gray-600">{uiText.softwareStackDesc}</p>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm p-3 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 flex items-center justify-center bg-emerald-100 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                            </div>
                            <span className="font-medium">{uiText.apiIntegration}</span>
                          </div>
                          <p className="text-sm text-gray-600">{uiText.apiIntegrationDesc}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50/15 rounded-lg p-4 border-l-2 border-gray-400">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">{uiText.aiPerformance}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Deep Learning</h4>
                          <ul className="space-y-1 text-sm">
                            <li className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M5 12l5 5l10 -10"/></svg>
                              <span>PyTorch 2.0+</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M5 12l5 5l10 -10"/></svg>
                              <span>TensorFlow 2.12+</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M5 12l5 5l10 -10"/></svg>
                              <span>ONNX Runtime</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M5 12l5 5l10 -10"/></svg>
                              <span>JAX</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Machine Learning</h4>
                          <ul className="space-y-1 text-sm">
                            <li className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M5 12l5 5l10 -10"/></svg>
                              <span>scikit-learn</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M5 12l5 5l10 -10"/></svg>
                              <span>XGBoost</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M5 12l5 5l10 -10"/></svg>
                              <span>LightGBM</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M5 12l5 5l10 -10"/></svg>
                              <span>Spark ML</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50/15 rounded-lg p-4 border-l-2 border-gray-400">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">{uiText.edgeComputing}</h3>
                      <div className="text-gray-700 mb-4">
                        {product.softwareInfo?.replace(/e\.\s*g\.\s*/g, 'e.g. ')
                          .split(/(?<=\.)\s+(?=[A-Z•])/)
                          .map((paragraph, index) => (
                            paragraph.trim() && 
                            <p key={index} className="mb-2">{paragraph.trim()}</p>
                          ))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        <div className="bg-white rounded p-3 shadow-sm border border-gray-200">
                          <h4 className="font-medium flex items-center gap-2 text-gray-800 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/><path d="M9 17h6"/><path d="M9 13h6"/></svg>
                            Model Optimization
                          </h4>
                          <p className="text-sm text-gray-600">TensorRT, TF-TRT, and OpenVINO support with INT8 quantization and weight pruning</p>
                        </div>
                        
                        <div className="bg-white rounded p-3 shadow-sm border border-gray-200">
                          <h4 className="font-medium flex items-center gap-2 text-gray-800 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M13 2L3 14h9l-1 8L21 10h-9l1-8z"/></svg>
                            Real-time Processing
                          </h4>
                          <p className="text-sm text-gray-600">Process data streams with latency as low as 15ms for real-time applications</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    {uiText.noSoftwareInfo}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Секция "Learn More" (если есть) */}
            {localizedProduct.learnMoreTitle && localizedProduct.learnMoreContent && (
              <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">
                  {localizedProduct.learnMoreTitle}
                </h3>
                <p className="text-gray-700">
                  {localizedProduct.learnMoreContent}
                </p>
              </div>
            )}
          
        </div>
      </div>
    </SwipeBack>
  );
}