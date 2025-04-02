import { useToast } from "./use-toast";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Хук для централизованной обработки ошибок API запросов
 * Регистрирует глобальные обработчики ошибок React Query
 */
export function useApiErrorHandler() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Обработчик ошибок для запросов
    const unsubscribeQuery = queryClient.getQueryCache().subscribe(
      (event: any) => {
        // Проверяем, есть ли ошибка в событии
        if (event.type === 'observerResultsUpdated' && event.query.state.error) {
          const error = event.query.state.error;
          
          // Разбираем ошибку по статус-кодам HTTP
          if (error.message?.startsWith('401:')) {
            toast({
              title: 'Требуется авторизация',
              description: 'Пожалуйста, войдите в аккаунт для продолжения',
              variant: 'destructive',
            });
          } else if (error.message?.startsWith('403:')) {
            toast({
              title: 'Доступ запрещен',
              description: 'У вас нет прав для выполнения этого действия',
              variant: 'destructive',
            });
          } else if (error.message?.startsWith('404:')) {
            toast({
              title: 'Ресурс не найден',
              description: 'Запрашиваемый ресурс не существует',
              variant: 'destructive',
            });
          } else if (error.message?.startsWith('5')) {
            // 500, 502, 503, etc.
            toast({
              title: 'Ошибка сервера',
              description: 'Произошла ошибка на сервере. Пожалуйста, попробуйте позже',
              variant: 'destructive',
            });
          } else if (error) {
            // Общая обработка ошибки
            toast({
              title: 'Ошибка',
              description: error.message || 'Произошла неизвестная ошибка',
              variant: 'destructive',
            });
          }
        }
      }
    );
    
    // Обработчик ошибок для мутаций
    const unsubscribeMutation = queryClient.getMutationCache().subscribe(
      (event: any) => {
        if (event.type === 'observerResultsUpdated' && event.mutation?.state.error) {
          const error = event.mutation.state.error;
          
          // Более детальная обработка ошибок мутаций (обновления данных)
          if (error.message?.includes('validation')) {
            toast({
              title: 'Ошибка валидации',
              description: error.message,
              variant: 'destructive',
            });
          } else if (error.message?.includes('duplicate')) {
            toast({
              title: 'Дублирование данных',
              description: 'Такая запись уже существует',
              variant: 'destructive',
            });
          } else if (error) {
            toast({
              title: 'Ошибка',
              description: error.message || 'Не удалось выполнить операцию',
              variant: 'destructive',
            });
          }
        }
      }
    );
    
    // Отписываемся от событий при размонтировании компонента
    return () => {
      unsubscribeQuery();
      unsubscribeMutation();
    };
  }, [queryClient, toast]);
}

/**
 * Хук для обработки ошибок в компонентах
 * @param error Объект ошибки
 */
export function useApiError(error: unknown | null) {
  const { toast } = useToast();
  
  useEffect(() => {
    if (error) {
      const errorMessage = error instanceof Error 
        ? error.message
        : typeof error === 'string'
        ? error
        : 'Произошла неизвестная ошибка';
      
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [error, toast]);
}