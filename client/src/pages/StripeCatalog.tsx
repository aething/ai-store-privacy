import { useState } from "react";
import Layout from '../components/Layout';
import { useToast } from '../hooks/use-toast';
import { useProductsSync } from "../hooks/use-products-sync";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Product } from "../../shared/schema";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "../context/AppContext";
import { ArrowLeft, CheckCircle2, RefreshCw, ShoppingBag, StoreIcon, XCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function StripeCatalog() {
  const { user } = useAppContext();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { syncProducts, isSyncing } = useProductsSync();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Загружаем список продуктов
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Обработчик для синхронизации с Stripe
  const handleSync = async () => {
    await syncProducts();
  };

  // Возвращаемся на предыдущую страницу
  const handleBack = () => {
    setLocation("/account");
  };

  // Цветовой код по статусу синхронизации
  const getStatusColor = (product: Product) => {
    if (product.stripeProductId) {
      return "bg-green-100 text-green-800";
    }
    return "bg-red-100 text-red-800";
  };

  // Детальный просмотр продукта
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  // Закрыть детальный просмотр
  const handleCloseDetails = () => {
    setSelectedProduct(null);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Синхронизация каталога со Stripe</h1>
          </div>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Синхронизация...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Синхронизировать
              </>
            )}
          </Button>
        </div>

        {/* Статус синхронизации */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StoreIcon className="h-5 w-5" />
              Статус синхронизации
            </CardTitle>
            <CardDescription>
              Информация о синхронизации продуктов с платформой Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Загрузка данных...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">Ошибка загрузки данных</div>
            ) : (
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Всего продуктов:</span>
                  <span>{products?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Синхронизировано со Stripe:</span>
                  <span>{products?.filter(p => p.stripeProductId).length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Не синхронизировано:</span>
                  <span>{products?.filter(p => !p.stripeProductId).length || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Список продуктов */}
        <div className="grid grid-cols-1 gap-6">
          {selectedProduct ? (
            // Детальный просмотр продукта
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{selectedProduct.title}</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleCloseDetails}>
                    Назад к списку
                  </Button>
                </div>
                <CardDescription>
                  {selectedProduct.category}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.title}
                      className="w-full h-auto rounded-lg object-cover"
                      style={{ maxHeight: "300px" }}
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="font-medium text-lg mb-2">Синхронизация со Stripe</h3>
                      {selectedProduct.stripeProductId ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-5 w-5" />
                          <span>
                            Синхронизировано со Stripe
                            <div className="text-sm text-muted-foreground">
                              ID: {selectedProduct.stripeProductId}
                            </div>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="h-5 w-5" />
                          <span>Не синхронизировано со Stripe</span>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">Цены</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">USD</div>
                          <div className="text-lg font-bold">${selectedProduct.price.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">EUR</div>
                          <div className="text-lg font-bold">€{selectedProduct.priceEUR.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">Описание</h3>
                      <p className="text-muted-foreground">
                        {selectedProduct.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Дополнительная информация */}
                <div className="mt-6">
                  <h3 className="font-medium text-lg mb-2">Характеристики</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedProduct.specifications.map((spec, index) => (
                      <li key={index}>{spec}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium text-lg mb-2">Особенности</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedProduct.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Список продуктов
            <>
              <h2 className="text-xl font-semibold mb-4">Список продуктов</h2>
              
              {isLoading ? (
                <div className="text-center py-4">Загрузка данных...</div>
              ) : error ? (
                <div className="text-center text-red-500 py-4">Ошибка загрузки данных</div>
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          style={{ maxHeight: "200px" }}
                        />
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
                            <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                            <Badge 
                              variant="outline" 
                              className={`mt-2 ${getStatusColor(product)}`}
                            >
                              {product.stripeProductId 
                                ? `Синхронизировано (${product.stripeProductId})` 
                                : "Не синхронизировано"}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold">${product.price.toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">
                              €{product.priceEUR.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewProduct(product)}
                          >
                            Подробнее
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Нет продуктов</h3>
                  <p className="text-muted-foreground mb-4">
                    В каталоге нет продуктов. Нажмите кнопку синхронизации, чтобы загрузить продукты из Stripe.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}