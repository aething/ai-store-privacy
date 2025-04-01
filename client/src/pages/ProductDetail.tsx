import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Home, Monitor, Server } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SwipeBack from "@/components/SwipeBack";
import { queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/currency";
import { useAppContext } from "@/context/AppContext";

export default function ProductDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { state } = useAppContext();
  
  const productId = parseInt(id);
  
  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId
  });
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    // Устанавливаем заголовок страницы
    if (product && product.title) {
      document.title = `${product.title} | Aether AI`;
    }
    
    // Сбрасываем индекс изображения при смене продукта
    setCurrentImageIndex(0);
    
    return () => {
      document.title = "Aether AI";
    };
  }, [product]);
  
  // Функция для переключения изображений (будет использоваться в будущем)
  const changeImage = (direction: "next" | "prev") => {
    if (!product) return;
    
    // В будущем здесь будет переключение между несколькими изображениями
    if (direction === "next") {
      setCurrentImageIndex((prev) => 0); // Заглушка
    } else {
      setCurrentImageIndex((prev) => 0); // Заглушка
    }
  };
  
  const handleGoBack = () => {
    setLocation("/");
  };
  
  const formatProductPrice = (product: any) => {
    // Определяем валюту в зависимости от страны пользователя
    // Проверяем, что state и state.userCountry существуют
    const userCountry = state?.userCountry || null;
    const currency = userCountry && 
                    ["DE", "FR", "IT", "ES", "NL", "BE", "AT", "GR", "PT", "FI", "IE", "LU", "SK", "SI", "CY", "MT", "LV", "LT", "EE"].includes(userCountry) 
                    ? "EUR" : "USD";
    
    const price = currency === "EUR" ? product.priceEUR : product.price;
    
    return formatPrice(price, currency);
  };
  
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container py-8 text-center">
        <Button variant="outline" className="mb-4" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-500 mb-4">The product you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => setLocation("/")}>
          <Home className="mr-2 h-4 w-4" />
          Return to Home
        </Button>
      </div>
    );
  }
  
  return (
    <SwipeBack onSwipeBack={handleGoBack} enabled={true}>
      <div className="container py-6">
        <div className="flex flex-col gap-4">
          <Button 
            variant="ghost" 
            className="w-fit flex items-center text-gray-600 hover:text-gray-900 mr-auto" 
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          
          <Card className="overflow-hidden">
            <div className="md:grid md:grid-cols-2">
              <div className="relative">
                <div className="aspect-video md:aspect-square w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                
                {/* Кнопки навигации по галерее (заглушки) */}
                <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full bg-white/50 backdrop-blur-sm pointer-events-auto"
                    onClick={() => changeImage("prev")}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full bg-white/50 backdrop-blur-sm pointer-events-auto"
                    onClick={() => changeImage("next")}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-6 flex flex-col justify-between">
                <div>
                  <div className="mb-4">
                    <h1 className="text-2xl font-bold">{product.title}</h1>
                    <p className="text-gray-500 text-sm mt-1">{product.category}</p>
                  </div>
                  
                  <div className="text-2xl font-bold text-primary mb-4">
                    {formatProductPrice(product)}
                  </div>
                  
                  <p className="text-gray-700 mb-6">{product.description}</p>
                  
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Key Features</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </span>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        // Добавление в корзину будет реализовано в другом задании
                        alert('Товар добавлен в корзину');
                      }}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className="mr-1">Technical Specifications</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </CardContent>
            </div>
            
            <Separator />
            
            <Tabs defaultValue="hardware" className="p-6">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="hardware">
                  <Server className="mr-2 h-4 w-4" />
                  Hardware
                </TabsTrigger>
                <TabsTrigger value="software">
                  <Monitor className="mr-2 h-4 w-4" />
                  Software
                </TabsTrigger>
              </TabsList>
              <TabsContent value="hardware" className="p-2">
                {product.hardwareInfo ? (
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div 
                      className="prose max-w-none text-blue-800" 
                      dangerouslySetInnerHTML={{ __html: product.hardwareInfo.replace(/\n/g, '<br/>') }}
                    ></div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    No hardware information available
                  </div>
                )}
              </TabsContent>
              <TabsContent value="software" className="p-2">
                {product.softwareInfo ? (
                  <div className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-500">
                    <div 
                      className="prose max-w-none text-emerald-800" 
                      dangerouslySetInnerHTML={{ __html: product.softwareInfo.replace(/\n/g, '<br/>') }}
                    ></div>
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