import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, getCurrencyForCountry, getPriceForCountry } from "@/lib/currency";
import SwipeBack from "@/components/SwipeBack";
import { useLocale } from "@/context/LocaleContext";
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
  const { t } = useLocale();
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
    saveScrollPositionForPath('/');
    
    // Также добавляем событие перед уходом со страницы для сохранения позиции
    const handleBeforeUnload = () => {
      saveScrollPositionForPath('/');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  // Функция возврата на главную с сохранением позиции скролла
  const handleGoBack = () => {
    // Сохраняем текущую позицию скролла перед переходом
    saveScrollPositionForPath('/product/' + productId);
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

  // Отладочная информация
  console.log("Product debug:", {
    id: product.id,
    title: product.title,
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
                alt={product.title} 
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
            Images are for illustration purposes only. Refer to the description for full specifications.
          </p>
        </div>
        
        {/* Title, Coupon and Buy Button */}
        <div className="mb-6">
          <h1 className="font-medium text-xl mb-3">{product.title}</h1>
          
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
                  Stripe Price
                </span>
              )}
            </span>
            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
          </div>
          
          {/* Coupon Field */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Enter coupon code (optional)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* Hardware & Software Tabs */}
          <Card className="rounded-lg p-4 bg-white mb-6">
            <Tabs defaultValue="hardware" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="hardware" className="flex items-center">
                  <Cpu className="mr-2 h-4 w-4" />
                  Hardware
                </TabsTrigger>
                <TabsTrigger value="software" className="flex items-center">
                  <Monitor className="mr-2 h-4 w-4" />
                  Software
                </TabsTrigger>
              </TabsList>
              <TabsContent value="hardware" className="p-2">
                {product.hardwareInfo ? (
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">Hardware Specifications</h3>
                      <div className="space-y-4 text-blue-900">
                        {product.hardwareInfo && product.hardwareInfo.split('. ').map((paragraph, index) => (
                          paragraph.trim() && (
                            <p key={index} className="text-blue-800">
                              {paragraph.trim() + (paragraph.endsWith('.') ? '' : '.')}
                            </p>
                          )
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border-l-4 border-indigo-600">
                      <h3 className="text-lg font-semibold text-indigo-700 mb-3">AI Capabilities & Performance</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-indigo-600 rounded-md p-1 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="12" y1="20" x2="12" y2="20"/></svg>
                          </div>
                          <div>
                            <span className="font-medium text-indigo-900">AI Performance:</span>
                            <p className="text-indigo-700">Up to 67 TOPS (INT8), a 70% improvement over prior version</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="bg-indigo-600 rounded-md p-1 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                          </div>
                          <div>
                            <span className="font-medium text-indigo-900">Generative AI:</span>
                            <p className="text-indigo-700">Support for transformer models and LLMs up to 8B parameters (Llama-3.1-8B)</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="bg-indigo-600 rounded-md p-1 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          </div>
                          <div>
                            <span className="font-medium text-indigo-900">Energy Efficiency:</span>
                            <p className="text-indigo-700">7–25 watts power draw, making it a leader in energy-efficient AI computing</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="bg-indigo-600 rounded-md p-1 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 5-10 8.5c-.14.12-.08.35.12.35l15.08-.05c.38 0 .55-.48.33-.75L14.25 5.05a.2.2 0 0 0-.25-.05Z"/><path d="m5 6 14 6"/><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/></svg>
                          </div>
                          <div>
                            <span className="font-medium text-indigo-900">Software Stack:</span>
                            <p className="text-indigo-700">Full compatibility with NVIDIA JetPack SDK v6.1, CUDA, TensorRT, cuDNN</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="bg-indigo-600 rounded-md p-1 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m8 12 3 3 5-5"/></svg>
                          </div>
                          <div>
                            <span className="font-medium text-indigo-900">Applications:</span>
                            <p className="text-indigo-700">Robotics, computer vision, multimodal agents, and IoT at the network edge</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="bg-indigo-600 rounded-md p-1 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          </div>
                          <div>
                            <span className="font-medium text-indigo-900">Features:</span>
                            <p className="text-indigo-700">Local LLM execution for enhanced privacy and reduced latency</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    No hardware information available
                  </div>
                )}
              </TabsContent>
              <TabsContent value="software" className="p-2">
                {product.softwareInfo ? (
                  <div className="space-y-6">
                    <div className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-500">
                      <h3 className="text-lg font-semibold text-emerald-700 mb-3">Software Architecture</h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="bg-white rounded-lg shadow-sm p-3 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 flex items-center justify-center bg-emerald-100 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="8" y1="20" x2="8.01" y2="20"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="12" y1="22" x2="12.01" y2="22"/><line x1="16" y1="16" x2="16.01" y2="16"/><line x1="16" y1="20" x2="16.01" y2="20"/></svg>
                            </div>
                            <span className="font-medium">Cloud Integration</span>
                          </div>
                          <p className="text-sm text-gray-600">Seamless integration with major cloud platforms for scalable data processing and model training</p>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm p-3 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 flex items-center justify-center bg-emerald-100 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                            </div>
                            <span className="font-medium">Data Pipelines</span>
                          </div>
                          <p className="text-sm text-gray-600">Robust ETL pipelines with advanced data transformation and feature engineering capabilities</p>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm p-3 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 flex items-center justify-center bg-emerald-100 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                            </div>
                            <span className="font-medium">Containers</span>
                          </div>
                          <p className="text-sm text-gray-600">Docker containerization with Kubernetes orchestration for deployment flexibility</p>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm p-3 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 flex items-center justify-center bg-emerald-100 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                            </div>
                            <span className="font-medium">APIs</span>
                          </div>
                          <p className="text-sm text-gray-600">RESTful and GraphQL APIs with comprehensive SDK support for easy integration</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-violet-50 rounded-lg p-4 border-l-4 border-violet-500">
                      <h3 className="text-lg font-semibold text-violet-700 mb-3">AI Framework Support</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <h4 className="font-medium text-violet-900 mb-2">Deep Learning</h4>
                          <ul className="space-y-1 text-sm">
                            <li className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                              <span>PyTorch 2.0+</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                              <span>TensorFlow 2.12+</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                              <span>ONNX Runtime</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                              <span>JAX</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-violet-900 mb-2">Machine Learning</h4>
                          <ul className="space-y-1 text-sm">
                            <li className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                              <span>scikit-learn</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                              <span>XGBoost</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                              <span>LightGBM</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                              <span>Spark ML</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
                      <h3 className="text-lg font-semibold text-amber-700 mb-2">Edge Computing</h3>
                      <p className="text-amber-800 mb-3">
                        {product.softwareInfo}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        <div className="bg-white rounded p-3 shadow-sm border border-amber-100">
                          <h4 className="font-medium flex items-center gap-2 text-amber-900 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="m9 18 6-6-6-6"/></svg>
                            Model Optimization
                          </h4>
                          <p className="text-sm text-gray-600">TensorRT, TF-TRT, and OpenVINO support with INT8 quantization and weight pruning</p>
                        </div>
                        
                        <div className="bg-white rounded p-3 shadow-sm border border-amber-100">
                          <h4 className="font-medium flex items-center gap-2 text-amber-900 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="m9 18 6-6-6-6"/></svg>
                            Real-time Processing
                          </h4>
                          <p className="text-sm text-gray-600">Process data streams with latency as low as 15ms for real-time applications</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    No software information available
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
          

        </div>
      </div>
    </SwipeBack>
  );
}