import { useEffect, useState } from 'react';
import { useDeviceSize } from './use-device-size';
import { useLocation } from 'wouter';

interface SwipeOptions {
  // Минимальное расстояние свайпа для срабатывания в пикселях
  threshold?: number;
  // Максимальное время свайпа в мс
  maxTimeThreshold?: number;
  // Направления для отслеживания
  directions?: {
    left?: boolean;
    right?: boolean;
    up?: boolean;
    down?: boolean;
  };
  // Отключить навигацию по истории браузера
  disableHistoryNavigation?: boolean;
  // Вручную указать URL для перехода при свайпе в разных направлениях
  customNavigation?: {
    left?: string;
    right?: string;
    up?: string;
    down?: string;
  };
  // Коллбэки для свайпов
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface Position {
  x: number;
  y: number;
  time: number;
}

/**
 * Хук для обработки свайпов и навигации на основе жестов
 * По умолчанию свайп вправо работает как кнопка "Назад" в браузере
 */
export function useSwipeNavigation(options: SwipeOptions = {}) {
  const [, navigate] = useLocation();
  const { isMobile, isTablet, isTouchDevice } = useDeviceSize();
  
  // Настройки по умолчанию
  const {
    threshold = 100,
    maxTimeThreshold = 500,
    directions = { left: false, right: true, up: false, down: false },
    disableHistoryNavigation = false,
    customNavigation,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  } = options;
  
  // Состояние для отслеживания прикосновения
  const [touchStart, setTouchStart] = useState<Position | null>(null);
  const [touchEnd, setTouchEnd] = useState<Position | null>(null);
  
  // Применяем только для мобильных устройств с тач-экраном
  const shouldEnableSwipe = (isMobile || isTablet) && isTouchDevice;
  
  useEffect(() => {
    if (!shouldEnableSwipe) return;
    
    const handleTouchStart = (event: TouchEvent) => {
      setTouchEnd(null);
      setTouchStart({
        x: event.targetTouches[0].clientX,
        y: event.targetTouches[0].clientY,
        time: new Date().getTime(),
      });
    };
    
    const handleTouchMove = (event: TouchEvent) => {
      setTouchEnd({
        x: event.targetTouches[0].clientX,
        y: event.targetTouches[0].clientY,
        time: new Date().getTime(),
      });
    };
    
    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      // Рассчитываем расстояние и время свайпа
      const distanceX = touchStart.x - touchEnd.x;
      const distanceY = touchStart.y - touchEnd.y;
      const timeElapsed = touchEnd.time - touchStart.time;
      
      // Проверяем, было ли перемещение достаточно быстрым и длинным
      if (timeElapsed > maxTimeThreshold) return;
      
      // Определяем направление свайпа
      const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
      
      if (isHorizontalSwipe) {
        // Горизонтальный свайп
        if (distanceX > threshold && directions.left) {
          // Свайп влево
          if (onSwipeLeft) onSwipeLeft();
          if (customNavigation?.left) navigate(customNavigation.left);
        }
        
        if (distanceX < -threshold && directions.right) {
          // Свайп вправо (назад)
          if (onSwipeRight) onSwipeRight();
          if (customNavigation?.right) {
            navigate(customNavigation.right);
          } else if (!disableHistoryNavigation) {
            window.history.back();
          }
        }
      } else {
        // Вертикальный свайп
        if (distanceY > threshold && directions.up) {
          // Свайп вверх
          if (onSwipeUp) onSwipeUp();
          if (customNavigation?.up) navigate(customNavigation.up);
        }
        
        if (distanceY < -threshold && directions.down) {
          // Свайп вниз
          if (onSwipeDown) onSwipeDown();
          if (customNavigation?.down) navigate(customNavigation.down);
        }
      }
    };
    
    // Добавляем слушатели событий
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    
    // Очищаем слушатели при размонтировании
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    touchStart, 
    touchEnd, 
    threshold, 
    maxTimeThreshold, 
    directions, 
    disableHistoryNavigation,
    customNavigation,
    onSwipeLeft,
    onSwipeRight, 
    onSwipeUp, 
    onSwipeDown, 
    navigate,
    shouldEnableSwipe
  ]);
  
  return {
    swipeEnabled: shouldEnableSwipe,
  };
}