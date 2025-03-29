import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/context/LocaleContext";
import RippleEffect from "@/components/RippleEffect";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  text,
  url = window.location.href,
  className = '',
  variant = 'primary'
}) => {
  const { toast } = useToast();
  const { t } = useLocale();
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  
  // Получаем классы в зависимости от варианта
  const getButtonClass = () => {
    switch (variant) {
      case 'primary':
        return 'md-btn-primary';
      case 'secondary':
        return 'md-btn-secondary';
      case 'outline':
        return 'md-btn-outlined';
      default:
        return 'md-btn-primary';
    }
  };
  
  const handleShare = async () => {
    // Проверяем поддержку Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        
        toast({
          title: t("shareSuccess") || "Shared successfully",
          description: t("shareSuccessDesc") || "Content has been shared",
        });
      } catch (error) {
        console.error("Sharing failed:", error);
        // Пользователь отменил действие или произошла ошибка
        if (error instanceof Error && error.name !== "AbortError") {
          toast({
            title: t("shareError") || "Sharing failed",
            description: t("shareErrorDesc") || "Could not share the content",
            variant: "destructive"
          });
        }
      }
    } else {
      // Если Web Share API не поддерживается, показываем свое меню
      setIsShareMenuOpen(!isShareMenuOpen);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: t("copied") || "Copied to clipboard",
        description: t("copiedDesc") || "Link has been copied to clipboard",
      });
      setIsShareMenuOpen(false);
    }).catch(() => {
      toast({
        title: t("copyError") || "Copy failed",
        description: t("copyErrorDesc") || "Could not copy the link",
        variant: "destructive"
      });
    });
  };
  
  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
    setIsShareMenuOpen(false);
  };
  
  return (
    <div className="relative">
      <RippleEffect>
        <button 
          onClick={handleShare}
          className={`flex items-center justify-center ${getButtonClass()} ${className}`}
          aria-label={t("share") || "Share"}
        >
          <span className="material-icons mr-2">share</span>
          <span>{t("share") || "Share"}</span>
        </button>
      </RippleEffect>
      
      {/* Выпадающее меню для случаев, когда Web Share API не поддерживается */}
      {isShareMenuOpen && (
        <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 animate-slide-up">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={copyToClipboard}
            >
              <span className="material-icons mr-2 text-gray-500">content_copy</span>
              {t("copyLink") || "Copy link"}
            </button>
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={shareViaEmail}
            >
              <span className="material-icons mr-2 text-gray-500">email</span>
              {t("shareViaEmail") || "Share via Email"}
            </button>
            <a
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsShareMenuOpen(false)}
            >
              <span className="material-icons mr-2 text-gray-500">send</span>
              {t("shareViaTelegram") || "Share via Telegram"}
            </a>
            <a
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsShareMenuOpen(false)}
            >
              <span className="material-icons mr-2 text-gray-500">whatsapp</span>
              {t("shareViaWhatsApp") || "Share via WhatsApp"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;