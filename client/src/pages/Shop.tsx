import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import ProductSlider from "@/components/ProductSlider";
import ProductSort from "@/components/ProductSort";
import { Product } from "@/types";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { useState, useCallback } from "react";

export default function Shop() {
  const [, setLocation] = useLocation();
  const { user } = useAppContext();
  const [sortBy, setSortBy] = useState<string>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products", user?.country, sortBy, sortOrder],
    queryFn: async () => {
      // Build the URL with all parameters
      let url = '/api/products?';
      
      // Add country filter if available
      if (user?.country) {
        url += `country=${encodeURIComponent(user.country)}&`;
      }
      
      // Add sorting parameters
      url += `sortBy=${sortBy}&sortOrder=${sortOrder}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    }
  });
  
  const handleSort = useCallback((newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

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
      {/* Sort Controls */}
      {products && products.length > 0 && (
        <ProductSort 
          onSort={handleSort}
          defaultSortBy={sortBy}
          defaultSortOrder={sortOrder}
        />
      )}
      
      {/* Product Slider */}
      {products && products.length > 0 && (
        <ProductSlider 
          title="Products" 
          products={products} 
        />
      )}

      {/* Description Section */}
      {products && products.length > 0 && (
        <div className="mb-8 relative">
          <h2 className="text-lg font-medium mb-4">Description</h2>
          <div 
            id="description-scroll"
            className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-hide"
            style={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
          >
            {products.slice(0, 3).map((product) => (
              <Card 
                key={product.id}
                className="flex-none w-64 rounded-lg overflow-hidden bg-white cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                onClick={() => setLocation(`/product/${product.id}`)}
              >
                <div className="p-4 flex flex-col" style={{ height: "20rem" }}>
                  <h3 className="font-medium text-lg mb-3">{product.title}</h3>
                  <div className="flex-grow overflow-hidden">
                    <p className="text-text-secondary text-sm">
                      {product.description.substring(0, 400)}...
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
                </div>
              </Card>
            ))}
          </div>
          
          {products.length > 2 && (
            <>
              <button
                className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-full shadow-md p-1 z-10"
                onClick={() => {
                  const scrollElem = document.getElementById('description-scroll');
                  if (scrollElem) {
                    scrollElem.scrollBy({ left: -280, behavior: 'smooth' });
                  }
                }}
              >
                <span className="material-icons">chevron_left</span>
              </button>
              <button
                className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white rounded-full shadow-md p-1 z-10"
                onClick={() => {
                  const scrollElem = document.getElementById('description-scroll');
                  if (scrollElem) {
                    scrollElem.scrollBy({ left: 280, behavior: 'smooth' });
                  }
                }}
              >
                <span className="material-icons">chevron_right</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
