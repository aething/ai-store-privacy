import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, getCurrencyForCountry, getPriceForCountry } from "@/lib/currency";
import SwipeBack from "@/components/SwipeBack";
import { useLocale } from "@/context/LocaleContext";
import { useDeviceSize } from "@/hooks/use-device-size";
import { useH1Size, useH2Size, useBodySize } from "@/hooks/use-responsive-text";
import AdaptiveContainer from "@/components/AdaptiveContainer";
import { Share2 } from "lucide-react";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAppContext();
  const { t } = useLocale();
  const { isMobile, isLandscape } = useDeviceSize();
  
  // Адаптивные размеры текста
  const h1Size = useH1Size();
  const h2Size = useH2Size();
  const bodySize = useBodySize();
  
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
            className="material-icons mr-2"
            onClick={() => setLocation("/")}
          >
            arrow_back
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
    
    setLocation(`/checkout/${product.id}`);
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      })
      .then(() => {
        toast({
          title: "Shared successfully",
          description: "Product has been shared",
        });
      })
      .catch(() => {
        toast({
          title: "Share canceled",
          description: "Product sharing was canceled",
        });
      });
    } else {
      toast({
        title: "Share not supported",
        description: "Your browser does not support sharing",
        variant: "destructive",
      });
    }
  };
  
  // Разное отображение для ландшафтной ориентации на мобильных устройствах
  if (isMobile && isLandscape) {
    return (
      <SwipeBack onSwipeBack={() => setLocation("/")}>
        <div>
          <div className="flex items-center mb-2">
            <button 
              className="material-icons mr-2"
              onClick={() => setLocation("/")}
            >
              arrow_back
            </button>
            <h2 className="text-lg font-medium">Product Details</h2>
          </div>
          
          {/* Горизонтальная раскладка для ландшафтного режима */}
          <div className="flex gap-4">
            {/* Левая колонка - изображение */}
            <div className="w-1/2">
              <div className="bg-surface rounded-lg overflow-hidden h-[calc(100vh-160px)]">
                <img 
                  src={product.imageUrl} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Правая колонка - информация */}
            <div className="w-1/2 overflow-y-auto h-[calc(100vh-160px)]">
              <h1 className={`font-medium mb-2 ${h1Size}`}>{product.title}</h1>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">
                  {formatPrice(getPriceForCountry(product, user?.country), getCurrencyForCountry(user?.country))}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={handleShare}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <Share2 size={18} />
                  </button>
                  <button 
                    className="bg-blue-600 text-white px-3 py-1 rounded-full font-medium hover:bg-blue-700 text-xs transform scale-85"
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
              
              <Card className="rounded-lg p-3 bg-white mb-4 text-sm">
                <h2 className="font-medium mb-2">Description</h2>
                <p className="text-text-secondary text-sm">{product.description}</p>
              </Card>
              
              <Card className="rounded-lg p-3 bg-white mb-4 text-sm">
                <h2 className="font-medium mb-2">Features</h2>
                <ul className="list-disc list-inside text-text-secondary text-sm">
                  {product.features.map((feature, index) => (
                    <li key={index} className="mb-1">{feature}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </SwipeBack>
    );
  }
  
  // Стандартное вертикальное отображение
  return (
    <SwipeBack onSwipeBack={() => setLocation("/")}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <button 
              className="material-icons mr-2"
              onClick={() => setLocation("/")}
            >
              arrow_back
            </button>
            <h2 className="text-lg font-medium">Product Details</h2>
          </div>
          
          <button 
            onClick={handleShare}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            aria-label="Share product"
          >
            <Share2 size={18} />
          </button>
        </div>
        
        {/* Подсказка для свайпа на мобильных устройствах */}
        <AdaptiveContainer mobileOnly>
          <div className="text-gray-400 text-xs text-center py-1 mb-2 border-y">
            <span className="material-icons text-xs align-text-bottom mr-1">swipe</span>
            {t("swipeRightToGoBack")}
          </div>
        </AdaptiveContainer>
        
        {/* Image Section */}
        <div className="bg-surface mb-4 rounded-lg overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.title} 
            className="w-full h-full object-cover"
            style={{ height: isMobile ? '200px' : '300px' }}
          />
        </div>
        
        {/* Title and Buy Button */}
        <div className="mb-4">
          <h1 className={`font-medium mb-3 ${h1Size}`}>{product.title}</h1>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-medium">
              {formatPrice(getPriceForCountry(product, user?.country), getCurrencyForCountry(user?.country))}
            </span>
            <button 
              className="bg-blue-600 text-white px-4 py-1 rounded-full font-medium hover:bg-blue-700 text-xs transform scale-85"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
          </div>
        </div>
        
        {/* Description */}
        <Card className={`rounded-lg p-4 bg-white mb-4 ${bodySize}`}>
          <h2 className={`font-medium mb-3 ${h2Size}`}>Description</h2>
          <p className="text-text-secondary">{product.description}</p>
        </Card>
        
        {/* Features */}
        <Card className={`rounded-lg p-4 bg-white mb-4 ${bodySize}`}>
          <h2 className={`font-medium mb-3 ${h2Size}`}>Features</h2>
          <ul className="list-disc list-inside text-text-secondary">
            {product.features.map((feature, index) => (
              <li key={index} className="mb-2">{feature}</li>
            ))}
          </ul>
        </Card>
        
        {/* Specifications */}
        <Card className={`rounded-lg p-4 bg-white mb-6 ${bodySize}`}>
          <h2 className={`font-medium mb-3 ${h2Size}`}>Specifications</h2>
          <table className="w-full text-sm md:text-base">
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
