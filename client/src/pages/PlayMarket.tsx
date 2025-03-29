import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { ArrowLeft, ChevronLeft, ChevronRight, Share, Download, Play } from "lucide-react";

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
  
  // Пример данных для Google Play Market
  const [appData, setAppData] = useState<PlayMarketData>({
    appName: "AI Store by Aething",
    rating: 4.7,
    downloads: "100,000+",
    version: "1.2.0",
    lastUpdated: "March 20, 2025",
    size: "15 MB",
    category: "Shopping",
    developedBy: "Aething Technologies",
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
  
  // Функция для отображения рейтинга в виде звезд
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-yellow-500 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-yellow-500 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27V2z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-5 h-5 text-gray-300 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
          </svg>
        );
      }
    }
    
    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-2 text-gray-700">{rating.toFixed(1)}</span>
      </div>
    );
  };
  
  // Для пролистывания скриншотов
  const nextScreenshot = () => {
    setActiveScreenshot((prev) => 
      prev === appData.screenshots.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevScreenshot = () => {
    setActiveScreenshot((prev) => 
      prev === 0 ? appData.screenshots.length - 1 : prev - 1
    );
  };
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="pb-16">
      <div className="flex items-center mb-4 sticky top-0 bg-white z-10 p-2">
        <button 
          className="mr-2 p-1"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-medium">Google Play Market</h2>
      </div>
      
      <div className="flex items-center mb-6">
        <div className="w-20 h-20 bg-blue-600 rounded-xl flex items-center justify-center overflow-hidden mr-4">
          <span className="text-white text-3xl font-bold">A</span>
        </div>
        
        <div>
          <h1 className="text-xl font-bold">{appData.appName}</h1>
          <p className="text-green-600 text-sm">{appData.developedBy}</p>
          <p className="text-xs text-gray-500">Contains ads • In-app purchases</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          {renderStars(appData.rating)}
          <span className="text-gray-500 text-sm">{appData.downloads} downloads</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            className="bg-blue-600 text-white py-2 px-4 rounded-full flex items-center justify-center text-sm font-medium hover:bg-blue-700 transition md-btn-effect"
            onClick={() => window.open('https://play.google.com', '_blank')}
          >
            <Download className="mr-1 w-4 h-4" />
            Install
          </button>
          
          <button className="border border-gray-300 py-2 px-4 rounded-full flex items-center justify-center text-sm font-medium hover:bg-gray-50 transition">
            <Share className="mr-1 w-4 h-4" />
            Share
          </button>
        </div>
      </div>
      
      <Card className="overflow-hidden mb-6 relative">
        <div className="relative h-[500px] overflow-hidden">
          <img 
            src={appData.screenshots[activeScreenshot]}
            alt={`Screenshot ${activeScreenshot + 1}`}
            className="w-full h-full object-contain"
          />
          
          <button 
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center shadow-md"
            onClick={prevScreenshot}
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center shadow-md"
            onClick={nextScreenshot}
          >
            <ChevronRight size={24} />
          </button>
          
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            {appData.screenshots.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 mx-1 rounded-full ${idx === activeScreenshot ? 'bg-blue-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </Card>
      
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
        </ul>
        
        <h4 className="font-medium mb-2">What's New:</h4>
        <p className="text-gray-700">
          • Improved performance and stability<br />
          • Added new payment methods<br />
          • Enhanced user interface<br />
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
        
        <div>
          <p className="text-gray-500 text-sm">Privacy policy</p>
          <button 
            className="text-blue-600 underline"
            onClick={() => setLocation("/policy/privacy")}
          >
            View privacy policy
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