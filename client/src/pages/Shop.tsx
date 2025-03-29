import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import ProductSlider from "@/components/ProductSlider";
import InfoPageSlider from "@/components/InfoPageSlider";
import { Product } from "@/types";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { getAllInfoPages } from "@/constants/infoPages";
import { useLocale } from "@/context/LocaleContext";

export default function Shop() {
  const [, setLocation] = useLocation();
  const { user } = useAppContext();
  const { t } = useLocale();
  
  // Always sort by price ascending by default
  const sortBy = 'price';
  const sortOrder = 'asc';
  
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

  const infoPages = getAllInfoPages();

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
      {/* Product Slider - Products are automatically sorted by price ascending */}
      {products && products.length > 0 && (
        <ProductSlider 
          title={t("products") || "Products"} 
          products={products} 
        />
      )}

      {/* Info Pages - New section with informational content */}
      <InfoPageSlider 
        title={t("learnMore") || "Learn More"} 
        infoPages={infoPages} 
      />
    </div>
  );
}
