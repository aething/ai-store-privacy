import { useRef } from "react";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

interface ProductSliderProps {
  title: string;
  products: Product[];
  titleKey?: string; // Ключ для локализации заголовка
}

export default function ProductSlider({ title, products, titleKey }: ProductSliderProps) {
  const { t } = useLocale(); // Получаем функцию перевода
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const { current } = scrollRef;
    const scrollAmount = 280; // Width of a card + margin
    
    if (direction === 'left') {
      current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="mb-6 relative">
      <h2 className="text-lg font-medium mb-4">
        {titleKey ? t(titleKey) : title}
      </h2>
      
      <div 
        ref={scrollRef}
        className="product-scroll overflow-x-auto flex space-x-4 pb-4 -mx-4 px-4 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
      >
        {products.slice(0, 3).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {products.length > 2 && (
        <>
          <button
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-full shadow-md p-1 z-10"
            onClick={() => scroll('left')}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white rounded-full shadow-md p-1 z-10"
            onClick={() => scroll('right')}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
}
