import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { useMemo, useRef } from "react";
import { getPolicyById } from "@/constants/policies";
import { useLocale } from "@/context/LocaleContext";
import SwipeBack from "@/components/SwipeBack";
import { useDeviceSize } from "@/hooks/use-device-size";
import AdaptiveContainer from "@/components/AdaptiveContainer";
import { useH1Size, useH2Size, useH3Size, useBodySize } from "@/hooks/use-responsive-text";
import { ArrowUp, X } from "lucide-react";

export default function Policy() {
  const [match, params] = useRoute("/policy/:id");
  const [, setLocation] = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();
  const { isMobile, isTablet, isLandscape } = useDeviceSize();
  
  // Адаптивные размеры текста
  const h1Size = useH1Size();
  const h2Size = useH2Size();
  const bodySize = useBodySize();
  
  const policyId = match ? params.id : null;
  
  const policy = useMemo(() => {
    if (!policyId) return null;
    return getPolicyById(policyId);
  }, [policyId]);
  
  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  if (!policy) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className={`${h2Size} font-medium`}>{t("policyNotFound") || "Policy Not Found"}</h2>
          <button 
            className="material-icons p-2 rounded-full hover:bg-gray-100"
            onClick={() => setLocation("/account")}
            aria-label="Close"
          >
            close
          </button>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <Card className="p-4">
            <p className={bodySize}>{t("policyCouldNotBeFound") || "The requested policy could not be found"}</p>
          </Card>
        </div>
      </div>
    );
  }
  
  // Особая обработка для ландшафтной ориентации на мобильных устройствах
  if (isMobile && isLandscape) {
    return (
      <SwipeBack onSwipeBack={() => setLocation("/account")}>
        <div className="w-full bg-white flex flex-col h-full">
          {/* Компактный заголовок для ландшафтного режима */}
          <div className="flex items-center justify-between p-2 border-b">
            <h2 className="text-base font-medium truncate pr-2">{policy.title}</h2>
            <button 
              className="p-1 rounded-full hover:bg-gray-100"
              onClick={() => setLocation("/account")}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Основное содержимое */}
          <div 
            ref={contentRef}
            className="flex-1 p-2 overflow-auto"
          >
            <Card className="p-3 rounded-lg">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: policy.content }} 
              />
            </Card>
            
            {/* Компактная кнопка "наверх" */}
            <div className="flex justify-center mt-4 mb-2">
              <button
                onClick={scrollToTop}
                className="bg-blue-600 text-white px-4 py-1 rounded-full flex items-center hover:bg-blue-700 text-sm"
              >
                <ArrowUp size={14} className="mr-1" />
                {t("backToTop") || "Back to Top"}
              </button>
            </div>
          </div>
        </div>
      </SwipeBack>
    );
  }
  
  // Определяем максимальную высоту контента в зависимости от устройства
  const getMaxContentHeight = () => {
    if (isMobile) return "max-h-[75vh]";
    if (isTablet) return "max-h-[70vh]";
    return "max-h-[65vh]";
  };
  
  // Стандартное отображение
  return (
    <SwipeBack onSwipeBack={() => setLocation("/account")}>
      <div className="w-full max-w-4xl mx-auto bg-white flex flex-col min-h-screen sm:min-h-0 sm:rounded-lg sm:shadow-lg sm:my-4">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className={`${h2Size} font-medium`}>{policy.title}</h2>
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setLocation("/account")}
            aria-label="Close"
          >
            <X size={isMobile ? 20 : 24} />
          </button>
        </div>
        
        {/* Вспомогательная подсказка для свайпа - только на мобильных устройствах */}
        <AdaptiveContainer mobileOnly>
          <div className="text-gray-400 text-xs text-center py-1 border-b">
            <span className="material-icons text-xs align-text-bottom mr-1">swipe</span>
            {t("swipeRightToGoBack") || "Swipe right to go back"}
          </div>
        </AdaptiveContainer>
        
        {/* Scrollable content area */}
        <div 
          ref={contentRef}
          className={`flex-1 p-4 overflow-auto ${getMaxContentHeight()}`}
        >
          <Card className="p-4 rounded-lg">
            <div 
              className={`prose max-w-none ${isMobile ? 'prose-sm' : 'prose-base'} ${bodySize}`}
              dangerouslySetInnerHTML={{ __html: policy.content }} 
            />
          </Card>
          
          {/* Back to top button */}
          <div className="flex justify-center mt-6 mb-4">
            <button
              onClick={scrollToTop}
              className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center hover:bg-blue-700"
            >
              <ArrowUp size={isMobile ? 16 : 20} className="mr-1" />
              {t("backToTop") || "Back to Top"}
            </button>
          </div>
        </div>
      </div>
    </SwipeBack>
  );
}
