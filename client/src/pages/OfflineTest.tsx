import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckIcon, XIcon, WifiIcon, WifiOffIcon, RefreshCwIcon, DatabaseIcon, TrashIcon, DownloadIcon } from 'lucide-react';
import { Link } from 'wouter';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type CacheItemStatus = 'checking' | 'cached' | 'not-cached' | 'error';

type CacheItem = { 
  name: string; 
  status: CacheItemStatus; 
  path: string; 
};

interface ServiceWorkerInfo {
  status: 'checking' | 'not-supported' | 'not-registered' | 'registered' | 'active' | 'error';
  version: string | null;
}

export default function OfflineTest() {
  const [online, setOnline] = useState(navigator.onLine);
  const [swInfo, setSwInfo] = useState<ServiceWorkerInfo>({ 
    status: 'checking',
    version: null
  });
  const [coreItems, setCoreItems] = useState<CacheItem[]>([
    { name: 'Главная страница', status: 'checking', path: '/' },
    { name: 'Офлайн страница', status: 'checking', path: '/offline.html' },
    { name: 'Манифест PWA', status: 'checking', path: '/manifest.json' },
    { name: 'Главный CSS', status: 'checking', path: '/index.css' },
    { name: 'Заглушка изображения', status: 'checking', path: '/images/image-placeholder.svg' }
  ]);
  const [cacheStats, setCacheStats] = useState({
    totalItems: 0,
    totalSizeMB: 0,
    lastUpdated: null as Date | null
  });
  const [appVersion, setAppVersion] = useState('');
  const [clearStatus, setClearStatus] = useState<'idle' | 'clearing' | 'done' | 'error'>('idle');
  const [testResults, setTestResults] = useState({
    networkStateDetection: false,
    cacheAccess: false,
    serviceWorkerControl: false,
    offlinePageAvailable: false
  });

  // Отслеживание состояния сети
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Проверка Service Worker
  useEffect(() => {
    async function checkServiceWorker() {
      if (!('serviceWorker' in navigator)) {
        setSwInfo({ status: 'not-supported', version: null });
        return;
      }
      
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        if (registrations.length === 0) {
          setSwInfo({ status: 'not-registered', version: null });
          return;
        }
        
        const controller = navigator.serviceWorker.controller;
        if (!controller) {
          setSwInfo({ status: 'registered', version: null });
          return;
        }
        
        setSwInfo({ 
          status: 'active', 
          version: window.localStorage.getItem('sw-version') || null
        });
        
      } catch (error) {
        console.error('Error checking service worker:', error);
        setSwInfo({ status: 'error', version: null });
      }
    }
    
    checkServiceWorker();
    
    // Проверка версии приложения
    const storedVersion = localStorage.getItem('app-version');
    if (storedVersion) {
      setAppVersion(storedVersion);
    }
  }, []);

  // Проверка состояния кэша
  useEffect(() => {
    async function checkCacheItems() {
      if (!('caches' in window)) {
        return;
      }
      
      try {
        // Получение кэша
        const cache = await caches.open('ai-store-v3');
        
        // Обновление статуса для каждого элемента
        const updatedItems = await Promise.all(
          coreItems.map(async (item) => {
            try {
              const response = await cache.match(item.path);
              return {
                ...item,
                status: response ? 'cached' : 'not-cached'
              };
            } catch (error) {
              console.error(`Error checking cache for ${item.path}:`, error);
              return {
                ...item,
                status: 'error'
              };
            }
          })
        );
        
        setCoreItems(updatedItems);
        
        // Получение статистики кэша
        const cachedRequests = await cache.keys();
        const totalItems = cachedRequests.length;
        
        // Подсчет примерного размера кэша
        let totalSize = 0;
        for (const request of cachedRequests.slice(0, 10)) { // Ограничиваем выборку для производительности
          const response = await cache.match(request);
          if (response && response.clone) {
            const blob = await response.clone().blob();
            totalSize += blob.size;
          }
        }
        
        // Экстраполяция на весь кэш
        const avgSize = totalItems > 0 ? totalSize / Math.min(totalItems, 10) : 0;
        const estimatedTotalSize = avgSize * totalItems;
        
        setCacheStats({
          totalItems,
          totalSizeMB: parseFloat((estimatedTotalSize / (1024 * 1024)).toFixed(2)),
          lastUpdated: new Date()
        });
        
        // Обновление результатов тестов
        setTestResults(prev => ({
          ...prev,
          cacheAccess: true,
          offlinePageAvailable: updatedItems.find(i => i.path === '/offline.html')?.status === 'cached'
        }));
        
      } catch (error) {
        console.error('Error checking cache items:', error);
      }
    }
    
    checkCacheItems();
    
    // Проверка определения состояния сети
    setTestResults(prev => ({
      ...prev,
      networkStateDetection: typeof navigator.onLine === 'boolean',
      serviceWorkerControl: swInfo.status === 'active'
    }));
  }, [coreItems, swInfo.status]);

  // Функция очистки кэша
  async function clearCache() {
    setClearStatus('clearing');
    
    try {
      if ('caches' in window) {
        await caches.delete('ai-store-v3');
        await caches.delete('ai-store-offline-v3');
        await caches.delete('ai-store-dynamic-v3');
        
        // Обновляем статус элементов
        const updatedItems = coreItems.map(item => ({
          ...item,
          status: 'not-cached' as CacheItemStatus
        }));
        
        setCoreItems(updatedItems);
        setCacheStats({
          totalItems: 0,
          totalSizeMB: 0,
          lastUpdated: new Date()
        });
        
        setClearStatus('done');
        
        // Через 2 секунды возвращаем статус в исходное состояние
        setTimeout(() => {
          setClearStatus('idle');
        }, 2000);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      setClearStatus('error');
      
      setTimeout(() => {
        setClearStatus('idle');
      }, 2000);
    }
  }

  // Функция обновления кэша через перерегистрацию Service Worker
  async function refreshCache() {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        for (const registration of registrations) {
          await registration.update();
        }
        
        // Перезагрузка страницы для применения обновлений
        window.location.reload();
      } catch (error) {
        console.error('Error updating service worker:', error);
      }
    }
  }

  // Преобразование статуса в визуальный элемент
  function renderStatusIcon(status: CacheItemStatus) {
    switch (status) {
      case 'cached':
        return <CheckIcon size={16} className="text-green-500" />;
      case 'not-cached':
        return <XIcon size={16} className="text-red-500" />;
      case 'checking':
        return <RefreshCwIcon size={16} className="text-blue-500 animate-spin" />;
      case 'error':
        return <XIcon size={16} className="text-orange-500" />;
    }
  }

  // Состояние Service Worker в текстовом виде
  function getServiceWorkerStatusText(status: ServiceWorkerInfo['status']) {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'registered':
        return 'Зарегистрирован, но не активен';
      case 'not-registered':
        return 'Не зарегистрирован';
      case 'not-supported':
        return 'Не поддерживается';
      case 'checking':
        return 'Проверка...';
      case 'error':
        return 'Ошибка';
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Тестирование оффлайн режима</h1>
        <p className="text-muted-foreground mt-2">
          Проверьте работу приложения без сети
        </p>
      </div>
      
      {/* Статус сети */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            {online ? (
              <WifiIcon size={18} className="text-green-500" />
            ) : (
              <WifiOffIcon size={18} className="text-red-500" />
            )}
            Статус сети
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                online ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="font-medium">
              {online ? 'Подключено к интернету' : 'Нет подключения к интернету'}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            {online 
              ? 'Все функции приложения доступны.' 
              : 'Доступны только кэшированные ресурсы. Некоторые функции могут не работать.'}
          </p>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs defaultValue="status">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="status">Статус</TabsTrigger>
          <TabsTrigger value="cache">Кэш</TabsTrigger>
          <TabsTrigger value="test">Тесты</TabsTrigger>
          <TabsTrigger value="tools">Инструменты</TabsTrigger>
        </TabsList>
        
        {/* Вкладка со статусом */}
        <TabsContent value="status" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Service Worker</CardTitle>
              <CardDescription>
                Управляет кэшированием и работой оффлайн
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">Статус:</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className={`w-2.5 h-2.5 rounded-full ${
                        swInfo.status === 'active' ? 'bg-green-500' : 
                        swInfo.status === 'registered' ? 'bg-yellow-500' :
                        swInfo.status === 'checking' ? 'bg-blue-500' :
                        'bg-red-500'
                      }`}
                    />
                    <span>{getServiceWorkerStatusText(swInfo.status)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Версия:</p>
                  <p className="mt-1">{swInfo.version || 'Неизвестно'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Приложение</CardTitle>
              <CardDescription>
                Информация о версии и состоянии
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">Версия:</p>
                  <p className="mt-1">{appVersion || 'Неизвестно'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Режим:</p>
                  <p className="mt-1">
                    {import.meta.env.DEV ? 'Разработка' : 'Продакшн'}
                  </p>
                </div>
              </div>
              
              <p className="text-sm mt-4 text-muted-foreground">
                Последняя проверка: {cacheStats.lastUpdated ? 
                  new Intl.DateTimeFormat('ru', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }).format(cacheStats.lastUpdated) : 'Никогда'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Вкладка с кэшем */}
        <TabsContent value="cache" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Статистика кэша</CardTitle>
              <CardDescription>
                Информация о кэшированных ресурсах
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">Количество элементов:</p>
                  <p className="mt-1">{cacheStats.totalItems}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Примерный размер:</p>
                  <p className="mt-1">{cacheStats.totalSizeMB} МБ</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Ключевые ресурсы</CardTitle>
              <CardDescription>
                Статус важных файлов в кэше
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {coreItems.map((item) => (
                  <li key={item.path} className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {item.status === 'cached' ? 'Кэширован' : 
                         item.status === 'not-cached' ? 'Не кэширован' : 
                         item.status === 'checking' ? 'Проверка...' : 
                         'Ошибка'}
                      </span>
                      {renderStatusIcon(item.status)}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCache}
                disabled={clearStatus !== 'idle'}
                className="ml-auto"
              >
                {clearStatus === 'clearing' ? (
                  <>
                    <RefreshCwIcon size={14} className="mr-2 animate-spin" />
                    Очистка...
                  </>
                ) : clearStatus === 'done' ? (
                  <>
                    <CheckIcon size={14} className="mr-2" />
                    Очищено!
                  </>
                ) : clearStatus === 'error' ? (
                  <>
                    <XIcon size={14} className="mr-2" />
                    Ошибка!
                  </>
                ) : (
                  <>
                    <TrashIcon size={14} className="mr-2" />
                    Очистить кэш
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Вкладка с тестами */}
        <TabsContent value="test" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Тесты совместимости</CardTitle>
              <CardDescription>
                Проверка поддержки оффлайн функций
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex justify-between items-center">
                  <span>Определение состояния сети</span>
                  <div className="flex items-center gap-2">
                    {testResults.networkStateDetection ? (
                      <CheckIcon size={16} className="text-green-500" />
                    ) : (
                      <XIcon size={16} className="text-red-500" />
                    )}
                  </div>
                </li>
                <li className="flex justify-between items-center">
                  <span>Доступ к Cache API</span>
                  <div className="flex items-center gap-2">
                    {testResults.cacheAccess ? (
                      <CheckIcon size={16} className="text-green-500" />
                    ) : (
                      <XIcon size={16} className="text-red-500" />
                    )}
                  </div>
                </li>
                <li className="flex justify-between items-center">
                  <span>Контроль Service Worker</span>
                  <div className="flex items-center gap-2">
                    {testResults.serviceWorkerControl ? (
                      <CheckIcon size={16} className="text-green-500" />
                    ) : (
                      <XIcon size={16} className="text-red-500" />
                    )}
                  </div>
                </li>
                <li className="flex justify-between items-center">
                  <span>Офлайн-страница</span>
                  <div className="flex items-center gap-2">
                    {testResults.offlinePageAvailable ? (
                      <CheckIcon size={16} className="text-green-500" />
                    ) : (
                      <XIcon size={16} className="text-red-500" />
                    )}
                  </div>
                </li>
              </ul>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Симуляция оффлайн режима:</p>
                <p className="text-sm text-muted-foreground">
                  Для симуляции оффлайн режима используйте инструменты разработчика браузера:
                </p>
                <ol className="text-sm list-decimal pl-5 space-y-1">
                  <li>Откройте инструменты разработчика (F12)</li>
                  <li>Перейдите на вкладку Network (Сеть)</li>
                  <li>Включите опцию Offline (Оффлайн)</li>
                  <li>Перезагрузите страницу для тестирования</li>
                </ol>
              </div>
            </CardContent>
          </Card>
          
          <Alert>
            <WifiOffIcon className="h-4 w-4" />
            <AlertTitle>Советы по тестированию</AlertTitle>
            <AlertDescription>
              Для наиболее эффективного тестирования сначала просмотрите все страницы приложения в онлайн-режиме, 
              чтобы они были добавлены в кэш. Затем включите оффлайн-режим и проверьте доступность всех 
              предварительно просмотренных страниц.
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        {/* Вкладка с инструментами */}
        <TabsContent value="tools" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Инструменты</CardTitle>
              <CardDescription>
                Управление оффлайн-функциональностью
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Button onClick={refreshCache} className="w-full">
                  <RefreshCwIcon size={16} className="mr-2" />
                  Обновить кэш
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Перезагрузит Service Worker и обновит кэшированные ресурсы
                </p>
              </div>
              
              <div>
                <Button onClick={clearCache} variant="outline" className="w-full">
                  <TrashIcon size={16} className="mr-2" />
                  Очистить кэш
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Удалит все кэшированные данные приложения
                </p>
              </div>
              
              <div>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  asChild
                >
                  <Link to="/offline.html">
                    <DownloadIcon size={16} className="mr-2" />
                    Открыть оффлайн-страницу
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Показывает резервную страницу для оффлайн-режима
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Accordion type="single" collapsible>
            <AccordionItem value="debug">
              <AccordionTrigger className="text-sm font-medium">
                Консольные команды для отладки
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-muted rounded-md p-3 space-y-3 text-sm font-mono">
                  <div>
                    <p className="text-muted-foreground mb-1">// Проверка поддержки оффлайн-режима</p>
                    <p>window.appDebug.checkOfflineSupport()</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">// Очистка кэша Service Worker</p>
                    <p>window.appDebug.clearServiceWorkerCache()</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">// Обновление кэша</p>
                    <p>window.appDebug.refreshServiceWorkerCache()</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">// Проверка статуса сети</p>
                    <p>window.appDebug.isOffline()</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
}