import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/context/AppContext";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/context/LocaleContext";
import { formatPrice, getCurrencyForCountry } from "@/lib/currency";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProductImage } from "@/hooks/useProductImage";
import SwipeBack from "@/components/SwipeBack";

// Отладочная информация о состоянии
function DebugStateInfo() {
  const { user } = useAppContext();
  const [data, setData] = useState({
    api: null,
    localStorage: null,
    context: user
  });
  
  useEffect(() => {
    // Получаем данные пользователя из localStorage
    try {
      const localData = localStorage.getItem('user');
      if (localData) {
        setData(prev => ({ ...prev, localStorage: JSON.parse(localData) }));
      }
    } catch (e) {
      console.error('Error parsing localStorage.user', e);
    }
    
    // Получаем данные с сервера
    fetch('/api/users/me')
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(userData => {
        setData(prev => ({ ...prev, api: userData, context: user }));
      })
      .catch(err => {
        console.error('Error fetching user data', err);
      });
  }, [user]);
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
      <h3 className="font-bold mb-2">Отладочная информация</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h4 className="font-semibold text-sm mb-1">API</h4>
          <pre className="text-xs bg-white p-2 rounded h-40 overflow-auto">
            {JSON.stringify(data.api, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm mb-1">localStorage</h4>
          <pre className="text-xs bg-white p-2 rounded h-40 overflow-auto">
            {JSON.stringify(data.localStorage, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm mb-1">Context</h4>
          <pre className="text-xs bg-white p-2 rounded h-40 overflow-auto">
            {JSON.stringify(data.context, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-semibold text-sm mb-1">Отладочные функции</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          <button 
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded"
            onClick={() => localStorage.removeItem('user')}
          >
            Очистить localStorage
          </button>
          
          <button 
            className="px-3 py-1 bg-green-500 text-white text-xs rounded"
            onClick={() => window.location.reload()}
          >
            Перезагрузить страницу
          </button>
          
          <button 
            className="px-3 py-1 bg-purple-500 text-white text-xs rounded"
            onClick={() => {
              if (data.api) {
                localStorage.setItem('user', JSON.stringify(data.api));
                window.location.reload();
              }
            }}
          >
            Синхронизировать с API
          </button>
        </div>
      </div>
    </div>
  );
}

// Компонент для страницы детального просмотра
export default function ProductDetailDebug() {
  const [match, params] = useRoute("/product-debug/:id");
  const productId = match ? parseInt(params.id) : null;
  const [, setLocation] = useLocation();
  const { user } = useAppContext();
  const { t } = useLocale();
  const { toast } = useToast();
  const [showDebug, setShowDebug] = useState(false);
  
  // Получение продукта по ID
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
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
  
  useEffect(() => {
    // Логируем информацию о стране и валюте
    console.log('ProductDetailDebug: user country =', user?.country);
    console.log('ProductDetailDebug: currency =', currency);
    
    if (product) {
      console.log('ProductDetailDebug: price USD =', product.price);
      console.log('ProductDetailDebug: price EUR =', product.priceEUR);
      console.log('ProductDetailDebug: selected price =', 
        currency === 'EUR' ? product.priceEUR : product.price);
    }
  }, [user, product, currency]);
  
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
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-2 rounded-full opacity-70 hover:opacity-100"
      >
        Debug
      </button>
      
      {/* Отладочная информация */}
      {showDebug && <DebugStateInfo />}
      
      {/* Хлебные крошки */}
      <BreadcrumbNav 
        items={[
          { label: t("home"), path: "/" },
          { label: t("shop"), path: "/shop" },
          { label: product?.title || t("product"), path: `/product/${productId}` }
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
                  
                  {/* Отладочная информация о ценах */}
                  {showDebug && (
                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                      <div>Debug USD: {formatPrice(product.price, 'USD')}</div>
                      <div>Debug EUR: {formatPrice(product.priceEUR || 0, 'EUR')}</div>
                      <div>User country: {user?.country || 'not set'}</div>
                      <div>Selected currency: {currency}</div>
                      <div>Selected price: {currency === 'EUR' ? product.priceEUR : product.price}</div>
                    </div>
                  )}
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