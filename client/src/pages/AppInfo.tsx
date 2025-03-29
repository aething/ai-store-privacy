import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/context/LocaleContext";
import ShareButton from "@/components/ShareButton";
import RippleEffect from "@/components/RippleEffect";

const AppInfo = () => {
  const { toast } = useToast();
  const { t } = useLocale();
  const [isInstalling, setIsInstalling] = useState(false);
  
  // Данные приложения
  const appData = {
    name: "AI Store by Aething",
    developer: "Aething Technologies Ltd.",
    category: "Shopping",
    rating: 4.7,
    reviews: 1254,
    downloads: "100K+",
    lastUpdate: "March 15, 2025",
    size: "15 MB",
    currentVersion: "2.3.1",
    requiredAndroidVersion: "6.0 and up",
    inAppPurchases: "Yes",
    contentRating: "Everyone",
    offeredBy: "Aething Technologies Ltd.",
    description: t("appDescription") || "AI Store by Aething is an innovative e-commerce platform that leverages artificial intelligence to provide personalized shopping experiences. Browse our curated selection of AI-enhanced products, manage your account, and enjoy seamless checkout with Stripe integration.",
    whatsNew: [
      t("whatsNew1") || "Improved performance and stability",
      t("whatsNew2") || "New user interface with Material Design 3.0",
      t("whatsNew3") || "Added multiple payment methods",
      t("whatsNew4") || "Enhanced product search and filtering",
      t("whatsNew5") || "Bug fixes and improvements"
    ],
    screenshots: [
      "/screenshots/screenshot1.png",
      "/screenshots/screenshot2.png",
      "/screenshots/screenshot3.png",
      "/screenshots/screenshot4.png"
    ],
    features: [
      t("feature1") || "Browse AI-enhanced products with detailed descriptions",
      t("feature2") || "Secure checkout with Stripe integration",
      t("feature3") || "Manage your account and orders",
      t("feature4") || "Multiple language support",
      t("feature5") || "Dark mode support",
      t("feature6") || "Offline mode with caching"
    ]
  };
  
  // Эффект для обработки установки PWA
  useEffect(() => {
    let deferredPrompt: any;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      // Предотвращаем показ стандартного диалога установки
      e.preventDefault();
      // Сохраняем событие, чтобы показать его позже
      deferredPrompt = e;
    });
    
    // Делаем deferredPrompt доступным глобально для кнопки установки
    (window as any).deferredPrompt = deferredPrompt;
  }, []);
  
  // Функция установки приложения
  const handleInstall = async () => {
    const deferredPrompt = (window as any).deferredPrompt;
    
    // Если приложение запущено в браузере и доступно для установки
    if (deferredPrompt) {
      setIsInstalling(true);
      
      try {
        // Показываем диалог установки
        deferredPrompt.prompt();
        // Ожидаем выбора пользователя
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the installation');
          toast({
            title: t("installSuccess") || "Installation started",
            description: t("installSuccessDesc") || "Thank you for installing our app!",
          });
        } else {
          console.log('User dismissed the installation');
        }
        
        // Очищаем запрос, так как он может быть использован только один раз
        (window as any).deferredPrompt = null;
      } catch (error) {
        console.error('Installation error:', error);
        toast({
          title: t("installError") || "Installation error",
          description: t("installErrorDesc") || "Failed to install the app. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Если установка недоступна, перенаправляем на Google Play
      window.open('https://play.google.com/store/apps/details?id=com.aething.aistore', '_blank');
    }
  };
  
  // Рендеринг звездного рейтинга
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="material-icons text-yellow-500">star</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="material-icons text-yellow-500">star_half</span>);
      } else {
        stars.push(<span key={i} className="material-icons text-gray-300">star_border</span>);
      }
    }
    
    return <div className="flex">{stars}</div>;
  };
  
  // Рендеринг галереи скриншотов
  const renderScreenshots = () => {
    return (
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4">
          {appData.screenshots.map((screenshot, index) => (
            <div key={index} className="flex-shrink-0 w-40 h-80 bg-gray-200 rounded-lg overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <span className="material-icons text-4xl">image</span>
                <span className="ml-2">Screenshot {index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Левая колонка - иконка и кнопки */}
        <div className="flex flex-col items-center md:items-start">
          <div className="w-32 h-32 bg-primary rounded-3xl overflow-hidden shadow-lg mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-2xl text-center">AI Store</span>
          </div>
          
          <RippleEffect>
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="md-btn-primary w-full max-w-xs mb-3 flex items-center justify-center"
            >
              {isInstalling ? (
                <span className="material-icons animate-spin mr-2">refresh</span>
              ) : (
                <span className="material-icons mr-2">get_app</span>
              )}
              {t("installFromPlayStore") || "Install from Google Play"}
            </button>
          </RippleEffect>
          
          <ShareButton 
            title={appData.name} 
            text={appData.description}
            className="w-full max-w-xs"
          />
        </div>
        
        {/* Правая колонка - информация о приложении */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">{appData.name}</h1>
          <p className="text-blue-600 mb-4">{appData.developer}</p>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <div className="flex flex-wrap gap-4 justify-between">
              <div>
                <div className="flex items-center">
                  {renderStars(appData.rating)}
                  <span className="ml-2 text-lg font-semibold">{appData.rating}</span>
                </div>
                <p className="text-sm text-gray-600">{appData.reviews} {t("reviews") || "reviews"}</p>
              </div>
              
              <div className="text-center">
                <p className="text-lg font-semibold">{appData.downloads}</p>
                <p className="text-sm text-gray-600">{t("downloads") || "downloads"}</p>
              </div>
              
              <div className="text-center">
                <span className="material-icons text-gray-700">category</span>
                <p className="text-sm text-gray-600">{appData.category}</p>
              </div>
              
              <div className="text-center">
                <span className="material-icons text-gray-700">verified_user</span>
                <p className="text-sm text-gray-600">{appData.contentRating}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">{t("about") || "About this app"}</h2>
            <p className="mb-4">{appData.description}</p>
            
            <h3 className="font-semibold mb-2">{t("features") || "Features"}:</h3>
            <ul className="list-disc list-inside mb-4 space-y-1">
              {appData.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">{t("whatsNew") || "What's New"}</h2>
            <p className="text-sm text-gray-600 mb-2">{t("updated") || "Updated on"} {appData.lastUpdate}</p>
            <ul className="list-disc list-inside space-y-1">
              {appData.whatsNew.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">{t("screenshots") || "Screenshots"}</h2>
            {renderScreenshots()}
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">{t("additionalInfo") || "Additional Information"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">{t("updated") || "Updated"}</p>
                <p>{appData.lastUpdate}</p>
              </div>
              <div>
                <p className="text-gray-600">{t("size") || "Size"}</p>
                <p>{appData.size}</p>
              </div>
              <div>
                <p className="text-gray-600">{t("version") || "Current Version"}</p>
                <p>{appData.currentVersion}</p>
              </div>
              <div>
                <p className="text-gray-600">{t("androidVersion") || "Android Version"}</p>
                <p>{appData.requiredAndroidVersion}</p>
              </div>
              <div>
                <p className="text-gray-600">{t("inAppPurchases") || "In-app Purchases"}</p>
                <p>{appData.inAppPurchases}</p>
              </div>
              <div>
                <p className="text-gray-600">{t("offeredBy") || "Offered By"}</p>
                <p>{appData.offeredBy}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              © 2025 Aething Technologies Ltd. {t("allRightsReserved") || "All rights reserved"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppInfo;