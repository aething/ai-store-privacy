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
    // Если передан ref на скроллящийся контейнер, просто скроллим его
    if (contentRef?.current) {
      contentRef.current.scrollTop = 0;
    } else {
      // В противном случае используем простую прокрутку страницы
      window.scrollTo(0, 0);
    }
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