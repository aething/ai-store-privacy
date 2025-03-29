import { useLocation } from "wouter";
import { Product } from "@/types";
import { Card } from "@/components/ui/card";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [, setLocation] = useLocation();
  
  const handleClick = () => {
    setLocation(`/product/${product.id}`);
  };
  
  return (
    <Card 
      className="product-card flex-none w-64 rounded-lg overflow-hidden bg-white cursor-pointer shadow-md hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <div className="h-48 bg-surface">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg">{product.title}</h3>
        <p className="text-text-secondary text-sm mb-3">{product.description.substring(0, 70)}...</p>
        <div className="flex justify-between items-center">
          <span className="font-medium">${(product.price / 100).toFixed(2)}</span>
          <button 
            className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium"
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
