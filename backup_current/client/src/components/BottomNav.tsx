import React from "react";
import { useLocation, useRoute } from "wouter";
import { ShoppingBag, User, Wifi, WifiOff } from "lucide-react";

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const [isShopActive] = useRoute("/");
  const [isAccountActive] = useRoute("/account");
  const [isOfflineTestActive] = useRoute("/offline-test");
  
  // Проверка состояния подключения к сети
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <nav className="sticky bottom-0 w-full h-16 bg-white shadow-md flex items-center justify-around z-50 rounded-b-md">
      <button 
        className="flex flex-col items-center justify-center w-1/3 transition-colors"
        onClick={() => setLocation("/")}
      >
        <ShoppingBag className={isShopActive ? "text-primary" : "text-gray-500"} size={24} />
        <span className={`text-xs mt-1 ${isShopActive ? "text-primary font-medium" : "text-gray-500"}`}>
          Shop
        </span>
      </button>
      <button 
        className="flex flex-col items-center justify-center w-1/3 transition-colors"
        onClick={() => setLocation("/account")}
      >
        <User className={isAccountActive ? "text-primary" : "text-gray-500"} size={24} />
        <span className={`text-xs mt-1 ${isAccountActive ? "text-primary font-medium" : "text-gray-500"}`}>
          Account
        </span>
      </button>
      <button 
        className="flex flex-col items-center justify-center w-1/3 transition-colors"
        onClick={() => setLocation("/offline-test")}
      >
        {isOnline ? (
          <Wifi className={isOfflineTestActive ? "text-primary" : "text-gray-500"} size={24} />
        ) : (
          <WifiOff className={isOfflineTestActive ? "text-primary" : "text-red-500"} size={24} />
        )}
        <span className={`text-xs mt-1 ${isOfflineTestActive ? "text-primary font-medium" : isOnline ? "text-gray-500" : "text-red-500"}`}>
          {isOnline ? "Офлайн тест" : "Офлайн режим"}
        </span>
      </button>
    </nav>
  );
}
