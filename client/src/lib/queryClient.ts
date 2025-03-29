import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * Создаем глобальные настройки для разных типов запросов
 */
export const CACHE_TIME = {
  FREQUENT: 1000 * 60 * 5,    // 5 минут для часто меняющихся данных
  STANDARD: 1000 * 60 * 30,   // 30 минут для стандартных данных
  LONG: 1000 * 60 * 60 * 24,  // 1 день для редко меняющихся данных
  INFINITE: Infinity           // Бесконечное кеширование
};

export const STALE_TIME = {
  FREQUENT: 1000 * 30,         // 30 секунд
  STANDARD: 1000 * 60 * 5,     // 5 минут
  LONG: 1000 * 60 * 60,        // 1 час
  INFINITE: Infinity           // Никогда не считать устаревшим
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,    // Обновлять при фокусе окна
      staleTime: STALE_TIME.STANDARD, // По умолчанию 5 минут
      gcTime: CACHE_TIME.STANDARD,    // В TanStack Query v5 'gcTime' заменяет 'cacheTime'
      retry: 1,                      // Одна повторная попытка при ошибке
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Экспоненциальная задержка
    },
    mutations: {
      retry: 1,                      // Одна повторная попытка при ошибке
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Экспоненциальная задержка
    },
  },
});
