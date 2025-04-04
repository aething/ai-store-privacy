import { useLocation } from "wouter";
import { InfoPage } from "@/types";
import InfoPageCard from "./InfoPageCard";
import { useLocale } from "@/context/LocaleContext";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InfoPageTranslations } from "@/locales/infopages";

// Определяем расширенный тип для переводов с добавлением id
type ExtendedInfoPageTranslations = InfoPageTranslations & {
  id: string | number;
};

// Определяем универсальный тип для информационных страниц
type UniversalInfoPage = InfoPage | ExtendedInfoPageTranslations | { 
  id: string | number;
  title: string;
  description?: string;
  content?: string;
};

interface InfoPageSliderProps {
  title: string;
  infoPages: UniversalInfoPage[];
  titleKey?: string; // Ключ для локализации заголовка
}

export default function InfoPageSlider({ title, infoPages, titleKey }: InfoPageSliderProps) {
  const [, setLocation] = useLocation();
  const { t, currentLocale } = useLocale();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Проверяем, что infoPages существует и является массивом
  if (!infoPages || !Array.isArray(infoPages)) {
    console.error('InfoPageSlider: infoPages is not an array', infoPages);
    return null;
  }
  
  // Фильтруем страницы, удаляя невалидные страницы
  const validInfoPages = infoPages.filter(page => {
    if (!page) return false;
    
    // Проверяем наличие обязательных полей
    if (!('id' in page) || !page.id) {
      console.error('InfoPage missing id:', page);
      return false;
    }
    
    if (!('title' in page) || !page.title) {
      console.error('InfoPage missing title:', page);
      return false;
    }
    
    return true;
  });
  
  if (validInfoPages.length === 0) {
    console.log('No valid info pages to display');
    return null;
  }

  // Обработчик начала свайпа
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  // Обработчик начала свайпа на мобильных устройствах
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  // Обработчик движения при свайпе
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Скорость прокрутки
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  // Обработчик движения при свайпе на мобильных устройствах
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Скорость прокрутки
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  // Обработчик окончания свайпа
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Обработчик окончания свайпа на мобильных устройствах
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Обработчик выхода курсора за пределы элемента
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="mb-8 relative">
      <h2 className="text-lg font-medium mb-4">
        {titleKey ? t(titleKey) : title}
      </h2>
      <div 
        ref={sliderRef}
        id="info-pages-scroll"
        className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-hide cursor-grab"
        style={{ 
          scrollSnapType: 'x mandatory', 
          scrollBehavior: 'smooth',
          userSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {validInfoPages.map((infoPage) => {
          // Получаем ID для ключа, безопасно проверяя его наличие
          const key = infoPage && 'id' in infoPage && infoPage.id 
            ? infoPage.id.toString() 
            : Math.random().toString();
            
          // Безопасно отрисовываем карточку
          return (
            <InfoPageCard 
              key={key} 
              infoPage={infoPage} 
            />
          );
        })}
      </div>
      
      {validInfoPages.length > 2 && (
        <>
          <button
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-full shadow-md p-1 z-10"
            onClick={() => {
              if (sliderRef.current) {
                sliderRef.current.scrollBy({ left: -280, behavior: 'smooth' });
              }
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white rounded-full shadow-md p-1 z-10"
            onClick={() => {
              if (sliderRef.current) {
                sliderRef.current.scrollBy({ left: 280, behavior: 'smooth' });
              }
            }}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
}