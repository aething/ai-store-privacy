import { useCallback, useEffect, useState } from 'react';
import { ArrowUp } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

interface SimpleScrollToTopProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  contentRef?: React.RefObject<HTMLElement>;
}

/**
 * Простая кнопка для прокрутки страницы наверх
 * Минималистичная реализация, не зависит от сложной логики управления скроллом
 */
export default function SimpleScrollToTop({ 
  className = "", 
  size = "md", 
  showText = true,
  contentRef
}: SimpleScrollToTopProps) {
  const { t } = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  
  // Определяем размер иконки и кнопки в зависимости от параметра size
  const iconSize = 
    size === "sm" ? 14 : 
    size === "lg" ? 24 : 18;
  
  const paddingClass = 
    size === "sm" ? "px-4 py-1" : 
    size === "lg" ? "px-8 py-3" : "px-6 py-2";
  
  // Проверка необходимости показа кнопки на основе позиции скролла
  useEffect(() => {
    const checkScrollPosition = () => {
      // Проверяем позицию основного скролла окна
      const windowScroll = window.scrollY || window.pageYOffset;
      
      // Проверяем позицию скролла контейнера, если он передан
      let containerScroll = 0;
      if (contentRef?.current) {
        containerScroll = contentRef.current.scrollTop;
      }
      
      // Показываем кнопку, если хотя бы один из скроллов больше 200px
      if (windowScroll > 200 || containerScroll > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    // Устанавливаем обработчики событий для обоих скроллов
    window.addEventListener('scroll', checkScrollPosition);
    
    if (contentRef?.current) {
      contentRef.current.addEventListener('scroll', checkScrollPosition);
    }
    
    // Проверяем сразу при монтировании
    checkScrollPosition();
    
    // Чистим при размонтировании
    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
      
      if (contentRef?.current) {
        contentRef.current.removeEventListener('scroll', checkScrollPosition);
      }
    };
  }, [contentRef]);
  
  // Улучшенная функция для прокрутки вверх
  const scrollToTop = useCallback(() => {
    console.log('[SimpleScrollToTop] Прокрутка наверх');
    
    // Определяем, нужно ли прокручивать контейнер или весь документ
    const scrollContainer = contentRef?.current;
    const isContainerScrollable = scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight;
    
    if (isContainerScrollable) {
      // Если контейнер прокручиваемый, приоритетно скроллим его
      console.log('[SimpleScrollToTop] Скроллим контейнер');
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // Иначе прокручиваем окно браузера и основные элементы страницы
      console.log('[SimpleScrollToTop] Скроллим окно');
      
      // Используем несколько методов для максимальной совместимости
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      document.documentElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      document.body.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [contentRef]);
  
  // Показываем кнопку только если нужно прокручивать вверх (на основе стиля)
  return (
    <button
      onClick={scrollToTop}
      aria-label={t("backToTop")}
      className={`bg-blue-600 text-white ${paddingClass} rounded-full flex items-center hover:bg-blue-700 
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        transition-opacity duration-300 
        ${className}`}
    >
      <ArrowUp size={iconSize} className={showText ? "mr-1" : ""} />
      {showText && <span>{t("backToTop")}</span>}
    </button>
  );
}