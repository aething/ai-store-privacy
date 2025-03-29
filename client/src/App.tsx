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
import Checkout from "@/pages/Checkout";
import Confirmation from "@/pages/Confirmation";
import { AppProvider } from "@/context/AppContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Shop} />
      <Route path="/account" component={Account} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/policy/:id" component={Policy} />
      <Route path="/checkout/:id" component={Checkout} />
      <Route path="/confirmation" component={Confirmation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
