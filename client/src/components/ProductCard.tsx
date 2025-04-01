import { useLocation } from "wouter";
import { Product } from "@/types";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { formatPrice, getCurrencyForCountry, getPriceForCountry } from "@/lib/currency";
import { getProductImage } from "@/lib/imagePreloader";
import { useProductImage } from "@/hooks/useProductImage";
import { saveScrollPosition } from "@/lib/scrollUtils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [, setLocation] = useLocation();
  const { user } = useAppContext();
  
  // Используем наш новый хук для загрузки изображения
  const { imageSrc, isLoaded } = useProductImage(product.id, product.imageUrl);
  
  const handleClick = () => {
    // Сохраняем позицию скролла перед переходом на страницу детального просмотра
    saveScrollPosition();
    setLocation(`/product/${product.id}`);
  };
  
  // Determine currency and price based on user's country
  const currency = getCurrencyForCountry(user?.country);
  const price = getPriceForCountry(product, user?.country);
  
  // Добавляем отладочный вывод для определения валюты
  console.log(`DEBUG ProductCard: User country=${user?.country}, Currency=${currency}, Product ID=${product.id}, Price=${price}`);
  
  // Проверяем, является ли это ценой из Stripe (по наличию stripeProductId)
  const isStripePrice = !!product.stripeProductId;
  
  // Форматируем цену с учетом источника (Stripe или обычные данные)
  const formattedPrice = formatPrice(price, currency, isStripePrice);
  
  // Обрезаем описание до фиксированной длины и добавляем многоточие
  const shortDescription = product.description.substring(0, 60) + "...";
  
  // Определяем CSS для фона во время загрузки изображения
  const bgStyle = !imageSrc ? { backgroundColor: '#f3f4f6' } : {};
  
  return (
    <Card 
      className="product-card flex-none w-64 rounded-lg overflow-hidden bg-white cursor-pointer shadow-md hover:shadow-lg transition-shadow flex flex-col"
      onClick={handleClick}
    >
      {/* Изображение продукта - фиксированная высота */}
      <div className="h-48 bg-surface relative" style={bgStyle}>
        {/* Индикатор загрузки, если изображение еще не загружено */}
        {!imageSrc && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse rounded-md bg-gray-200 h-full w-full"></div>
          </div>
        )}
        
        {/* Само изображение с проверкой на наличие источника */}
        {imageSrc && (
          <img 
            src={imageSrc}
            alt={product.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Если не удалось загрузить изображение по URL, используем локальное изображение
              const fallbackImage = getProductImage(product.id);
              if (e.currentTarget.src !== fallbackImage) {
                e.currentTarget.src = fallbackImage;
              }
            }}
          />
        )}
      </div>
      
      {/* Содержимое карточки - фиксированная высота */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Заголовок с фиксированной высотой и одинаковым отображением */}
        <h3 className="font-medium text-lg h-14 line-clamp-2">{product.title}</h3>
        
        {/* Описание с фиксированной высотой */}
        <p className="text-text-secondary text-sm mb-3 h-12 line-clamp-2">{shortDescription}</p>
        
        {/* Секция с ценой и кнопкой - всегда внизу карточки */}
        <div className="flex justify-between items-center mt-auto">
          <span className="font-medium">{formattedPrice}</span>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              setLocation(`/checkout/${product.id}`);
            }}
          >
            Buy Now
          </button>
        </div>
      </div>
    </Card>
  );
}
