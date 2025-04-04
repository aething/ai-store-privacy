import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useLocale } from "@/context/LocaleContext";
import { getLocalizedInfoPageById, InfoPageId } from "@/locales/infopages";
import SwipeBack from "@/components/SwipeBack";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ChevronLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Footer from "@/components/Footer";

// Функция для преобразования Markdown в HTML
function markdownToHtml(markdown: string): string {
  // Заголовки
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold my-4">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold my-3">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold my-2">$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4 class="text-lg font-bold my-2">$1</h4>');

  // Списки
  html = html.replace(/^\s*\- (.*$)/gm, '<li class="ml-6 list-disc">$1</li>');
  html = html.replace(/<\/li>\n<li/g, '</li><li');
  html = html.replace(/(<li.*<\/li>)/gs, '<ul class="my-4">$1</ul>');

  // Жирный текст
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Курсив
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Ссылки
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');

  // Параграфы (пустые строки)
  html = html.replace(/\n\n/g, '</p><p class="my-3">');
  
  // Оборачиваем все в параграф
  html = '<p class="my-3">' + html + '</p>';
  
  // Исправление вложенных параграфов
  html = html.replace(/<p class="my-3"><h([1-6])/g, '<h$1');
  html = html.replace(/<\/h([1-6])><\/p>/g, '</h$1>');
  html = html.replace(/<p class="my-3"><ul/g, '<ul');
  html = html.replace(/<\/ul><\/p>/g, '</ul>');

  return html;
}

export default function InfoPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>("/info/:id");
  const { t, currentLocale } = useLocale();
  const contentRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
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

  // Получаем локализованное содержимое страницы
  const infoPage = params?.id && getLocalizedInfoPageById(params.id as InfoPageId, currentLocale);

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

  if (!match || !infoPage) {
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

  // Преобразуем Markdown в HTML
  const contentHtml = markdownToHtml(infoPage.content);

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
          
          <h1 className="text-2xl font-bold mb-6">{infoPage.title}</h1>
          
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
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