import { useEffect, useState } from "react";
import { preloadImages, getProductImage } from "@/lib/imagePreloader";

/**
 * Hook для загрузки и установки изображения продукта
 * @param productId ID продукта
 * @param imageUrl Опциональный URL изображения продукта
 * @returns Объект, содержащий источник изображения и флаг загрузки
 */
export function useProductImage(productId: number, imageUrl?: string | null) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Определяем источник изображения
    const source = imageUrl || getProductImage(productId);
    
    // Запускаем предзагрузку изображений
    preloadImages()
      .then(() => {
        // Устанавливаем состояние только если компонент все еще смонтирован
        if (isMounted) {
          setIsLoaded(true);
          setImageSrc(source);
        }
      })
      .catch((error) => {
        console.error('Ошибка загрузки изображений:', error);
        // Даже при ошибке устанавливаем источник
        if (isMounted) {
          setImageSrc(source);
        }
      });
    
    // Функция очистки при размонтировании
    return () => {
      isMounted = false;
    };
  }, [productId, imageUrl]);

  return { imageSrc, isLoaded };
}