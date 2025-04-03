import image1 from "@assets/11111.jpeg";
import image2 from "@assets/22222.webp";
import image3 from "@assets/33333.jpg";

// Карта соответствия ID продукта и изображений
export const productImages: Record<number, string> = {
  1: image1,
  2: image2,
  3: image3
};

// Массив всех изображений, которые будут предварительно загружены
const imagesToPreload = Object.values(productImages);

// Кэш для хранения предварительно загруженных изображений
const imageCache: Record<string, HTMLImageElement> = {};

// Флаг, указывающий на то, что все изображения были загружены
let imagesLoaded = false;

/**
 * Функция для предварительной загрузки всех изображений
 */
export function preloadImages(): Promise<void[]> {
  if (imagesLoaded) {
    return Promise.resolve([]);
  }

  const promises = imagesToPreload.map(imageSrc => {
    // Если изображение уже в кэше, просто возвращаем resolved Promise
    if (imageCache[imageSrc]) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        imageCache[imageSrc] = img;
        resolve();
      };
      img.onerror = reject;
      img.src = imageSrc;
    });
  });
  
  return Promise.all(promises).then(() => {
    imagesLoaded = true;
    return [];
  });
}

/**
 * Функция для проверки, загружены ли уже все изображения
 */
export function areImagesLoaded(): boolean {
  return imagesLoaded;
}

/**
 * Функция для получения изображения по ID продукта
 * @param productId ID продукта
 * @returns URL или Data URL изображения
 */
export function getProductImage(productId: number): string {
  return productImages[productId] || productImages[1]; // Возвращаем изображение по ID или первое как fallback
}

/**
 * Получить загруженное изображение из кэша
 * @param imageSrc URL изображения
 * @returns HTML-элемент изображения или null, если изображение не в кэше
 */
export function getCachedImage(imageSrc: string): HTMLImageElement | null {
  return imageCache[imageSrc] || null;
}

// Предварительно загружаем все изображения при импорте модуля
preloadImages().then(() => {
  console.log('Все изображения предварительно загружены');
}).catch(error => {
  console.error('Ошибка при предварительной загрузке изображений:', error);
});