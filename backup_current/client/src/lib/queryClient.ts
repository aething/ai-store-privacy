import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Базовый URL API для запросов (Replit URL)
export const API_BASE_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || window.location.origin // Используем значение из переменных окружения или текущий URL
  : ""; // В режиме разработки используем относительные пути

// Настройка для мобильных приложений в Play Store
export const IS_MOBILE_APP = import.meta.env.VITE_IS_MOBILE_APP === 'true';

// Если приложение запущено как мобильное, всегда используем полный URL
if (IS_MOBILE_APP && !API_BASE_URL && import.meta.env.PROD) {
  console.warn('Мобильное приложение без настроенного API_BASE_URL. Установите переменную VITE_API_URL.');
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Добавляем базовый URL к запросам для мобильных приложений
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const res = await fetch(fullUrl, {
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
    const url = queryKey[0] as string;
    // Добавляем базовый URL для запросов в мобильном приложении
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
