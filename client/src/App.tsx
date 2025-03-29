import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
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
import { AppProvider } from "@/context/AppContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { ErrorProvider } from "@/context/ErrorContext";
import { useApiErrorHandler } from "@/hooks/use-api-error";
import { useEffect } from "react";

// Компонент для глобальной обработки ошибок
function ErrorHandler() {
  useApiErrorHandler();
  
  useEffect(() => {
    // Добавляем обработчик для сетевых ошибок
    const handleOnline = () => {
      console.log("Сетевое соединение восстановлено");
      // При восстановлении соединения обновляем данные
      queryClient.invalidateQueries();
    };
    
    const handleOffline = () => {
      console.log("Потеряно сетевое соединение");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Shop} />
      <Route path="/account" component={Account} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/policy/:id" component={Policy} />
      <Route path="/info/:id" component={InfoPage} />
      <Route path="/checkout/:id" component={Checkout} />
      <Route path="/confirmation" component={Confirmation} />
      <Route path="/subscribe" component={Subscribe} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorProvider>
        <AppProvider>
          <LocaleProvider>
            <ErrorHandler />
            <Layout>
              <Router />
            </Layout>
            <Toaster />
          </LocaleProvider>
        </AppProvider>
      </ErrorProvider>
    </QueryClientProvider>
  );
}

export default App;
