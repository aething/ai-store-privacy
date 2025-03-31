import { ArrowUp } from "lucide-react";
import { scrollToTop } from "@/lib/scrollUtils";
import { useLocale } from "@/context/LocaleContext";

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
    // Используем плавную прокрутку только для контентного div, если он передан
    if (contentRef?.current) {
      // Получаем высоту прокрутки элемента
      const scrollTop = contentRef.current.scrollTop;
      
      // Если есть что прокручивать (элемент не в самом верху)
      if (scrollTop > 0) {
        // Используем плавную прокрутку только для контейнера контента
        contentRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        return; // Выходим, чтобы избежать конфликтов с общей прокруткой
      }
    }
    
    // Используем глобальную утилиту для прокрутки самой страницы
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