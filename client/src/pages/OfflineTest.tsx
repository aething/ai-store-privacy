import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader, Wifi, WifiOff, Download, RefreshCw, HardDrive, Cloud, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OfflineTest() {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheStatus, setCacheStatus] = useState<{ name: string; status: 'checking' | 'cached' | 'not-cached' }[]>([]);
  const [offlineSupport, setOfflineSupport] = useState<boolean | null>(null);
  const [isCheckingCache, setIsCheckingCache] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  // Отслеживание онлайн/оффлайн статуса
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Начальная проверка кэша при загрузке страницы
    checkCache();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Проверка поддержки сервис-воркера
  const hasServiceWorker = () => {
    return 'serviceWorker' in navigator;
  };

  // Проверка наличия файлов в кэше
  const checkCache = async () => {
    setIsCheckingCache(true);
    setCacheStatus([
      { name: 'Оффлайн страница', status: 'checking' },
      { name: 'Основной CSS', status: 'checking' },
      { name: 'Иконки', status: 'checking' },
      { name: 'Графические ресурсы', status: 'checking' }
    ]);

    try {
      // Ждем немного, чтобы пользователь увидел процесс проверки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const cache = await caches.open('ai-store-v1');
      const offlinePage = await cache.match('/offline.html');
      const mainCss = await cache.match('/index.css');
      const icons = await cache.match('/manifest.json');
      const images = await cache.match('/images/image-placeholder.svg');
      
      setCacheStatus([
        { name: 'Оффлайн страница', status: offlinePage ? 'cached' : 'not-cached' },
        { name: 'Основной CSS', status: mainCss ? 'cached' : 'not-cached' },
        { name: 'Иконки', status: icons ? 'cached' : 'not-cached' },
        { name: 'Графические ресурсы', status: images ? 'cached' : 'not-cached' }
      ]);
      
      setOfflineSupport(!!offlinePage && !!mainCss);
    } catch (error) {
      console.error('Ошибка при проверке кэша:', error);
      toast({
        title: "Ошибка при проверке кэша",
        description: "Не удалось проверить состояние кэша",
        variant: "destructive"
      });
      
      setCacheStatus([
        { name: 'Оффлайн страница', status: 'not-cached' },
        { name: 'Основной CSS', status: 'not-cached' },
        { name: 'Иконки', status: 'not-cached' },
        { name: 'Графические ресурсы', status: 'not-cached' }
      ]);
      
      setOfflineSupport(false);
    } finally {
      setIsCheckingCache(false);
    }
  };

  // Очистка кэша
  const clearCache = async () => {
    setIsClearingCache(true);
    
    try {
      if (typeof window.clearCache === 'function') {
        await window.clearCache();
        toast({
          title: "Кэш очищен",
          description: "Все кэшированные данные были удалены",
        });
      } else {
        // Резервный вариант, если функция не определена
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
        toast({
          title: "Кэш очищен",
          description: "Все кэшированные данные были удалены",
        });
      }
      
      // Обновляем статус кэша
      await checkCache();
    } catch (error) {
      console.error('Ошибка при очистке кэша:', error);
      toast({
        title: "Ошибка при очистке кэша",
        description: "Не удалось очистить кэш приложения",
        variant: "destructive"
      });
    } finally {
      setIsClearingCache(false);
    }
  };

  // Симуляция оффлайн режима
  const simulateOffline = () => {
    toast({
      title: "Оффлайн симуляция",
      description: "Откройте инструменты разработчика (F12) и отключите сеть в панели Network",
    });
  };

  // Обновление страницы
  const refreshPage = () => {
    window.location.reload();
  };

  // Переход к оффлайн странице
  const viewOfflinePage = () => {
    window.open('/offline.html', '_blank');
  };

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Тестирование оффлайн режима</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="text-green-500" /> 
                <span>Подключение к сети активно</span>
              </>
            ) : (
              <>
                <WifiOff className="text-red-500" /> 
                <span>Нет подключения к сети</span>
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isOnline 
              ? "Для тестирования оффлайн функциональности отключите подключение к интернету" 
              : "Приложение работает в оффлайн режиме. Доступ к серверным функциям ограничен."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sw-support" className="flex items-center gap-2">
                <span>Поддержка Service Worker</span>
              </Label>
              <div className="flex items-center">
                {hasServiceWorker() ? (
                  <span className="text-green-500 text-sm font-medium">Поддерживается</span>
                ) : (
                  <span className="text-red-500 text-sm font-medium">Не поддерживается</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="offline-support" className="flex items-center gap-2">
                <span>Поддержка оффлайн режима</span>
              </Label>
              <div className="flex items-center">
                {offlineSupport === null ? (
                  <span className="text-gray-500 text-sm font-medium">Проверка...</span>
                ) : offlineSupport ? (
                  <span className="text-green-500 text-sm font-medium">Активна</span>
                ) : (
                  <span className="text-red-500 text-sm font-medium">Отсутствует</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardHeader>
          <CardTitle className="text-lg">Состояние кэша</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {cacheStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{item.name}</span>
                <span className={`text-sm font-medium ${
                  item.status === 'checking' 
                    ? 'text-gray-500' 
                    : item.status === 'cached' 
                      ? 'text-green-500' 
                      : 'text-red-500'
                }`}>
                  {item.status === 'checking' 
                    ? 'Проверка...' 
                    : item.status === 'cached' 
                      ? 'Кэшировано' 
                      : 'Не кэшировано'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            onClick={checkCache} 
            variant="outline" 
            disabled={isCheckingCache}
            className="gap-2"
          >
            {isCheckingCache && <Loader size={16} className="animate-spin" />}
            <RefreshCw size={16} />
            Проверить кэш
          </Button>
          <Button 
            onClick={clearCache} 
            variant="destructive" 
            disabled={isClearingCache}
            className="gap-2"
          >
            {isClearingCache && <Loader size={16} className="animate-spin" />}
            <HardDrive size={16} />
            Очистить кэш
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Инструменты тестирования</CardTitle>
          <CardDescription>
            Используйте эти функции для проверки оффлайн возможностей приложения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={simulateOffline} 
            variant="outline" 
            className="w-full gap-2"
          >
            <WifiOff size={16} />
            Симулировать оффлайн режим
          </Button>
          
          <Button 
            onClick={refreshPage} 
            variant="outline" 
            className="w-full gap-2"
          >
            <RefreshCw size={16} />
            Обновить страницу
          </Button>
          
          <Button 
            onClick={viewOfflinePage} 
            variant="outline" 
            className="w-full gap-2"
          >
            <Cloud size={16} />
            Просмотреть оффлайн страницу
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={20} />
            Информация для тестирования
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            <strong>Как тестировать оффлайн режим:</strong>
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Убедитесь, что страница полностью загружена в онлайн режиме</li>
            <li>Откройте инструменты разработчика (F12) и перейдите на вкладку Network</li>
            <li>Активируйте опцию "Offline" в инструментах разработчика</li>
            <li>Обновите страницу и проверьте, отображается ли оффлайн контент</li>
            <li>Попробуйте перейти к другим страницам для проверки навигации в оффлайн режиме</li>
          </ol>
          <p className="mt-4">
            <strong>Что должно работать в оффлайн режиме:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Базовая навигация по кэшированным страницам</li>
            <li>Отображение кэшированных изображений и ресурсов</li>
            <li>Показ оффлайн страницы при попытке доступа к некэшированному контенту</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}