import { useState } from 'react';
import { useToast } from './use-toast';
import { useLocale } from '@/context/LocaleContext';

// Интерфейс данных для использования API Web Share
interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

/**
 * Хук для обеспечения функциональности "Поделиться"
 * Использует Web Share API, если доступно, или предоставляет запасной вариант
 */
export function useShare() {
  const { toast } = useToast();
  const { t } = useLocale();
  const [isSharing, setIsSharing] = useState(false);
  
  // Проверяем поддержку Web Share API
  const isShareSupported = typeof navigator !== 'undefined' && !!navigator.share;
  
  // Проверяем поддержку расширенного Web Share API (для файлов)
  const isFileShareSupported = 
    isShareSupported && 
    typeof navigator !== 'undefined' && 
    !!navigator.canShare;
  
  /**
   * Функция для копирования текста в буфер обмена
   */
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Резервный способ для браузеров без поддержки Clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textarea);
      return result;
    } catch (error) {
      console.error('Failed to copy text:', error);
      return false;
    }
  };
  
  /**
   * Основная функция для шаринга контента
   */
  const share = async (data: ShareData): Promise<boolean> => {
    if (isSharing) return false;
    
    setIsSharing(true);
    
    try {
      // Проверяем, можем ли использовать Web Share API
      if (isShareSupported) {
        // Если передаются файлы, проверяем поддержку шаринга файлов
        if (data.files && data.files.length > 0) {
          if (isFileShareSupported && navigator.canShare && navigator.canShare({ files: data.files })) {
            await navigator.share({ ...data });
            toast({
              title: t('shared') || 'Shared',
              description: t('shareSuccess') || 'Content shared successfully',
            });
            return true;
          } else {
            // Если файлы не поддерживаются, делимся только текстом и URL
            const { files, ...textData } = data;
            await navigator.share(textData);
            toast({
              title: t('shared') || 'Shared',
              description: t('shareFilesNotSupported') || 'Files not shared (not supported)',
            });
            return true;
          }
        } else {
          // Шарим обычные данные без файлов
          await navigator.share(data);
          toast({
            title: t('shared') || 'Shared',
            description: t('shareSuccess') || 'Content shared successfully',
          });
          return true;
        }
      } else {
        // Запасной вариант для браузеров без поддержки Web Share API
        // Копируем URL или текст в буфер обмена
        const textToCopy = data.url || data.text || '';
        const success = await copyToClipboard(textToCopy);
        
        if (success) {
          toast({
            title: t('copied') || 'Copied',
            description: t('copiedToClipboard') || 'URL has been copied to clipboard',
          });
          return true;
        } else {
          toast({
            title: t('error') || 'Error',
            description: t('copyFailed') || 'Failed to copy to clipboard',
            variant: 'destructive',
          });
          return false;
        }
      }
    } catch (error) {
      console.error('Share failed:', error);
      
      // Возможна отмена пользователем, не показываем ошибку в этом случае
      if (error instanceof Error && error.name === 'AbortError') {
        toast({
          title: t('shareCancelled') || 'Share cancelled',
          description: t('youCancelledTheShare') || 'You cancelled the share operation',
        });
      } else {
        toast({
          title: t('error') || 'Error',
          description: t('shareFailed') || 'Failed to share the content',
          variant: 'destructive',
        });
      }
      
      return false;
    } finally {
      setIsSharing(false);
    }
  };
  
  /**
   * Функция для шаринга продукта
   */
  const shareProduct = async (
    productId: number, 
    productTitle: string, 
    productDescription: string,
    productImage?: string
  ): Promise<boolean> => {
    const url = `${window.location.origin}/product/${productId}`;
    
    let shareData: ShareData = {
      title: productTitle,
      text: productDescription,
      url,
    };
    
    // Если есть изображение и поддерживается шаринг файлов, добавляем его
    if (productImage && isFileShareSupported) {
      try {
        // Загружаем изображение
        const response = await fetch(productImage);
        const blob = await response.blob();
        const file = new File([blob], `${productTitle}.jpg`, { type: 'image/jpeg' });
        
        // Проверяем, можем ли мы поделиться с этим файлом
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      } catch (error) {
        console.error('Failed to fetch product image for sharing:', error);
      }
    }
    
    return share(shareData);
  };
  
  return {
    share,
    shareProduct,
    copyToClipboard,
    isShareSupported,
    isFileShareSupported,
    isSharing,
  };
}