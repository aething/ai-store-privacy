import { QueryClient } from "@tanstack/react-query";
import { CACHE_TIME, STALE_TIME } from "./queryClient";

/**
 * Типы данных для кеширования
 */
export enum DataType {
  PRODUCTS = "products",
  USERS = "users",
  INFO = "info",
  ORDERS = "orders",
  AUTH = "auth",
  SETTINGS = "settings"
}

/**
 * Типы запросов
 */
export enum QueryType {
  LIST = "list",
  DETAIL = "detail",
  USER_SPECIFIC = "user-specific"
}

/**
 * Получение настроек кеширования для определенного типа данных
 */
export function getCacheSettings(dataType: DataType, queryType: QueryType = QueryType.LIST) {
  switch (dataType) {
    case DataType.PRODUCTS:
      return {
        staleTime: queryType === QueryType.LIST 
          ? STALE_TIME.STANDARD  // Список продуктов кешируется на 5 минут
          : STALE_TIME.FREQUENT, // Детали продукта кешируются на 30 секунд
        gcTime: CACHE_TIME.STANDARD,
      };
      
    case DataType.USERS:
      return {
        staleTime: STALE_TIME.FREQUENT, // Данные пользователя быстро устаревают
        gcTime: CACHE_TIME.STANDARD,
      };
      
    case DataType.INFO:
      return {
        staleTime: STALE_TIME.LONG,  // Инфо-страницы редко меняются
        gcTime: CACHE_TIME.LONG,
      };
      
    case DataType.ORDERS:
      return {
        staleTime: queryType === QueryType.USER_SPECIFIC 
          ? STALE_TIME.FREQUENT     // Список заказов пользователя
          : STALE_TIME.STANDARD,    // Общие данные о заказах
        gcTime: CACHE_TIME.STANDARD,
      };
      
    case DataType.AUTH:
      return {
        staleTime: STALE_TIME.FREQUENT, // Авторизация требует свежих данных
        gcTime: CACHE_TIME.STANDARD,
      };
      
    case DataType.SETTINGS:
      return {
        staleTime: STALE_TIME.LONG,     // Настройки редко меняются
        gcTime: CACHE_TIME.LONG,
      };
      
    default:
      return {
        staleTime: STALE_TIME.STANDARD,
        gcTime: CACHE_TIME.STANDARD,
      };
  }
}

/**
 * Формирование ключа кеша в структурированном формате
 */
export function getQueryKey(dataType: DataType, id?: string | number) {
  return id !== undefined ? [`/api/${dataType}`, id.toString()] : [`/api/${dataType}`];
}

/**
 * Инвалидация кеша по типу данных и опционально по ID
 */
export function invalidateCache(
  queryClient: QueryClient, 
  dataType: DataType, 
  id?: string | number
) {
  if (id !== undefined) {
    // Инвалидация конкретной записи
    return queryClient.invalidateQueries({ 
      queryKey: getQueryKey(dataType, id) 
    });
  } else {
    // Инвалидация всех записей определенного типа
    return queryClient.invalidateQueries({ 
      queryKey: [`/api/${dataType}`], 
      refetchType: 'inactive'  // Обновляем и неактивные запросы
    });
  }
}

/**
 * Предварительная загрузка данных в кеш
 */
export async function prefetchData(
  queryClient: QueryClient,
  dataType: DataType,
  id?: string | number
) {
  const { staleTime, gcTime } = getCacheSettings(
    dataType,
    id !== undefined ? QueryType.DETAIL : QueryType.LIST
  );
  
  return queryClient.prefetchQuery({
    queryKey: getQueryKey(dataType, id),
    staleTime,
    gcTime,
  });
}

/**
 * Прямое обновление кеша
 */
export function updateCache<T>(
  queryClient: QueryClient, 
  dataType: DataType, 
  id: string | number, 
  updater: (oldData: T | undefined) => T
) {
  queryClient.setQueryData(
    getQueryKey(dataType, id),
    (oldData: T | undefined) => updater(oldData)
  );
}

/**
 * Очистка всего кеша приложения
 */
export function clearAllCache(queryClient: QueryClient) {
  return queryClient.clear();
}