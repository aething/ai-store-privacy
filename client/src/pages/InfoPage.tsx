import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useLocale } from "@/context/LocaleContext";
import { getInfoPageById } from "@/constants/infoPages";
import SwipeBack from "@/components/SwipeBack";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, ChevronLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function InfoPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>("/info/:id");
  const { t } = useLocale();
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  
  // Скрыть подсказку о жесте через 5 секунд
  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

  const infoPage = params && getInfoPageById(parseInt(params.id, 10));

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Убедимся, что страница полностью прокручена вверх при первом открытии
    window.scrollTo(0, 0);
    
    // Убедимся, что контент тоже прокручен вверх
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [params?.id]);

  if (!match || !infoPage) {
    return (
      <div className="flex flex-col items-center justify-center p-4 min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-2">{t("pageNotFound")}</h1>
        <p className="text-gray-500 mb-4">{t("pageCouldNotBeFound")}</p>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setLocation("/")}
        >
          <Home className="mr-2 h-4 w-4" />
          {t("backToHome")}
        </Button>
      </div>
    );
  }

  return (
    <SwipeBack onSwipeBack={() => setLocation("/")}>
      <div className="max-w-4xl mx-auto relative">
        {/* Навигационная панель вверху - всегда видима */}
        <div className="sticky top-0 z-20 flex items-center justify-between w-full px-4 py-2 bg-white/80 backdrop-blur-sm border-b">
          <Button
            variant="ghost"
            className="flex items-center text-blue-600"
            onClick={() => setLocation("/")}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            {t("backToMain")}
          </Button>
        </div>
        
        {/* Подсказка о жесте смахивания - появляется только на мобильных */}
        {showSwipeHint && isMobile && (
          <div className="fixed top-14 right-4 z-30 bg-black/70 text-white py-1 px-3 rounded-full text-sm flex items-center animate-pulse">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("swipeHint")}
          </div>
        )}
        
        <Card className="overflow-hidden shadow-md rounded-lg mt-2">
          {/* Hero Image - вынесен за пределы прокручиваемой области */}
          <div className="w-full h-56 sm:h-72 md:h-96 bg-gray-200 overflow-hidden">
            <img
              src={infoPage.imageUrl}
              alt={infoPage.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Content - прокручиваемая область начинается после изображения */}
          <div 
            ref={contentRef}
            className="p-4 sm:p-6 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 400px)" }}
          >
            <h1 className="text-2xl font-bold mb-2">{infoPage.title}</h1>
            <p className="text-gray-500 mb-6">{infoPage.description}</p>
            
            <div 
              className="prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: infoPage.content }} 
            />
            
            <div className="mt-8 flex justify-center">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={scrollToTop}
              >
                {t("scrollToTop")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </SwipeBack>
  );
}