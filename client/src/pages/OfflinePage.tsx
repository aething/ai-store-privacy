import React from 'react';
import { Link } from 'wouter';
import { useOfflineNavigation } from '../components/OfflineNavigationProvider';

/**
 * Страница, отображаемая в оффлайн-режиме для недоступных маршрутов
 */
const OfflinePage: React.FC = () => {
  const { isOnline, offlineData } = useOfflineNavigation();
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm leading-5 text-orange-700">
              Вы находитесь в <strong>оффлайн-режиме</strong>. Некоторые функции недоступны.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Работа в автономном режиме</h1>
        <p className="text-gray-700 mb-4">
          Приложение работает в оффлайн-режиме. Вы можете просматривать доступные страницы,
          но некоторые функции, требующие соединения с сервером, будут недоступны.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Доступные страницы</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <Link href="/" className="text-blue-600 hover:underline">
              Главная страница
            </Link>
          </li>
          <li>
            <Link href="/account" className="text-blue-600 hover:underline">
              Личный кабинет
            </Link>
          </li>
          {offlineData.products && offlineData.products.length > 0 && (
            <li>
              <span className="block mb-1">Кэшированные продукты:</span>
              <ul className="ml-4 space-y-1">
                {offlineData.products.slice(0, 5).map((product: any) => (
                  <li key={product.id}>
                    <Link 
                      href={`/product/${product.id}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {product.name || product.title || `Продукт ${product.id}`}
                    </Link>
                  </li>
                ))}
                {offlineData.products.length > 5 && (
                  <li className="text-gray-500 italic">
                    ... и ещё {offlineData.products.length - 5} продуктов
                  </li>
                )}
              </ul>
            </li>
          )}
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Что можно делать в оффлайн-режиме</h2>
        <ul className="space-y-2 list-disc pl-5 text-gray-700">
          <li>Просматривать ранее загруженные продукты</li>
          <li>Просматривать информацию в своем личном кабинете</li>
          <li>Получать доступ к базовым функциям приложения</li>
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Недоступные функции</h2>
        <ul className="space-y-2 list-disc pl-5 text-gray-700">
          <li>Оформление заказов</li>
          <li>Обновление данных аккаунта</li>
          <li>Поиск по каталогу</li>
          <li>Загрузка новых продуктов</li>
        </ul>
      </div>

      {isOnline && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-sm mt-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm leading-5 text-green-700">
                Соединение восстановлено! Теперь вы можете использовать все функции приложения.
              </p>
              <Link href="/" className="mt-2 inline-block text-sm text-green-600 hover:underline">
                Вернуться на главную
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflinePage;