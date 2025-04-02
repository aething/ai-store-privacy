import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ErrorContextType {
  error: Error | null;
  setError: (error: Error | null) => void;
  clearError: () => void;
  lastErrorTimestamp: number | null;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<Error | null>(null);
  const [lastErrorTimestamp, setLastErrorTimestamp] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Очистка ошибки
  const clearError = () => {
    setError(null);
  };

  // Обработка ошибок и вывод уведомлений
  useEffect(() => {
    if (error) {
      setLastErrorTimestamp(Date.now());
      
      // Показываем уведомление об ошибке
      toast({
        title: 'Ошибка',
        description: error.message || 'Произошла неизвестная ошибка',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Добавляем глобальные обработчики ошибок React Query
  useEffect(() => {
    // Обработчик ошибок для запросов
    const unsubscribeQuery = queryClient.getQueryCache().subscribe(
      (event: any) => {
        if (event.type === 'observerResultsUpdated' && event.query?.state.error) {
          setError(event.query.state.error);
        }
      }
    );
    
    // Обработчик ошибок для мутаций
    const unsubscribeMutation = queryClient.getMutationCache().subscribe(
      (event: any) => {
        if (event.type === 'observerResultsUpdated' && event.mutation?.state.error) {
          setError(event.mutation.state.error);
        }
      }
    );
    
    // Отписываемся при размонтировании
    return () => {
      unsubscribeQuery();
      unsubscribeMutation();
    };
  }, [queryClient]);

  // Добавляем глобальный обработчик неперехваченных ошибок
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      setError(event.error || new Error(event.message));
      
      // Предотвращаем стандартный вывод ошибки в консоль в продакшене
      if (import.meta.env.PROD) {
        event.preventDefault();
      }
    };

    // Добавляем обработчик для неперехваченных ошибок
    window.addEventListener('error', handleGlobalError);
    
    // Отписываемся при размонтировании
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  // Обработка обещаний, которые не были обработаны
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = 
        event.reason instanceof Error 
          ? event.reason 
          : new Error(
              typeof event.reason === 'string' 
                ? event.reason 
                : 'Необработанное отклонение промиса'
            );
      
      setError(error);
      
      // Предотвращаем стандартный вывод ошибки в консоль в продакшене
      if (import.meta.env.PROD) {
        event.preventDefault();
      }
    };

    // Добавляем обработчик для неперехваченных промисов
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Отписываемся при размонтировании
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const value = {
    error,
    setError,
    clearError,
    lastErrorTimestamp,
  };

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
}

// Хук для использования в компонентах
export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

// HOC (Компонент высшего порядка) для оборачивания компонентов
export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  const WithErrorHandling: React.FC<P> = (props) => {
    const { error, clearError } = useError();

    useEffect(() => {
      // Очищаем ошибку при размонтировании компонента
      return () => {
        clearError();
      };
    }, [clearError]);

    // Если есть ошибка, показываем индикатор ошибки
    if (error) {
      return (
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <h3 className="text-lg font-medium mb-2">Ошибка</h3>
          <p>{error.message}</p>
          <button
            onClick={clearError}
            className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    // Иначе рендерим компонент как обычно
    return <Component {...props} />;
  };

  return WithErrorHandling;
}