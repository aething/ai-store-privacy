import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useOfflineNavigation } from '@/components/OfflineNavigationProvider';
import { Label } from '@/components/ui/label';
import { Info, WifiOff, Wifi, Database, RefreshCw, ShieldCheck, DollarSign } from 'lucide-react';

/**
 * Страница для тестирования и настройки оффлайн-режима приложения
 * Эта страница доступна только в режиме разработки
 */
const OfflinePage = () => {
  const { isOnline, offlineData, cacheData } = useOfflineNavigation();
  const [networkStatus, setNetworkStatus] = useState({ online: isOnline });
  const [cacheInfo, setCacheInfo] = useState<any>({ status: 'loading' });
  const [appVersion, setAppVersion] = useState<string>('');
  const [swVersion, setSwVersion] = useState<string>('');
  const [debugMode, setDebugMode] = useState(localStorage.getItem('debug_mode') === 'true');
  
  // Получаем информацию о кэше и версиях
  useEffect(() => {
    // Получаем версию приложения
    const appVer = localStorage.getItem('app-version') || '3.0.1';
    setAppVersion(appVer);
    
    // Получаем версию Service Worker
    const swVer = localStorage.getItem('sw-version') || 'не установлен';
    setSwVersion(swVer);
    
    // Получаем информацию о кэше
    if (window.appDebug && window.appDebug.swAPI) {
      window.appDebug.swAPI.getCacheInfo()
        .then(info => {
          setCacheInfo({ status: 'loaded', ...info });
        })
        .catch(err => {
          console.error('Ошибка при получении информации о кэше:', err);
          setCacheInfo({ status: 'error', error: err.message });
        });
    } else {
      setCacheInfo({ status: 'unavailable' });
    }
  }, []);
  
  // Обновляем статус сети, когда меняется isOnline
  useEffect(() => {
    setNetworkStatus({ online: isOnline });
  }, [isOnline]);
  
  // Обработчик переключения режима отладки
  const handleDebugModeToggle = (checked: boolean) => {
    setDebugMode(checked);
    localStorage.setItem('debug_mode', checked.toString());
  };
  
  // Форсирование оффлайн-режима для тестирования (только в режиме разработки)
  const simulateOffline = () => {
    if (!networkStatus.online) return;
    
    console.log('Симуляция оффлайн-режима активирована');
    // Это симуляция, реальное подключение не изменяется
    setNetworkStatus({ online: false });
    
    // Создаем кастомное событие для компонентов, которые слушают состояние сети
    const event = new CustomEvent('network-status-change', { 
      detail: { online: false } 
    });
    window.dispatchEvent(event);
    
    // Восстанавливаем через 10 секунд
    setTimeout(() => {
      console.log('Симуляция оффлайн-режима завершена');
      setNetworkStatus({ online: isOnline });
      
      const event = new CustomEvent('network-status-change', { 
        detail: { online: isOnline } 
      });
      window.dispatchEvent(event);
    }, 10000);
  };
  
  // Обновление кэша
  const refreshCache = async () => {
    if (window.appDebug && window.appDebug.refreshServiceWorkerCache) {
      try {
        await window.appDebug.refreshServiceWorkerCache();
        
        // Обновляем информацию о кэше
        if (window.appDebug.swAPI) {
          const info = await window.appDebug.swAPI.getCacheInfo();
          setCacheInfo({ status: 'loaded', ...info });
        }
        
        alert('Кэш успешно обновлен!');
      } catch (error) {
        console.error('Ошибка при обновлении кэша:', error);
        alert(`Ошибка при обновлении кэша: ${error}`);
      }
    } else {
      alert('API обновления кэша недоступен');
    }
  };
  
  // Очистка всего кэша
  const clearAllCache = async () => {
    if (window.appDebug && window.appDebug.clearAllCache) {
      try {
        window.appDebug.clearAllCache();
        
        // Обновляем информацию о кэше
        if (window.appDebug.swAPI) {
          setTimeout(async () => {
            const info = await window.appDebug.swAPI.getCacheInfo();
            setCacheInfo({ status: 'loaded', ...info });
          }, 500);
        }
        
        alert('Кэш успешно очищен!');
      } catch (error) {
        console.error('Ошибка при очистке кэша:', error);
        alert(`Ошибка при очистке кэша: ${error}`);
      }
    } else {
      alert('API очистки кэша недоступен');
    }
  };
  
  // Если страница вызвана не в режиме разработки, показываем сообщение
  if (import.meta.env.PROD) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Недоступно в рабочей версии</AlertTitle>
          <AlertDescription>
            Страница диагностики оффлайн-режима доступна только в режиме разработки.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/">
            <Button>Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <WifiOff className="h-6 w-6 mr-2" />
            Диагностика оффлайн-режима
          </CardTitle>
          <CardDescription>
            Инструменты для тестирования и настройки работы приложения в оффлайн-режиме.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${networkStatus.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">Статус сети: {networkStatus.online ? 'Онлайн' : 'Оффлайн'}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={simulateOffline}
              disabled={!networkStatus.online}
            >
              Симулировать оффлайн (10с)
            </Button>
          </div>
          
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="status">Статус</TabsTrigger>
              <TabsTrigger value="cache">Кэш</TabsTrigger>
              <TabsTrigger value="data">Данные</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
            </TabsList>
            
            <TabsContent value="status">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium flex items-center"><ShieldCheck className="mr-2 h-5 w-5" /> Диагностика</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Service Worker:</span>
                      <span className="font-medium">{navigator.serviceWorker && navigator.serviceWorker.controller ? 'Активен' : 'Не активен'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Версия приложения:</span>
                      <span className="font-medium">{appVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Версия Service Worker:</span>
                      <span className="font-medium">{swVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Поддержка оффлайн-режима:</span>
                      <span className="font-medium">{navigator.serviceWorker ? 'Доступна' : 'Недоступна'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Поддержка Cache API:</span>
                      <span className="font-medium">{('caches' in window) ? 'Доступна' : 'Недоступна'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium flex items-center"><Database className="mr-2 h-5 w-5" /> Данные для оффлайн-режима</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Кэшированные продукты:</span>
                      <span className="font-medium">{offlineData.products?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Данные пользователя:</span>
                      <span className="font-medium">{offlineData.user ? 'Доступны' : 'Отсутствуют'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Сохраненные изображения:</span>
                      <span className="font-medium">{cacheInfo.status === 'loaded' && cacheInfo.images ? cacheInfo.images : 'Загрузка...'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Итого в кэше:</span>
                      <span className="font-medium">
                        {cacheInfo.status === 'loaded' && cacheInfo.total !== undefined 
                          ? `${cacheInfo.total} файлов` 
                          : cacheInfo.status === 'error' 
                            ? 'Ошибка загрузки' 
                            : 'Загрузка...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="cache">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center">
                    <Database className="mr-2 h-5 w-5" /> Управление кэшем
                  </h3>
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={refreshCache}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" /> Обновить кэш
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={clearAllCache}
                    >
                      Очистить весь кэш
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Информация о кэше:</h4>
                  
                  {cacheInfo.status === 'loading' && (
                    <p>Загрузка информации о кэше...</p>
                  )}
                  
                  {cacheInfo.status === 'error' && (
                    <Alert variant="destructive">
                      <AlertTitle>Ошибка загрузки информации о кэше</AlertTitle>
                      <AlertDescription>{cacheInfo.error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {cacheInfo.status === 'unavailable' && (
                    <Alert>
                      <AlertTitle>API кэша недоступен</AlertTitle>
                      <AlertDescription>
                        Service Worker не активен или не поддерживает API для работы с кэшем.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {cacheInfo.status === 'loaded' && (
                    <div className="space-y-2">
                      {cacheInfo.static !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Статические ресурсы:</span>
                          <span className="font-medium">{cacheInfo.static} файлов</span>
                        </div>
                      )}
                      
                      {cacheInfo.dynamic !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Динамические ресурсы:</span>
                          <span className="font-medium">{cacheInfo.dynamic} файлов</span>
                        </div>
                      )}
                      
                      {cacheInfo.offline !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Оффлайн ресурсы:</span>
                          <span className="font-medium">{cacheInfo.offline} файлов</span>
                        </div>
                      )}
                      
                      {cacheInfo.total !== undefined && (
                        <div className="flex justify-between font-medium">
                          <span>Всего в кэше:</span>
                          <span>{cacheInfo.total} файлов</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="data">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" /> Кэшированные продукты
                </h3>
                
                {offlineData.products && offlineData.products.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    {offlineData.products.map(product => (
                      <Card key={product.id} className="overflow-hidden">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">{product.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-gray-500 line-clamp-3">{product.description}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <span className="font-medium text-primary">
                            ${(product.priceUSD / 100).toFixed(2)} / €{(product.priceEUR / 100).toFixed(2)}
                          </span>
                          <Link href={`/products/${product.id}`}>
                            <Button size="sm" variant="secondary">Открыть</Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Нет кэшированных продуктов</AlertTitle>
                    <AlertDescription>
                      Посетите страницу магазина при наличии подключения к интернету, 
                      чтобы кэшировать продукты для оффлайн-режима.
                    </AlertDescription>
                  </Alert>
                )}
                
                <h3 className="text-lg font-medium mt-6 flex items-center">
                  <Wifi className="mr-2 h-5 w-5" /> Данные пользователя
                </h3>
                
                {offlineData.user ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Кэшированные данные пользователя</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Имя пользователя:</span>
                          <span className="font-medium">{offlineData.user.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Email:</span>
                          <span className="font-medium">{offlineData.user.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">ID пользователя:</span>
                          <span className="font-medium">{offlineData.user.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Страна:</span>
                          <span className="font-medium">{offlineData.user.country || 'Не указана'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Нет кэшированных данных пользователя</AlertTitle>
                    <AlertDescription>
                      Войдите в систему при наличии подключения к интернету, 
                      чтобы кэшировать данные пользователя для оффлайн-режима.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Настройки оффлайн-режима</h3>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="debug-mode" 
                    checked={debugMode}
                    onCheckedChange={handleDebugModeToggle}
                  />
                  <Label htmlFor="debug-mode">Режим отладки</Label>
                </div>
                
                <p className="text-sm text-gray-500">
                  Режим отладки включает расширенное логирование и дополнительные 
                  инструменты для отладки работы приложения в оффлайн-режиме.
                </p>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Дополнительные настройки:</h4>
                  <Button variant="outline" onClick={() => window.appDebug?.checkOfflineSupport()}>
                    Проверить поддержку оффлайн-режима
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/">
            <Button variant="outline">Вернуться на главную</Button>
          </Link>
          
          <div className="text-sm text-gray-500">
            Страница диагностики доступна только в режиме разработки
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OfflinePage;