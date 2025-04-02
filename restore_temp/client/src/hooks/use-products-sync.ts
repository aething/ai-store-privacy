import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Product } from "../../shared/schema";

export function useProductsSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async () => {
      setIsSyncing(true);
      const response = await apiRequest("POST", "/api/stripe/sync-products");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error syncing products with Stripe");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Немедленно обновляем кеш продуктов с новыми данными из ответа
      const updatedProducts = data.products as Product[];
      
      // Обновляем кеш напрямую
      queryClient.setQueryData(["/api/products"], updatedProducts);
      
      // Также инвалидируем кеш для обеспечения получения актуальных данных при следующем запросе
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      
      toast({
        title: "Sync Successful",
        description: `${updatedProducts.length} products synchronized with Stripe`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync products with Stripe",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSyncing(false);
    }
  });

  // Функция для запуска синхронизации 
  const syncProducts = async () => {
    // Запускаем синхронизацию и ждем результата
    try {
      await syncMutation.mutateAsync();
      
      // После успешного завершения обновляем страницу (опционально)
      return true;
    } catch (error) {
      console.error("Sync error:", error);
      return false;
    }
  };

  return {
    syncProducts,
    isSyncing
  };
}