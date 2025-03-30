import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "./use-toast";

/**
 * Хук для получения текущего статуса подписки
 */
export function useSubscription() {
  return useQuery({
    queryKey: ['/api/get-or-create-subscription'],
    queryFn: async () => {
      try {
        const response = await apiRequest('POST', '/api/get-or-create-subscription');
        if (response.ok) {
          return await response.json();
        }
        throw new Error('Failed to get subscription status');
      } catch (error) {
        console.error('Error fetching subscription:', error);
        throw error;
      }
    },
    // Не делаем запрос автоматически, только когда нужно
    enabled: false,
    // Кешируем ненадолго - статус подписки может меняться
    gcTime: 1000 * 60 * 5, // 5 минут
    staleTime: 1000 * 30,  // 30 секунд
  });
}

/**
 * Хук для управления подпиской (отмена, реактивация)
 */
export function useManageSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ action }: { action: 'cancel' | 'reactivate' | 'cancel_immediately' }) => {
      const response = await apiRequest('POST', '/api/manage-subscription', { action });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to manage subscription');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Инвалидируем кеш подписки
      queryClient.invalidateQueries({ queryKey: ['/api/get-or-create-subscription'] });
      
      // Уведомляем пользователя об успешном действии
      let message = '';
      
      switch (variables.action) {
        case 'cancel':
          message = 'Подписка будет отменена в конце текущего платежного периода';
          break;
        case 'reactivate':
          message = 'Подписка успешно восстановлена';
          break;
        case 'cancel_immediately':
          message = 'Подписка немедленно отменена';
          break;
      }
      
      toast({
        title: 'Успешно',
        description: message,
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось выполнить действие с подпиской',
        variant: 'destructive',
      });
    },
  });
}