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

  // Функция для выполнения перехода назад
  const executeNavBack = () => {
    // Сначала прокручиваем окно на самый верх для страницы, на которую вернёмся
    window.scrollTo(0, 0);
    
    // Затем выполняем переход назад
    if (onSwipeBack) {
      // Задержка для синхронизации скролла и перехода
      setTimeout(() => {
        onSwipeBack();
      }, 50);
    } else {
      // По умолчанию возвращаемся на предыдущую страницу
      setTimeout(() => {
        window.history.back();
      }, 50);
    }
  };

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
        // Выполняем переход назад с помощью нашей улучшенной функции
        executeNavBack();
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
        // Используем улучшенную функцию перехода
        executeNavBack();
      }
    };

    window.addEventListener('keydown', handleBackButton);
    return () => window.removeEventListener('keydown', handleBackButton);
  }, [onSwipeBack]);
  
  // При монтировании компонента скроллим страницу в начало
  useEffect(() => {
    // Сбрасываем скролл на странице
    window.scrollTo(0, 0);
    
    // Также устанавливаем таймеры для принудительного скролла (для устройств с медленной загрузкой)
    const timer1 = setTimeout(() => window.scrollTo(0, 0), 100);
    const timer2 = setTimeout(() => window.scrollTo(0, 0), 300);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

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