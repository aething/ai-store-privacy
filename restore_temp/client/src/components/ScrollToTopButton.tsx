import { ArrowUp } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { scrollToTop, scrollContainerToTop, clearScrollPosition } from "@/lib/scrollUtils";

interface ScrollToTopButtonProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  contentRef?: React.RefObject<HTMLElement>;
}

/**
 * Кнопка для прокрутки страницы наверх
 * Автоматически использует глобальную утилиту scrollToTop
 */
export default function ScrollToTopButton({ 
  className = "", 
  size = "md", 
  showText = true,
  contentRef
}: ScrollToTopButtonProps) {
  const { t } = useLocale();
  
  // Определяем размер иконки и кнопки в зависимости от параметра size
  const iconSize = 
    size === "sm" ? 14 : 
    size === "lg" ? 24 : 18;
  
  const paddingClass = 
    size === "sm" ? "px-4 py-1" : 
    size === "lg" ? "px-8 py-3" : "px-6 py-2";
  
  const handleClick = () => {
    console.log('[ScrollToTopButton] Clicked', contentRef?.current ? 'with ref' : 'no ref');
    
    // На странице Account кнопка не используется, но на всякий случай
    if (window.location.pathname === '/account') {
      scrollToTop(true);
      return;
    }
    
    // Для страницы Policy используем особую логику
    if (window.location.pathname.includes('/policy/')) {
      // Если есть контейнер, скроллим его наверх
      if (contentRef?.current) {
        scrollContainerToTop(contentRef, true);
      } else {
        scrollToTop(true);
      }
      
      // Дополнительно для Policy страницы - проверяем наличие якоря
      if ((window as any).policyTopAnchor) {
        setTimeout(() => {
          console.log('[ScrollToTopButton] Scrolling to policy top anchor');
          try {
            (window as any).policyTopAnchor.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          } catch (e) {
            console.error('[ScrollToTopButton] Error scrolling to anchor:', e);
          }
        }, 100);
      }
      
      return;
    }
    
    // Для других страниц просто скроллим наверх
    scrollToTop(true);
  };
  
  return (
    <button
      onClick={handleClick}
      className={`bg-blue-600 text-white ${paddingClass} rounded-full flex items-center hover:bg-blue-700 ${className}`}
    >
      <ArrowUp size={iconSize} className={showText ? "mr-1" : ""} />
      {showText && <span>{t("backToTop")}</span>}
    </button>
  );
}