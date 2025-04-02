import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/context/LocaleContext";
import ShareButton from "@/components/ShareButton";
import RippleEffect from "@/components/RippleEffect";
import { useDeviceSize } from '@/hooks/use-device-size';
import AdaptiveContainer from '@/components/AdaptiveContainer';
import PlayMarketCard, { ScreenshotGallery } from '@/components/PlayMarketCard';
import { useH1Size, useH2Size, useH3Size, useBodySize } from '@/hooks/use-responsive-text';
import { Card } from '@/components/ui/card';

const AppInfo = () => {
  const { toast } = useToast();
  const { t } = useLocale();
  const [isInstalling, setIsInstalling] = useState(false);
  const { isMobile, isTablet, isLandscape } = useDeviceSize();
  
  // Адаптивные размеры текста
  const h1Size = useH1Size();
  const h2Size = useH2Size();
  const h3Size = useH3Size();
  const bodySize = useBodySize();
  
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
  
  // Функция для "поделиться"
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: appData.name,
        text: appData.description,
        url: window.location.href,
      })
      .then(() => {
        toast({
          title: "Shared successfully",
          description: "App has been shared",
        });
      })
      .catch(() => {
        toast({
          title: "Share canceled",
          description: "App sharing was canceled",
        });
      });
    } else {
      toast({
        title: "Share not supported",
        description: "Your browser does not support sharing",
        variant: "destructive",
      });
    }
  };
  
  // Адаптивный компонент для мобильных устройств
  if (isMobile) {
    return (
      <div className="pt-2 pb-6">
        {/* Карточка приложения */}
        <div className="mb-4">
          <PlayMarketCard 
            appName={appData.name}
            developer={appData.developer}
            icon={<span className="text-white font-bold text-xl text-center">AI Store</span>}
            rating={appData.rating}
            reviews={appData.reviews}
            downloads={appData.downloads}
            category={appData.category}
            contentRating={appData.contentRating}
            onInstall={handleInstall}
            onShare={handleShare}
            isInstalling={isInstalling}
          />
        </div>
        
        {/* Скриншоты */}
        <div className="px-4 mb-4">
          <ScreenshotGallery 
            screenshots={[]} // Пустые URL (будут заменены на плейсхолдеры)
            placeholderLabels={[
              'Shop Page', 
              'Product Details', 
              'Account Page', 
              'Checkout'
            ]}
          />
        </div>
        
        {/* Информация о приложении */}
        <div className="px-4">
          <Card className="p-4 mb-4">
            <h2 className={`${h2Size} font-semibold mb-3`}>{t("about") || "About this app"}</h2>
            <p className={`mb-4 ${bodySize}`}>{appData.description}</p>
            
            <h3 className={`${h3Size} font-semibold mb-2`}>{t("features") || "Features"}:</h3>
            <ul className={`list-disc list-inside mb-2 space-y-1 ${bodySize}`}>
              {appData.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </Card>
          
          <Card className="p-4 mb-4">
            <h2 className={`${h2Size} font-semibold mb-2`}>{t("whatsNew") || "What's New"}</h2>
            <p className="text-sm text-gray-600 mb-2">{t("updated") || "Updated on"} {appData.lastUpdate}</p>
            <ul className={`list-disc list-inside space-y-1 ${bodySize}`}>
              {appData.whatsNew.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </Card>
          
          <Card className="p-4 mb-4">
            <h2 className={`${h2Size} font-semibold mb-3`}>{t("additionalInfo") || "Additional Information"}</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{t("updated") || "Updated"}</span>
                <span>{appData.lastUpdate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t("size") || "Size"}</span>
                <span>{appData.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t("version") || "Version"}</span>
                <span>{appData.currentVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t("androidVersion") || "Android"}</span>
                <span>{appData.requiredAndroidVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t("inAppPurchases") || "In-app Purchases"}</span>
                <span>{appData.inAppPurchases}</span>
              </div>
            </div>
          </Card>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              © 2025 Aething Technologies Ltd. {t("allRightsReserved") || "All rights reserved"}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Для планшетов и десктопа
  return (
    <div className={`container mx-auto px-4 py-6 ${isTablet ? 'max-w-2xl' : 'max-w-4xl'}`}>
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
          <h1 className={`${h1Size} font-bold mb-2`}>{appData.name}</h1>
          <p className="text-blue-600 mb-4">{appData.developer}</p>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <div className="flex flex-wrap gap-4 justify-between">
              <div>
                <div className="flex items-center">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span 
                        key={i} 
                        className={`material-icons ${i < Math.floor(appData.rating) ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        {i < Math.floor(appData.rating) ? 'star' : 'star_border'}
                      </span>
                    ))}
                  </div>
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
          
          {/* Скриншоты */}
          <div className="mb-6">
            <ScreenshotGallery 
              screenshots={[]} // Пустые URL (будут заменены на плейсхолдеры)
              placeholderLabels={[
                'Shop Page', 
                'Product Details', 
                'Account Page', 
                'Checkout', 
                'Order Confirmation'
              ]}
            />
          </div>
          
          <div className="mb-6">
            <h2 className={`${h2Size} font-semibold mb-3`}>{t("about") || "About this app"}</h2>
            <p className={`mb-4 ${bodySize}`}>{appData.description}</p>
            
            <h3 className={`${h3Size} font-semibold mb-2`}>{t("features") || "Features"}:</h3>
            <ul className={`list-disc list-inside mb-4 space-y-1 ${bodySize}`}>
              {appData.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h2 className={`${h2Size} font-semibold mb-3`}>{t("whatsNew") || "What's New"}</h2>
            <p className="text-sm text-gray-600 mb-2">{t("updated") || "Updated on"} {appData.lastUpdate}</p>
            <ul className={`list-disc list-inside space-y-1 ${bodySize}`}>
              {appData.whatsNew.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h2 className={`${h2Size} font-semibold mb-3`}>{t("additionalInfo") || "Additional Information"}</h2>
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