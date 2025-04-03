import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/api/products";
import { useProductsSync } from "@/hooks/use-products-sync";

export function HomePage() {
  const { syncProducts } = useProductsSync();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: fetchProducts,
  });

  // Синхронизация продуктов при первой загрузке
  useEffect(() => {
    // Вы можете раскомментировать следующую строку, чтобы включить 
    // автоматическую синхронизацию при загрузке страницы
    // syncProducts();
  }, []);

  // ... rest of HomePage component ...
}