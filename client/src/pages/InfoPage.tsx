import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useLocale } from "@/context/LocaleContext";
import { getLocalizedInfoPageById, InfoPageId } from "@/locales/infopages";
import SwipeBack from "@/components/SwipeBack";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ChevronLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ReactMarkdown from "react-markdown";
import Footer from "@/components/Footer";
import { getInfoPageById } from "@/constants/infoPages";

export default function InfoPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>("/info/:id");
  const { t, currentLocale } = useLocale();
  const contentRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [pageContent, setPageContent] = useState<{ title: string; content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Получаем ID страницы
  const pageId = params?.id;
  
  // Скрыть подсказку о жесте через 5 секунд
  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

  // Загружаем данные страницы
  useEffect(() => {
    if (!pageId) {
      setIsLoading(false);
      setError("No page ID provided");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Пробуем найти в хардкодном списке, если ID - число
      const numericId = parseInt(pageId, 10);
      if (!isNaN(numericId)) {
        const staticInfoPage = getInfoPageById(numericId);
        if (staticInfoPage) {
          setPageContent({
            title: staticInfoPage.title,
            content: staticInfoPage.content
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Если не нашли в статических, ищем в локализованных данных
      const localizedPage = getLocalizedInfoPageById(pageId as InfoPageId, currentLocale);
      if (localizedPage && localizedPage.title && localizedPage.content) {
        setPageContent({
          title: localizedPage.title,
          content: localizedPage.content
        });
      } else {
        // Если страница не найдена
        setError("Page not found");
      }
    } catch (err) {
      console.error("Error loading info page:", err);
      setError(`Error loading page: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [pageId, currentLocale]);

  // Функция сброса прокрутки (вынесена отдельно для повторного использования)
  const resetScrollPosition = () => {
    // Сбрасываем глобальный скролл страницы
    window.scrollTo(0, 0);
    
    // Принудительно устанавливаем фокус на верхнюю часть страницы
    if (pageRef.current) {
      pageRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  };
  
  // Функция для плавной прокрутки наверх при нажатии кнопки
  const scrollToTop = () => {
    // Использовать плавную прокрутку для кнопки
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Скроллим к якорю
    document.getElementById('content-top')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
    
    // Гарантируем достижение верха страницы через таймаут
    setTimeout(() => {
      window.scrollTo(0, 0);
      if (pageRef.current) {
        pageRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }, 300);
  };

  useEffect(() => {
    // Сразу сбрасываем прокрутку
    resetScrollPosition();
    
    // Дополнительный сброс с таймерами для надежности
    const timer1 = setTimeout(resetScrollPosition, 50);
    const timer2 = setTimeout(resetScrollPosition, 150);
    const timer3 = setTimeout(resetScrollPosition, 300);
    const timer4 = setTimeout(resetScrollPosition, 500); // Добавляем еще один таймер для большей надежности
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [params?.id]);

  // Отображаем загрузку
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 min-h-[50vh]">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Отображаем ошибку
  if (error || !match || !pageContent) {
    return (
      <div className="flex flex-col items-center justify-center p-4 min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-2">{t("pageNotFound")}</h1>
        <p className="text-gray-500 mb-4">{t("pageCouldNotBeFound")}</p>
        <Button
          className="bg-transparent hover:bg-gray-100 text-black border-2 border-blue-600"
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
      <div className="max-w-4xl mx-auto relative" ref={pageRef}>
        {/* Навигационная панель вверху - всегда видима */}
        <div className="sticky top-0 z-20 flex items-center justify-between w-full px-4 py-2 bg-white/80 backdrop-blur-sm border-b">
          <Button
            variant="ghost"
            className="flex items-center text-black font-normal"
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
        
        <Card className="overflow-hidden shadow-md rounded-lg mt-2 p-4 sm:p-6">
          {/* Якорь для верхней части контента */}
          <div id="content-top" ref={contentRef}></div>
          
          <h1 className="text-2xl font-bold mb-6">
            {pageContent.title}
          </h1>
          
          <div className="prose max-w-none">
            <ReactMarkdown>
              {pageContent.content}
            </ReactMarkdown>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button
              className="bg-transparent hover:bg-gray-100 text-black border-2 border-blue-600"
              onClick={scrollToTop}
            >
              {t("scrollToTop")}
            </Button>
          </div>
        </Card>
        
        {/* Добавляем футер для информационных страниц */}
        <div className="mt-6">
          <Footer />
        </div>
      </div>
    </SwipeBack>
  );
}