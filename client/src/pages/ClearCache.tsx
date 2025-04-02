import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

/**
 * Простая страница для очистки кеша браузера и редиректа на главную
 */
export default function ClearCache() {
  const [countdown, setCountdown] = useState(3);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Добавляем случайное число в localStorage для гарантированного изменения состояния
    localStorage.setItem('cache_buster', Math.random().toString());
    
    // Чистим кеш через ServiceWorker, если он доступен
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }
    
    // Добавляем динамические стили, которые тоже могут кешироваться
    const style = document.createElement('style');
    style.textContent = `body::after { content: "Cache busted at ${new Date().toISOString()}"; display: none; }`;
    document.head.appendChild(style);

    // Обратный отсчет и перенаправление
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setLocation('/checkout?productId=1&cache=' + Date.now());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setLocation]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-96 max-w-full rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">Очистка кеша...</h1>
        <div className="mb-6 text-gray-600">
          <p>Пожалуйста, подождите, мы очищаем кеш и перенаправляем вас на страницу оформления заказа.</p>
          <p className="mt-2">Перенаправление через: {countdown} сек</p>
        </div>
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    </div>
  );
}