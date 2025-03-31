import { useCallback } from 'react';
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
  
  // Определяем размер иконки и кнопки в зависимости от параметра size
  const iconSize = 
    size === "sm" ? 14 : 
    size === "lg" ? 24 : 18;
  
  const paddingClass = 
    size === "sm" ? "px-4 py-1" : 
    size === "lg" ? "px-8 py-3" : "px-6 py-2";
  
  // Простая функция для прокрутки вверх
  const scrollToTop = useCallback(() => {
    console.log('[SimpleScrollToTop] Прокрутка наверх');
    
    // Скроллим окно браузера
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Если передан ref для контента, скроллим его тоже
    if (contentRef?.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      console.log('[SimpleScrollToTop] Также скроллим контейнер');
    }
  }, [contentRef]);
  
  return (
    <button
      onClick={scrollToTop}
      className={`bg-blue-600 text-white ${paddingClass} rounded-full flex items-center hover:bg-blue-700 ${className}`}
    >
      <ArrowUp size={iconSize} className={showText ? "mr-1" : ""} />
      {showText && <span>{t("backToTop")}</span>}
    </button>
  );
}