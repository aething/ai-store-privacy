import { ReactNode, useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useLocation } from 'wouter';

interface SwipeBackProps {
  children: ReactNode;
  onSwipeBack?: () => void;
  threshold?: number;
}

export default function SwipeBack({ 
  children, 
  onSwipeBack,
  threshold = 100 
}: SwipeBackProps) {
  const [, navigate] = useLocation();
  const [startX, setStartX] = useState<number | null>(null);
  const [opacity, setOpacity] = useState<number>(1);

  // Настройка обработчиков свайпа
  const handlers = useSwipeable({
    onSwipeStart: (eventData) => {
      if (eventData.dir === 'Right') {
        setStartX(eventData.initial[0]);
      }
    },
    onSwiping: (eventData) => {
      if (startX && eventData.dir === 'Right') {
        const delta = eventData.deltaX;
        // Изменяем прозрачность во время свайпа для визуальной обратной связи
        const newOpacity = Math.max(1 - (delta / window.innerWidth) * 1.5, 0.3);
        setOpacity(newOpacity);
      }
    },
    onSwiped: (eventData) => {
      if (startX && eventData.dir === 'Right' && eventData.deltaX > threshold) {
        // Если свайп достаточно длинный, выполняем действие назад
        if (onSwipeBack) {
          onSwipeBack();
        } else {
          // По умолчанию возвращаемся на предыдущую страницу
          window.history.back();
        }
      }
      
      // Сбрасываем состояние
      setStartX(null);
      setOpacity(1);
    },
    trackMouse: false, // Отслеживать только сенсорные события
    preventScrollOnSwipe: true
  });

  // Добавим обработчик клавиши "Назад" для Android
  useEffect(() => {
    const handleBackButton = (e: any) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        if (onSwipeBack) {
          onSwipeBack();
        } else {
          window.history.back();
        }
      }
    };

    window.addEventListener('keydown', handleBackButton);
    return () => window.removeEventListener('keydown', handleBackButton);
  }, [onSwipeBack]);

  return (
    <div 
      {...handlers} 
      style={{ 
        opacity, 
        transition: startX ? 'none' : 'opacity 0.3s ease',
        height: '100%',
        width: '100%'
      }}
    >
      {children}
    </div>
  );
}