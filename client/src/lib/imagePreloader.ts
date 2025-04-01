import image1 from "@assets/11111.jpeg";
import image2 from "@assets/22222.webp";
import image3 from "@assets/33333.jpg";

// Массив всех изображений, которые будут предварительно загружены
const imagesToPreload = [
  image1,
  image2,
  image3
];

// Кэш для хранения предварительно загруженных изображений
const imageCache: Record<string, HTMLImageElement> = {};

/**
 * Функция для предварительной загрузки всех изображений
 */
export function preloadImages(): Promise<void[]> {
  const promises = imagesToPreload.map(imageSrc => {
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
  
  return Promise.all(promises);
}

/**
 * Функция для получения изображения по ID продукта
 */
export function getProductImage(productId: number): string {
  switch (productId) {
    case 1:
      return image1;
    case 2:
      return image2;
    case 3:
      return image3;
    default:
      // Fallback на изображение по умолчанию
      return image1;
  }
}

// Начинаем предварительную загрузку сразу при импорте модуля
preloadImages().then(() => {
  console.log('Все изображения предварительно загружены');
}).catch(error => {
  console.error('Ошибка при предварительной загрузке изображений:', error);
});