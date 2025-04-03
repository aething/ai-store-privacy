import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  DataType, 
  QueryType, 
  getCacheSettings, 
  getQueryKey, 
  invalidateCache 
} from "@/lib/cache-utils";
import { useState } from "react";

interface QueryOptions {
  enabled?: boolean;
}

/**
 * Хук для получения списка элементов с кешированием
 */
export function useList<T>(dataType: DataType, options: QueryOptions = {}) {
  const { staleTime, gcTime } = getCacheSettings(dataType, QueryType.LIST);
  const url = `/api/${dataType}`;
  
  return useQuery<T[]>({
    queryKey: [url],
    staleTime,
    gcTime,
    enabled: options.enabled,
  });
}

/**
 * Хук для получения деталей элемента с кешированием
 */
export function useDetail<T>(dataType: DataType, id: string | number, options: QueryOptions = {}) {
  const { staleTime, gcTime } = getCacheSettings(dataType, QueryType.DETAIL);
  const url = `/api/${dataType}/${id}`;
  
  return useQuery<T>({
    queryKey: [url],
    staleTime,
    gcTime,
    enabled: options.enabled !== false && !!id,
  });
}

/**
 * Хук для создания нового элемента с обновлением кеша
 */
export function useCreate<T, U>(dataType: DataType) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const createItem = async (data: U): Promise<T> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest("POST", `/api/${dataType}`, data);
      const result = await response.json();
      
      // Инвалидируем кеш после успешного создания
      await invalidateCache(queryClient, dataType);
      
      setIsLoading(false);
      return result;
    } catch (err) {
      setIsLoading(false);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  };
  
  return { createItem, isLoading, error };
}

/**
 * Хук для обновления элемента с обновлением кеша
 */
export function useUpdate<T, U>(dataType: DataType) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number, data: U }) => {
      const response = await apiRequest("PUT", `/api/${dataType}/${id}`, data);
      return response.json() as Promise<T>;
    },
    onSuccess: (data: any, variables) => {
      // Обновляем кеш для конкретного элемента
      queryClient.setQueryData(
        getQueryKey(dataType, variables.id),
        data
      );
      
      // Инвалидируем список элементов
      queryClient.invalidateQueries({
        queryKey: getQueryKey(dataType),
      });
    },
  });
}

/**
 * Хук для удаления элемента с обновлением кеша
 */
export function useDelete(dataType: DataType) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiRequest("DELETE", `/api/${dataType}/${id}`);
      return response.ok;
    },
    onSuccess: (_, id) => {
      // Удаляем элемент из кеша
      queryClient.removeQueries({
        queryKey: getQueryKey(dataType, id),
      });
      
      // Инвалидируем список элементов
      queryClient.invalidateQueries({
        queryKey: getQueryKey(dataType),
      });
    },
  });
}

/**
 * Хук для выполнения пользовательских действий с кешированием
 */
export function useCustomAction<T, U>(
  dataType: DataType, 
  actionPath: string, 
  method: "GET" | "POST" | "PUT" | "DELETE" = "POST"
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data?: U) => {
      const response = await apiRequest(
        method, 
        `/api/${dataType}/${actionPath}`, 
        method !== "GET" ? data : undefined
      );
      
      if (method === "DELETE") {
        return response.ok;
      }
      
      return response.json() as Promise<T>;
    },
    onSuccess: () => {
      // Инвалидируем кеш для данного типа данных
      invalidateCache(queryClient, dataType);
    },
  });
}