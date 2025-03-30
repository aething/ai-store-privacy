import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: React.ReactNode;
  location?: string;
  className?: string;
  transitionType?: 'fade' | 'slide' | 'zoom' | 'none';
  duration?: number;
}

/**
 * Компонент для анимированных переходов между страницами
 */
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  transitionType = 'fade', // тип анимации
  duration = 300, // длительность анимации в мс
}) => {
  const [location] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(location);
  const [content, setContent] = useState(children);
  
  // Функция для скроллинга страницы вверх
  const scrollToTop = () => {
    // Принудительно скроллим обычное окно
    window.scrollTo(0, 0);
    
    // Также пытаемся найти родительские элементы с прокруткой и сбросить их
    const scrollableElements = document.querySelectorAll('.overflow-auto, .overflow-y-auto, [style*="overflow-y: auto"]');
    scrollableElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.scrollTop = 0;
      }
    });
    
    // Если есть элемент с id="content-top", скроллим к нему
    document.getElementById('content-top')?.scrollIntoView({ 
      behavior: 'auto', 
      block: 'start' 
    });
  };
  
  // При изменении маршрута или содержимого
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Если маршрут изменился
    if (currentPage !== location) {
      // Запускаем анимацию исчезновения
      setIsVisible(false);
      
      // Принудительно скроллим вверх при изменении страницы
      scrollToTop();
      
      // После окончания анимации исчезновения
      timeoutId = setTimeout(() => {
        // Обновляем содержимое и текущий маршрут
        setContent(children);
        setCurrentPage(location);
        
        // Запускаем анимацию появления
        requestAnimationFrame(() => {
          setIsVisible(true);
          // Еще раз скроллим вверх после обновления содержимого
          scrollToTop();
        });
        
        // Дополнительно скроллим через небольшие промежутки времени для надежности
        setTimeout(scrollToTop, 100);
        setTimeout(scrollToTop, 300);
      }, duration);
    } else if (!isVisible) {
      // Если содержимое изменилось, но маршрут тот же
      setContent(children);
      requestAnimationFrame(() => {
        setIsVisible(true);
        // Скроллим вверх при изменении содержимого
        scrollToTop();
      });
    } else {
      // Просто обновляем содержимое
      setContent(children);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [children, location]);
  
  // Определяем классы анимации в зависимости от выбранного типа перехода
  let transitionClass = '';
  let animationClass = '';
  
  switch (transitionType) {
    case 'fade':
      transitionClass = `transition-opacity duration-${duration}`;
      animationClass = isVisible ? 'opacity-100' : 'opacity-0';
      break;
      
    case 'slide':
      transitionClass = `transition-transform duration-${duration}`;
      animationClass = isVisible 
        ? 'translate-x-0' 
        : currentPage === location ? 'translate-x-full' : '-translate-x-full';
      break;
      
    case 'zoom':
      transitionClass = `transition-all duration-${duration}`;
      animationClass = isVisible 
        ? 'scale-100 opacity-100' 
        : 'scale-95 opacity-0';
      break;
      
    case 'none':
    default:
      break;
  }
  
  return (
    <div 
      className={`${transitionClass} ${animationClass} ${className}`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material Design стандартная кривая
      }}
    >
      {content}
    </div>
  );
};

export default PageTransition;