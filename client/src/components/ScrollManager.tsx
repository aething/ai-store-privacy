import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

/**
 * ScrollManager - компонент для управления позицией скролла на страницах.
 * 
 * Принцип работы:
 * 1. Компонент отслеживает изменения URL
 * 2. При изменении URL определяет, была ли это навигация на новую страницу или назад
 * 3. На основе этого либо сбрасывает скролл в начало, либо восстанавливает сохраненную позицию
 * 4. Позиции скролла хранятся в sessionStorage по каждому пути отдельно
 */
export default function ScrollManager() {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  const scrollRestoredRef = useRef<boolean>(false);

  // Сохранение позиции скролла при скроллинге
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const path = window.location.pathname;
      
      // Не сохраняем позицию для Policy страниц
      if (path.startsWith('/policy/')) {
        return;
      }
      
      // Сохраняем позицию скролла для текущего пути
      sessionStorage.setItem(`scroll-${path}`, scrollY.toString());
      console.log(`[ScrollManager] Сохранена позиция скролла для ${path}: ${scrollY}px`);
    };

    // Используем throttle для оптимизации
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, []);

  // Восстановление позиции скролла при изменении URL
  useEffect(() => {
    // Если это первая загрузка страницы, устанавливаем предыдущий путь
    if (prevLocationRef.current === location) {
      console.log(`[ScrollManager] Первая загрузка: ${location}`);
      prevLocationRef.current = location;
      return;
    }
    
    console.log(`[ScrollManager] Изменение пути: ${prevLocationRef.current} -> ${location}`);
    
    const fromPolicyToAccount = 
      prevLocationRef.current.startsWith('/policy/') && 
      location === '/account';
    
    const fromAccountToPolicy = 
      prevLocationRef.current === '/account' && 
      location.startsWith('/policy/');
    
    // Если переходим на страницу Policy - скролл в начало
    if (location.startsWith('/policy/')) {
      console.log(`[ScrollManager] Переход на страницу Policy: скролл в начало`);
      window.scrollTo(0, 0);
    }
    // Если возвращаемся со страницы Policy на Account - восстанавливаем позицию
    else if (fromPolicyToAccount) {
      // Запоминаем, что уже восстановили позицию, чтобы не делать это дважды
      if (!scrollRestoredRef.current) {
        scrollRestoredRef.current = true;
        
        // Восстанавливаем позицию с задержкой
        setTimeout(() => {
          const savedPosition = sessionStorage.getItem(`scroll-/account`);
          if (savedPosition) {
            const scrollY = parseInt(savedPosition, 10);
            console.log(`[ScrollManager] Восстановление позиции для Account: ${scrollY}px`);
            window.scrollTo(0, scrollY);
          } else {
            console.log(`[ScrollManager] Нет сохраненной позиции для Account`);
          }
          
          // Сбрасываем флаг, когда позиция восстановлена
          setTimeout(() => {
            scrollRestoredRef.current = false;
          }, 100);
        }, 100);
      }
    }
    // Для других страниц (не Policy) - скролл в начало
    else if (!location.startsWith('/policy/') && !fromPolicyToAccount) {
      console.log(`[ScrollManager] Переход на страницу ${location}: скролл в начало`);
      window.scrollTo(0, 0);
    }

    // Обновляем предыдущий путь
    prevLocationRef.current = location;
  }, [location]);

  // Никакой визуальной части - это компонент для управления скроллом
  return null;
}