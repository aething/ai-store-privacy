import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import ProductSlider from "@/components/ProductSlider";
import { Product } from "@/types";
import { Card } from "@/components/ui/card";

export default function Shop() {
  const [, setLocation] = useLocation();
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="flex overflow-x-auto space-x-4 pb-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-none w-64 h-80 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-error">Error loading products</div>;
  }

  return (
    <div>
      {/* Product Slider */}
      {products && products.length > 0 && (
        <ProductSlider 
          title="Products" 
          products={products.slice(0, 3)} 
        />
      )}

      {/* Description Section */}
      {products && products.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Description</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4">
            {products.slice(0, 3).map((product) => (
              <Card 
                key={product.id}
                className="flex-none w-64 rounded-lg overflow-hidden bg-white cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                onClick={() => setLocation(`/product/${product.id}`)}
              >
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-2">{product.title}</h3>
                  <p className="text-text-secondary text-sm mb-2">
                    {product.description.substring(0, 80)}...
                    <span 
                      className="text-primary font-medium ml-1 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/product/${product.id}`);
                      }}
                    >
                      More
                    </span>
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
