import React, { useState, useRef, useEffect } from 'react';
import { useDeviceSize } from '@/hooks/use-device-size';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeableCarouselProps {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  showArrows?: boolean;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  infiniteLoop?: boolean;
  visibleItems?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number | string;
  onChange?: (activeIndex: number) => void;
}

/**
 * Компонент для отображения карусели с поддержкой свайпов
 * Адаптируется к размеру устройства
 */
const SwipeableCarousel: React.FC<SwipeableCarouselProps> = ({
  children,
  className = '',
  itemClassName = '',
  showArrows = true,
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  infiniteLoop = true,
  visibleItems = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 },
  gap = 16,
  onChange,
}) => {
  const { deviceSize, isMobile, isTouchDevice } = useDeviceSize();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Определяем количество видимых элементов в зависимости от размера устройства
  const getVisibleItemCount = () => {
    if (typeof visibleItems === 'number') {
      return visibleItems;
    }
    
    let count = 1; // default
    switch (deviceSize) {
      case 'xs':
        count = visibleItems.xs || 1;
        break;
      case 'sm':
        count = visibleItems.sm || 2;
        break;
      case 'md':
        count = visibleItems.md || 3;
        break;
      case 'lg':
        count = visibleItems.lg || 3;
        break;
      case 'xl':
        count = visibleItems.xl || 4;
        break;
    }
    return count;
  };
  
  const visibleItemCount = getVisibleItemCount();
  const gapSize = typeof gap === 'number' ? gap : parseInt(gap as string, 10) || 16;
  
  // Определяем ширину элемента с учетом отступов
  const getItemWidth = (): number => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.clientWidth;
    const totalGapWidth = gapSize * (visibleItemCount - 1);
    return (containerWidth - totalGapWidth) / visibleItemCount;
  };
  
  const itemWidth = getItemWidth();
  const totalItems = React.Children.count(children);
  const maxIndex = totalItems - visibleItemCount;
  
  // Обработчики событий для перетаскивания (свайпы)
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    let clientX;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    setStartX(clientX);
  };
  
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    let clientX;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const currentPosition = clientX - startX;
    setCurrentTranslate(prevTranslate + currentPosition);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    
    const movedBy = currentTranslate - prevTranslate;
    
    // Если перетаскивание было достаточно сильным, переходим к следующему/предыдущему элементу
    if (movedBy < -100 && activeIndex < maxIndex) {
      goToSlide(activeIndex + 1);
    } else if (movedBy > 100 && activeIndex > 0) {
      goToSlide(activeIndex - 1);
    } else {
      goToSlide(activeIndex);
    }
  };
  
  // Переход к определенному слайду
  const goToSlide = (index: number) => {
    // Проверяем границы
    let newIndex = index;
    
    if (infiniteLoop) {
      if (index < 0) {
        newIndex = maxIndex;
      } else if (index > maxIndex) {
        newIndex = 0;
      }
    } else {
      if (index < 0) {
        newIndex = 0;
      } else if (index > maxIndex) {
        newIndex = maxIndex;
      }
    }
    
    setActiveIndex(newIndex);
    // Рассчитываем смещение для переданного индекса
    const newTranslate = -(newIndex * (itemWidth + gapSize));
    setCurrentTranslate(newTranslate);
    setPrevTranslate(newTranslate);
    
    if (onChange) {
      onChange(newIndex);
    }
  };
  
  // Автоматическое воспроизведение
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoPlay && !isDragging) {
      interval = setInterval(() => {
        goToSlide(activeIndex + 1);
      }, autoPlayInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoPlay, autoPlayInterval, activeIndex, isDragging]);
  
  // Обновление размеров при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
      goToSlide(activeIndex);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeIndex]);
  
  // Применяем слушатели событий только для устройств с тачскрином
  const touchProps = isTouchDevice
    ? {
        onTouchStart: handleDragStart,
        onTouchMove: handleDragMove,
        onTouchEnd: handleDragEnd,
      }
    : {};
  
  // Для десктопов также добавляем поддержку мыши
  const mouseProps = !isMobile
    ? {
        onMouseDown: handleDragStart,
        onMouseMove: handleDragMove,
        onMouseUp: handleDragEnd,
        onMouseLeave: handleDragEnd,
      }
    : {};
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Карусель */}
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        {...touchProps}
        {...mouseProps}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${currentTranslate}px)`,
            gap: typeof gap === 'number' ? `${gap}px` : gap,
          }}
        >
          {React.Children.map(children, (child, index) => (
            <div
              className={`flex-shrink-0 ${itemClassName}`}
              style={{ width: `${itemWidth}px` }}
              key={index}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
      
      {/* Стрелки навигации */}
      {showArrows && totalItems > visibleItemCount && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center z-10 hover:bg-white transition-colors"
            onClick={() => goToSlide(activeIndex - 1)}
            disabled={!infiniteLoop && activeIndex === 0}
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center z-10 hover:bg-white transition-colors"
            onClick={() => goToSlide(activeIndex + 1)}
            disabled={!infiniteLoop && activeIndex === maxIndex}
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
      
      {/* Индикаторы (точки) */}
      {showDots && totalItems > visibleItemCount && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === activeIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SwipeableCarousel;