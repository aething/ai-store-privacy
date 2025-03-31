import { useLocation } from "wouter";
import { Product } from "@/types";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { formatPrice, getCurrencyForCountry, getPriceForCountry } from "@/lib/currency";
import { getProductImage } from "@/lib/imagePreloader";
import { saveScrollPosition } from "@/lib/scrollUtils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [, setLocation] = useLocation();
  const { user } = useAppContext();
  
  const handleClick = () => {
    // Сохраняем позицию скролла перед переходом на страницу детального просмотра
    saveScrollPosition();
    setLocation(`/product/${product.id}`);
  };
  
  // Используем функцию из нашего сервиса предварительной загрузки
  
  // Determine currency and price based on user's country
  const currency = getCurrencyForCountry(user?.country);
  const price = getPriceForCountry(product, user?.country);
  const formattedPrice = formatPrice(price, currency);
  
  return (
    <Card 
      className="product-card flex-none w-64 rounded-lg overflow-hidden bg-white cursor-pointer shadow-md hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <div className="h-48 bg-surface">
        <img 
          src={getProductImage(product.id)} 
          alt={product.title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg">{product.title}</h3>
        <p className="text-text-secondary text-sm mb-3">{product.description.substring(0, 70)}...</p>
        <div className="flex justify-between items-center">
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
