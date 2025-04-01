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
import { getProductImage, preloadImages, areImagesLoaded } from "@/lib/imagePreloader";
import { scrollToTop, saveScrollPositionForPath, restoreScrollPositionForPath } from "@/lib/scrollUtils";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAppContext();
  const { t } = useLocale();
  const [couponCode, setCouponCode] = useState('');
  const [imageLoaded, setImageLoaded] = useState(areImagesLoaded());
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
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
  
  // Используем функцию из сервиса предварительной загрузки для получения изображения
  // При монтировании компонента загружаем изображение
  useEffect(() => {
    if (!product) return;
    
    // Функция для установки источника изображения
    const setImageSource = () => {
      setImageSrc(product.imageUrl || getProductImage(product.id));
    };
    
    // Всегда пытаемся загрузить изображения
    // Это обеспечивает, что хуки всегда вызываются в одном и том же порядке
    preloadImages()
      .then(() => {
        // После загрузки устанавливаем флаг и источник
        setImageLoaded(true);
        setImageSource();
      })
      .catch(() => {
        // В случае ошибки при загрузке также устанавливаем источник
        setImageSource();
      });
  }, [product]);
  
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
                            <div className="bg-emerald-500 p-1 rounded text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                            </div>
                            <h4 className="font-medium text-emerald-800">Operating System</h4>
                          </div>
                          <p className="text-emerald-700">AethingOS 2.5 with real-time capabilities for AI processing</p>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm p-3 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-emerald-500 p-1 rounded text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
                            </div>
                            <h4 className="font-medium text-emerald-800">AI Engine</h4>
                          </div>
                          <p className="text-emerald-700">Aether Voice Assistant 4.0 with offline processing capabilities</p>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm p-3 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-emerald-500 p-1 rounded text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path><line x1="2" y1="20" x2="2" y2="20"></line></svg>
                            </div>
                            <h4 className="font-medium text-emerald-800">Connectivity</h4>
                          </div>
                          <p className="text-emerald-700">Wi-Fi 6, Bluetooth 5.0, and Thread for smart home integration</p>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm p-3 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-emerald-500 p-1 rounded text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </div>
                            <h4 className="font-medium text-emerald-800">Settings</h4>
                          </div>
                          <p className="text-emerald-700">Adaptive configuration with voice and app-based controls</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
                      <h3 className="text-lg font-semibold text-amber-700 mb-3">Features & Compatibility</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">1</div>
                          <div>
                            <h4 className="font-medium text-amber-900">Supported Languages</h4>
                            <p className="text-amber-700">Русский, English, Deutsch, Français, Español, Italiano, 日本語, 中文</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">2</div>
                          <div>
                            <h4 className="font-medium text-amber-900">Media Services</h4>
                            <p className="text-amber-700">Spotify, YouTube Music, Netflix, Яндекс.Музыка, and more</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">3</div>
                          <div>
                            <h4 className="font-medium text-amber-900">Smart Home Protocols</h4>
                            <p className="text-amber-700">HomeKit, Google Home, Яндекс.Умный дом, and other major platforms</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">4</div>
                          <div>
                            <h4 className="font-medium text-amber-900">Updates & Maintenance</h4>
                            <p className="text-amber-700">Automatic OTA updates and self-diagnostic capabilities</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-purple-700 mb-3">Security Features</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-100 flex gap-3 items-center">
                          <div className="bg-purple-600 p-2 rounded-full text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-purple-900">AES-256 Encryption</h4>
                            <p className="text-sm text-purple-600">For all stored and transmitted data</p>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-100 flex gap-3 items-center">
                          <div className="bg-purple-600 p-2 rounded-full text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 11V7a5 5 0 0 0-5-5v0a5 5 0 0 0-5 5v4"/><path d="M11 7h2v3h-2z"/><path d="M19 19a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3z"/></svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-purple-900">Voice Authentication</h4>
                            <p className="text-sm text-purple-600">Biometric voice recognition for secure access</p>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-100 flex gap-3 items-center">
                          <div className="bg-purple-600 p-2 rounded-full text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"/><path d="M2 16.92A9 9 0 0 0 12 21a9 9 0 0 0 10-4.08"/><path d="M17 9h-3a5 5 0 0 0-10 0H1"/></svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-purple-900">Privacy Mode</h4>
                            <p className="text-sm text-purple-600">Complete microphone disconnection with hardware switch</p>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-purple-100 flex gap-3 items-center">
                          <div className="bg-purple-600 p-2 rounded-full text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1 2-2c2 0 2 4 4 4a2 2 0 0 0 2-2"/><path d="M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-purple-900">Secure Boot</h4>
                            <p className="text-sm text-purple-600">Verified boot sequence and integrity checking</p>
                          </div>
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
            
            {/* Примечание по изображениям */}
            <div className="text-gray-400 text-xs text-center mt-4 italic">
              Images are for illustration purposes only. Refer to the description for full specifications.
            </div>
          </Card>
        </div>
      </div>
    </SwipeBack>
  );
}
