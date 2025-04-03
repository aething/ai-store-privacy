import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Shop from "@/pages/Shop";
import Account from "@/pages/Account";
import ProductDetail from "@/pages/ProductDetail";
import ProductDetailDebug from "@/pages/ProductDetail.debug";
import Policy from "@/pages/Policy";
import InfoPage from "@/pages/InfoPage";
import Checkout from "@/pages/Checkout";
import Confirmation from "@/pages/Confirmation";
import Subscribe from "@/pages/Subscribe";
import PlayMarket from "@/pages/PlayMarket";
import StripeCatalog from "@/pages/StripeCatalog";
import DebugPage from "@/pages/DebugPage";
import ScrollManager from "@/components/ScrollManager";
import ErrorBoundary from "@/components/ErrorBoundary";
import ContextProviderWrapper from "@/components/ContextProviderWrapper";

// Подключаем тесты в режиме разработки
if (import.meta.env.DEV) {
  import('@/utils/browserTests');
}

function Router() {
  return (
    <ErrorBoundary componentName="Router">
      <Switch>
        <Route path="/" component={Shop} />
        <Route path="/account" component={Account} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/product-debug/:id" component={ProductDetailDebug} />
        <Route path="/policy/:id" component={Policy} />
        <Route path="/info/:id" component={InfoPage} />
        <Route path="/checkout/:id" component={Checkout} />
        <Route path="/confirmation" component={Confirmation} />
        <Route path="/subscribe" component={Subscribe} />
        <Route path="/playmarket" component={PlayMarket} />
        <Route path="/stripe-catalog" component={StripeCatalog} />
        <Route path="/debug" component={DebugPage} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  // Log initialization information
  console.log("App component initializing");
  
  return (
    <ErrorBoundary componentName="QueryClientProvider">
      <QueryClientProvider client={queryClient}>
        <ContextProviderWrapper>
          {/* ScrollManager следит за изменениями URL и управляет скроллом */}
          <ErrorBoundary componentName="ScrollManager">
            <ScrollManager />
          </ErrorBoundary>
          
          <ErrorBoundary componentName="Layout">
            <Layout>
              <Router />
            </Layout>
          </ErrorBoundary>
          
          <Toaster />
        </ContextProviderWrapper>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
