import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { ArrowLeft, ChevronLeft, ChevronRight, Share, Download, Play } from "lucide-react";
import PlayMarketCard, { ScreenshotGallery } from "@/components/PlayMarketCard";
import { useShare } from "@/hooks/use-share";

interface PlayMarketData {
  appName: string;
  rating: number;
  downloads: string;
  version: string;
  lastUpdated: string;
  size: string;
  category: string;
  developedBy: string;
  screenshots: string[];
}

export default function PlayMarket() {
  const [, setLocation] = useLocation();
  const { user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const { share } = useShare(); // Добавляем хук share сразу после других хуков
  
  // Пример данных для Google Play Market
  const [appData, setAppData] = useState<PlayMarketData>({
    appName: "AI Store by Aething",
    rating: 4.7,
    downloads: "100,000+",
    version: "1.2.0",
    lastUpdated: "March 20, 2025",
    size: "15 MB",
    category: "Shopping",
    developedBy: "Aething Inc.",
    screenshots: [
      "https://placehold.co/300x600/6200ee/ffffff?text=Home+Screen",
      "https://placehold.co/300x600/6200ee/ffffff?text=Product+View",
      "https://placehold.co/300x600/6200ee/ffffff?text=Checkout",
      "https://placehold.co/300x600/6200ee/ffffff?text=Account"
    ]
  });
  
  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Скроллим содержимое страницы в начало при загрузке
  useEffect(() => {
    // Сбрасываем скролл на странице
    window.scrollTo(0, 0);
    
    // Также устанавливаем таймеры для принудительного скролла (для устройств с медленной загрузкой)
    const timer1 = setTimeout(() => window.scrollTo(0, 0), 100);
    const timer2 = setTimeout(() => window.scrollTo(0, 0), 300);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  
  // Функция для обработки установки приложения
  const handleInstall = () => {
    window.open('https://play.google.com', '_blank');
  };
  
  // Функция для обработки расшаривания
  const handleShare = () => {
    share({
      title: appData.appName,
      text: `Check out ${appData.appName} on Google Play!`,
      url: window.location.href,
    });
  };
  
  return (
    <div className="pb-16">
      <div className="flex items-center mb-4 sticky top-0 bg-white z-10 p-2 shadow-sm">
        <button 
          className="mr-2 p-1"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-medium">Google Play Market</h2>
      </div>
      
      <div className="px-4">
        <PlayMarketCard
          appName={appData.appName}
          developer={appData.developedBy}
          icon={<span className="text-white text-3xl font-bold">A</span>}
          rating={appData.rating}
          reviews={3210}
          downloads={appData.downloads}
          category={appData.category}
          contentRating="Everyone"
          onInstall={handleInstall}
          onShare={handleShare}
        />
      </div>
      
      <div className="my-6 px-4">
        <ScreenshotGallery 
          screenshots={appData.screenshots} 
          placeholderLabels={[
            "Home Screen",
            "Product Details",
            "Checkout",
            "Account Page"
          ]}
        />
      </div>
      
      <Card className="p-4 mb-6">
        <h3 className="font-medium mb-4">About this app</h3>
        <p className="text-gray-700 mb-4">
          AI Store by Aething offers a unique shopping experience powered by artificial intelligence.
          Browse our exclusive selection of AI-powered products designed to make your life easier.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-500 text-sm">Version</p>
            <p className="text-gray-900">{appData.version}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Updated on</p>
            <p className="text-gray-900">{appData.lastUpdated}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Size</p>
            <p className="text-gray-900">{appData.size}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Category</p>
            <p className="text-gray-900">{appData.category}</p>
          </div>
        </div>
        
        <h4 className="font-medium mb-2">Features:</h4>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Browse and purchase AI-powered products</li>
          <li>Secure checkout with Stripe</li>
          <li>Track your orders</li>
          <li>Multiple currency support (USD & EUR)</li>
          <li>Country-specific product recommendations</li>
          <li>Automatic tax calculation based on your country</li>
          <li>Multilingual support</li>
        </ul>
        
        <h4 className="font-medium mb-2">Tax Information:</h4>
        <p className="text-gray-700 mb-4">
          Our app automatically calculates and displays the appropriate tax rates for your country:
          <ul className="list-disc list-inside ml-4 mt-1">
            <li>Germany - MwSt. 19%</li>
            <li>France - TVA 20%</li>
            <li>Italy - IVA 22%</li>
            <li>Spain - IVA 21%</li>
            <li>USA - No sales tax applied</li>
          </ul>
        </p>
        
        <h4 className="font-medium mb-2">What's New:</h4>
        <p className="text-gray-700">
          • Added international tax calculation support<br />
          • Improved performance and stability<br />
          • Added new payment methods<br />
          • Enhanced user interface<br />
          • Multilingual support for product information<br />
          • Bug fixes and performance improvements
        </p>
      </Card>
      
      <Card className="p-4 mb-6">
        <h3 className="font-medium mb-4">Safety</h3>
        
        <div className="mb-4">
          <p className="text-gray-500 text-sm">Developer contact</p>
          <p className="text-gray-900 mb-1">{appData.developedBy}</p>
          <p className="text-blue-600 underline">support@aething.com</p>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-500 text-sm">Privacy policy</p>
          <button 
            className="text-blue-600 underline"
            onClick={() => setLocation("/policy/privacy-policy")}
          >
            View privacy policy
          </button>
        </div>
        
        <div>
          <p className="text-gray-500 text-sm">Data safety</p>
          <button 
            className="text-blue-600 underline"
            onClick={() => setLocation("/policy/data-safety")}
          >
            View data safety information
          </button>
        </div>
      </Card>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-4">Get it on</p>
        <div className="inline-block bg-black text-white py-2 px-4 rounded-lg flex items-center hover:bg-gray-800 transition cursor-pointer">
          <Play className="mr-2" size={24} />
          <div className="text-left">
            <p className="text-xs">GET IT ON</p>
            <p className="font-medium">Google Play</p>
          </div>
        </div>
      </div>
    </div>
  );
}