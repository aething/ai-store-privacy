import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
      // Инвалидируем кеш продуктов, чтобы при следующем запросе получить свежие данные
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      
      toast({
        title: "Sync Successful",
        description: `${data.products.length} products synchronized with Stripe`,
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

  const syncProducts = () => {
    syncMutation.mutate();
  };

  return {
    syncProducts,
    isSyncing
  };
}