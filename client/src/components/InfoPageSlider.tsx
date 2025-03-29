import { useLocation } from "wouter";
import { InfoPage } from "@/types";
import InfoPageCard from "./InfoPageCard";
import { useLocale } from "@/context/LocaleContext";
import { useEffect, useRef, useState } from "react";

interface InfoPageSliderProps {
  title: string;
  infoPages: InfoPage[];
}

export default function InfoPageSlider({ title, infoPages }: InfoPageSliderProps) {
  const [, setLocation] = useLocation();
  const { t } = useLocale();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  if (!infoPages || infoPages.length === 0) {
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
      <h2 className="text-lg font-medium mb-4">{title}</h2>
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
        {infoPages.map((infoPage) => (
          <InfoPageCard 
            key={infoPage.id} 
            infoPage={infoPage} 
          />
        ))}
      </div>
      
      {infoPages.length > 2 && (
        <>
          <button
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-full shadow-md p-1 z-10"
            onClick={() => {
              if (sliderRef.current) {
                sliderRef.current.scrollBy({ left: -280, behavior: 'smooth' });
              }
            }}
          >
            <span className="material-icons">chevron_left</span>
          </button>
          <button
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white rounded-full shadow-md p-1 z-10"
            onClick={() => {
              if (sliderRef.current) {
                sliderRef.current.scrollBy({ left: 280, behavior: 'smooth' });
              }
            }}
          >
            <span className="material-icons">chevron_right</span>
          </button>
        </>
      )}
    </div>
  );
}