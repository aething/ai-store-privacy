import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
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
import PlayMarket from "@/pages/PlayMarket";
import { AppProvider } from "@/context/AppContext";
import { LocaleProvider } from "@/context/LocaleContext";

function Router() {
  const [location] = useLocation();
  
  // Сбрасываем скролл при изменении маршрута, 
  // но только для определенных переходов.
  // Для путей с сохранением позиции скролла мы используем
  // функции saveScrollPosition/restoreScrollPosition в самих компонентах
  useEffect(() => {
    // Пути, для которых мы не сбрасываем скролл автоматически:
    // - Переход с "/" (Shop) на "/product/:id" сохраняет позицию скролла
    // - Переход с "/account" на "/policy/:id" сохраняет позицию скролла
    // - Возврат назад не сбрасывает позицию скролла
    
    // Для остальных переходов сбрасываем скролл
    if (!location.includes("/product/") && 
        !location.includes("/policy/")) {
      window.scrollTo(0, 0);
    }
  }, [location]);
  
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
      <Route path="/playmarket" component={PlayMarket} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <LocaleProvider>
          <Layout>
            <Router />
          </Layout>
          <Toaster />
        </LocaleProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
