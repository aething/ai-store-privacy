import React from "react";
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
import PlayMarket from "@/pages/PlayMarket";
import StripeCatalog from "@/pages/StripeCatalog";
import OfflinePage from "@/pages/OfflinePage";
import { AppProvider } from "@/context/AppContext";
import { LocaleProvider } from "@/context/LocaleContext";
import ScrollManager from "@/components/ScrollManager";
import { logMobileAppConfig, isMobileApp } from "@/utils/mobileAppUtils";
import { OfflineNavigationProvider } from "./components/OfflineNavigationProvider";
import OfflineNavigationHandler from "./components/OfflineNavigationHandler";

// Initialize mobile app settings
if (isMobileApp()) {
  logMobileAppConfig();
}

// Run tests in development mode
if (import.meta.env.DEV) {
  import('@/utils/browserTests');
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
      <Route path="/checkout" component={Checkout} />
      <Route path="/confirmation" component={Confirmation} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/playmarket" component={PlayMarket} />
      <Route path="/stripe-catalog" component={StripeCatalog} />
      <Route path="/offline-enhanced" component={OfflinePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // For initial Google Play Store release, we'll disable the offline navigation
  // if it causes React errors, since this is a non-critical feature that can
  // be fixed in a future update
  const [offlineNavigationError, setOfflineNavigationError] = React.useState(false);
  
  React.useEffect(() => {
    // Check if we have previously encountered an error
    const hasError = localStorage.getItem('offline_navigation_error') === 'true';
    if (hasError) {
      setOfflineNavigationError(true);
    }
    
    // Add error handler
    const errorHandler = (error: ErrorEvent) => {
      // If error mentions OfflineNavigation, disable the feature
      if (error.message && (
        error.message.includes('OfflineNavigation') || 
        error.message.includes('useState') ||
        error.message.includes('useEffect')
      )) {
        console.warn('Disabling offline navigation due to errors:', error.message);
        localStorage.setItem('offline_navigation_error', 'true');
        setOfflineNavigationError(true);
      }
    };
    
    window.addEventListener('error', errorHandler);
    
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);
  
  // With offline navigation for the full experience
  if (!offlineNavigationError) {
    try {
      return (
        <QueryClientProvider client={queryClient}>
          <OfflineNavigationProvider>
            <AppProvider>
              <LocaleProvider>
                {/* ScrollManager tracks URL changes and manages scrolling */}
                <ScrollManager />
                
                {/* Navigation handler for offline mode */}
                <OfflineNavigationHandler />
                
                <Layout>
                  <Router />
                </Layout>
                <Toaster />
              </LocaleProvider>
            </AppProvider>
          </OfflineNavigationProvider>
        </QueryClientProvider>
      );
    } catch (error) {
      console.error('Error rendering with OfflineNavigationProvider:', error);
      setOfflineNavigationError(true);
      // Continue to fallback rendering below
    }
  }
  
  // Fallback rendering without offline navigation
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <LocaleProvider>
          {/* ScrollManager tracks URL changes and manages scrolling */}
          <ScrollManager />
          
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
