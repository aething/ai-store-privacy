import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";
import { Card } from "@/components/ui/card";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/context/LocaleContext";
import { formatPrice, getCurrencyForCountry } from "@/lib/currency";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProductImage } from "@/hooks/useProductImage";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

// Отладочный код
function DebugSessionInfo() {
  const { user } = useAppContext();
  const [cookieInfo, setCookieInfo] = useState<string>("Загрузка информации о cookie...");
  
  useEffect(() => {
    // Выводим информацию о localSorage
    const localStorageUser = localStorage.getItem("user");
    let parsedUser = null;
    try {
      if (localStorageUser) {
        parsedUser = JSON.parse(localStorageUser);
      }
    } catch (e) {
      console.error("Ошибка при парсинге localStorage.user:", e);
    }
    
    // Делаем запрос к API для проверки сессии
    fetch("/api/users/me")
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          return { status: res.status, statusText: res.statusText, message: "Пользователь не авторизован" };
        }
      })
      .then(data => {
        setCookieInfo(JSON.stringify({
          sessionStatus: data.id ? "Активна" : "Неактивна",
          apiResponse: data,
          localStorage: parsedUser,
          contextUser: user
        }, null, 2));
      })
      .catch(err => {
        setCookieInfo(`Ошибка при получении информации о сессии: ${err.message}`);
      });
  }, [user]);
  
  return (
    <div className="debug-info bg-yellow-50 p-4 mb-4 rounded-lg border border-yellow-300">
      <h3 className="text-sm font-bold mb-2">Отладочная информация сессии:</h3>
      <pre className="text-xs overflow-auto max-h-40">{cookieInfo}</pre>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAppContext();
  const { t } = useLocale();
  const { toast } = useToast();
  const [showDebug, setShowDebug] = useState(false);
  
  // Получение продукта по ID
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });
  
  // Получение изображения продукта с проверкой ошибок и fallback
  const { imageSrc } = useProductImage(product?.id, product?.imageUrl);
  
  // Определение валюты на основе страны пользователя
  const currency = getCurrencyForCountry(user?.country);
  
  // Переход к продуктам той же категории
  const handleCategoryClick = (category: string) => {
    setLocation(`/shop?category=${encodeURIComponent(category)}`);
  };

  // Переход к чекауту
  const handleBuyNow = () => {
    if (!product) return;
    setLocation(`/checkout/${product.id}`);
  };
  
  // Добавление в корзину
  const handleAddToCart = () => {
    if (!product) return;
    
    // Сохраняем ID продукта в localStorage
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const productExists = cartItems.find((item: number) => item === product.id);
    
    if (!productExists) {
      cartItems.push(product.id);
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      toast({
        title: t("addedToCart"),
        description: `${product.title} ${t("addedToCartDesc")}`,
      });
    } else {
      toast({
        title: t("alreadyInCart"),
        description: t("alreadyInCartDesc"),
      });
    }
  };
  
  // Переключатель отладочной информации
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };
  
  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-600">Ошибка</h1>
        <p className="text-gray-600">Не удалось загрузить продукт.</p>
        <button 
          onClick={() => setLocation('/shop')}
          className="mt-4 flex items-center text-blue-600"
        >
          <ArrowLeft className="mr-2" size={16} />
          Вернуться к списку продуктов
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Отладочная кнопка */}
      <button 
        onClick={toggleDebug}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-2 rounded-full opacity-30 hover:opacity-100"
      >
        Debug
      </button>
      
      {/* Отладочная информация */}
      {showDebug && <DebugSessionInfo />}
      
      {/* Хлебные крошки */}
      <BreadcrumbNav 
        items={[
          { label: t("home"), path: "/" },
          { label: t("shop"), path: "/shop" },
          { label: product?.title || t("product"), path: `/product/${id}` }
        ]} 
      />
      
      {isLoading ? (
        // Скелетон для загрузки
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <div>
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-40 w-full mb-4" />
            <Skeleton className="h-10 w-1/3 mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-12 w-1/2" />
            </div>
          </div>
        </div>
      ) : (
        product && (
          <>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Изображение продукта */}
              <div className="bg-white rounded-lg overflow-hidden shadow-sm h-[400px] flex items-center justify-center">
                {imageSrc ? (
                  <img 
                    src={imageSrc}
                    alt={product.title} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="animate-pulse flex items-center justify-center w-full h-full bg-gray-100">
                    <span className="text-gray-400">Загрузка изображения...</span>
                  </div>
                )}
              </div>
              
              {/* Информация о продукте */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                <p 
                  className="text-blue-600 cursor-pointer hover:underline mb-4"
                  onClick={() => handleCategoryClick(product.category)}
                >
                  {product.category}
                </p>
                
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700">{product.description}</p>
                </div>
                
                <div className="mb-6">
                  <p className="text-2xl font-semibold">
                    {formatPrice(
                      currency === 'EUR' ? product.priceEUR : product.price,
                      currency,
                      !!product.stripeProductId
                    )}
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition flex-1 flex items-center justify-center"
                    onClick={handleBuyNow}
                  >
                    {t("buyNow")}
                  </button>
                  <button 
                    className="border border-blue-600 text-blue-600 px-6 py-3 rounded-full hover:bg-blue-50 transition flex items-center justify-center"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2" size={18} />
                    {t("addToCart")}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Технические характеристики продукта */}
            <Card className="p-6 mt-8">
              <h2 className="text-xl font-bold mb-4">{t("specifications")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">{t("sku")}</span>
                  <span>SKU-{product.id.toString().padStart(6, '0')}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">{t("category")}</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">{t("manufacturer")}</span>
                  <span>Aething Tech</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">{t("warranty")}</span>
                  <span>12 {t("months")}</span>
                </div>
              </div>
            </Card>
          </>
        )
      )}
    </div>
  );
}