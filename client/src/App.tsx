import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Shop from "@/pages/Shop";
import Account from "@/pages/Account";
import ProductDetail from "@/pages/ProductDetail";
import Policy from "@/pages/Policy";
import InfoPage from "@/pages/InfoPage";
import Checkout from "@/pages/Checkout";
import Confirmation from "@/pages/Confirmation";
import Subscribe from "@/pages/Subscribe";
import AppInfo from "@/pages/AppInfo";
import Analytics from "@/pages/Analytics";
import PlayMarket from "@/pages/PlayMarket";
// import IconTest from "@/pages/IconTest";
import { AppProvider } from "@/context/AppContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { ErrorProvider } from "@/context/ErrorContext";
import { NotificationProvider } from "@/components/NotificationSystem";
import { useApiErrorHandler } from "@/hooks/use-api-error";
import { useEffect, useState } from "react";
import PageTransition from "@/components/PageTransition";
import { initCache, initOnlineStatusHandlers } from "@/lib/cache-utils";
import { triggerHapticFeedback } from "@/hooks/use-haptic-feedback";

// Компонент для глобальной обработки ошибок
function ErrorHandler() {
  useApiErrorHandler();
  
  useEffect(() => {
    // Добавляем обработчик для сетевых ошибок
    const handleOnline = () => {
      console.log("Сетевое соединение восстановлено");
      // При восстановлении соединения обновляем данные
      queryClient.invalidateQueries();
      // Тактильная обратная связь при восстановлении соединения
      triggerHapticFeedback('success');
    };
    
    const handleOffline = () => {
      console.log("Потеряно сетевое соединение");
      // Тактильная обратная связь при потере соединения
      triggerHapticFeedback('warning');
    };
    
    // Инициализируем обработчики статуса подключения
    const cleanup = initOnlineStatusHandlers(handleOffline, handleOnline);
    
    // Инициализируем кэширование для офлайн-режима
    initCache().catch(error => {
      console.error("Ошибка при инициализации кэша:", error);
    });
    
    return cleanup;
  }, []);
  
  return null;
}

// Компонент маршрутизации с анимацией перехода между страницами
function Router() {
  // Получаем текущий маршрут для анимации перехода
  const [location] = useLocation();
  
  // Статус загрузки приложения
  const [isAppReady, setIsAppReady] = useState(false);
  
  // Эффект запуска приложения с анимацией загрузки
  useEffect(() => {
    // Имитируем задержку загрузки для показа анимации
    setTimeout(() => {
      setIsAppReady(true);
      // Тактильная обратная связь при полной загрузке приложения
      triggerHapticFeedback('light');
    }, 800);
  }, []);
  
  // Эффект для тактильной обратной связи при навигации
  useEffect(() => {
    // Пропускаем первую загрузку
    if (isAppReady) {
      triggerHapticFeedback('selection');
    }
  }, [location, isAppReady]);
  
  // Если приложение еще не готово, показываем анимацию загрузки
  if (!isAppReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-16 h-16 mb-4 border-4 border-t-blue-600 border-blue-200 rounded-full mx-auto animate-spin"></div>
          <h2 className="text-xl font-medium text-gray-700">Загрузка приложения...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <PageTransition transitionType="fade" duration={300}>
      <Switch>
        <Route path="/" component={Shop} />
        <Route path="/account" component={Account} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/policy/:id" component={Policy} />
        <Route path="/info/:id" component={InfoPage} />
        <Route path="/checkout/:id" component={Checkout} />
        <Route path="/confirmation" component={Confirmation} />
        <Route path="/subscribe" component={Subscribe} />
        <Route path="/app-info" component={AppInfo} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/play-market" component={PlayMarket} />
        <Route component={NotFound} />
      </Switch>
    </PageTransition>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorProvider>
        <AppProvider>
          <LocaleProvider>
            <NotificationProvider>
              <ErrorHandler />
              <Layout>
                <Router />
              </Layout>
              <Toaster />
            </NotificationProvider>
          </LocaleProvider>
        </AppProvider>
      </ErrorProvider>
    </QueryClientProvider>
  );
}

export default App;
