import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLocale } from '@/context/LocaleContext';
import RippleEffect from '@/components/RippleEffect';
import { triggerHapticFeedback } from '@/hooks/use-haptic-feedback';
import { isOffline } from '@/lib/cache-utils';
import Icon from '@/components/Icon';

/**
 * Страница 404 - не найдено
 * С анимациями в стиле Material Design и тактильной обратной связью
 */
const NotFoundPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { t } = useLocale();
  
  // При загрузке, если пользователь офлайн, 
  // воспроизводим тактильную обратную связь
  useEffect(() => {
    if (isOffline()) {
      triggerHapticFeedback('warning');
    } else {
      triggerHapticFeedback('error');
    }
  }, []);
  
  // Функция для возврата на главную страницу
  const goToHome = () => {
    triggerHapticFeedback('medium');
    setLocation('/');
  };
  
  // Если пользователь офлайн, показываем специальное сообщение
  const isUserOffline = isOffline();
  
  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-6 bg-gray-50 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl">
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center animate-pulse">
              {isUserOffline ? (
                // Иконка для офлайн-режима
                <Icon name="signal_wifi_off" size="large" className="text-red-500" />
              ) : (
                // Иконка 404
                <Icon name="error" size="large" className="text-red-500" />
              )}
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            {isUserOffline
              ? t('offlineTitle') || 'Вы не в сети'
              : t('pageNotFoundTitle') || 'Страница не найдена'}
          </h1>
          
          <p className="text-center text-gray-600 mb-6">
            {isUserOffline
              ? t('offlineMessage') || 'Проверьте ваше интернет-соединение и попробуйте снова.'
              : t('pageNotFoundMessage') || 'Страница, которую вы ищете, не существует или была перемещена.'}
          </p>
          
          <div className="flex justify-center">
            <RippleEffect>
              <button
                onClick={goToHome}
                className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <Icon name="arrow_back" className="text-white" />
                <span>{t('returnToHome') || 'Вернуться на главную'}</span>
              </button>
            </RippleEffect>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 w-full transform origin-left transition-all duration-1000 animate-expand"></div>
      </div>
      
      {/* Анимации добавлены через CSS-классы */}
    </div>
  );
};

export default NotFoundPage;