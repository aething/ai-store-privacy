import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/context/LocaleContext';
import RippleEffect from '@/components/RippleEffect';
import { requestNotificationPermission, registerPushWorker, unsubscribeFromPush } from '@/lib/push-notification';

interface PushNotificationSettingsProps {
  className?: string;
}

const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const { t } = useLocale();
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Проверяем поддержку уведомлений при монтировании компонента
  useEffect(() => {
    const checkNotificationSupport = () => {
      // Проверка поддержки уведомлений в браузере
      const notificationsSupported = 'Notification' in window;
      
      // Проверка поддержки сервис-воркеров
      const serviceWorkerSupported = 'serviceWorker' in navigator;
      
      // Проверка поддержки Push API
      const pushSupported = 'PushManager' in window;
      
      // Устанавливаем флаг поддержки
      setIsSupported(notificationsSupported && serviceWorkerSupported && pushSupported);
      
      // Проверяем текущий статус разрешения и подписки
      if (notificationsSupported) {
        setIsPushEnabled(Notification.permission === 'granted');
        
        // Если сервис-воркеры поддерживаются, проверяем активную подписку
        if (serviceWorkerSupported) {
          checkSubscriptionStatus();
        }
      }
    };
    
    // Проверка статуса подписки через сервис-воркер
    const checkSubscriptionStatus = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsPushEnabled(!!subscription);
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    };
    
    checkNotificationSupport();
  }, []);
  
  // Обработчик переключения статуса уведомлений
  const handleTogglePushNotifications = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (isPushEnabled) {
        // Отписываемся от уведомлений
        const success = await unsubscribeFromPush();
        
        if (success) {
          setIsPushEnabled(false);
          toast({
            title: t('notificationsDisabled') || 'Notifications disabled',
            description: t('notificationsDisabledDesc') || 'You will no longer receive push notifications',
          });
        } else {
          throw new Error('Failed to unsubscribe from notifications');
        }
      } else {
        // Запрашиваем разрешение и подписываемся на уведомления
        const permissionGranted = await requestNotificationPermission();
        
        if (permissionGranted) {
          const registrationScope = await registerPushWorker();
          
          if (registrationScope) {
            setIsPushEnabled(true);
            toast({
              title: t('notificationsEnabled') || 'Notifications enabled',
              description: t('notificationsEnabledDesc') || 'You will now receive important updates',
            });
          } else {
            throw new Error('Failed to register for push notifications');
          }
        } else {
          toast({
            title: t('permissionDenied') || 'Permission denied',
            description: t('permissionDeniedDesc') || 'Please allow notifications in your browser settings',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Push notification error:', error);
      toast({
        title: t('notificationError') || 'Notification error',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Отправка тестового уведомления
  const sendTestNotification = () => {
    if (!isPushEnabled) {
      toast({
        title: t('notificationsDisabled') || 'Notifications disabled',
        description: t('enableNotificationsFirst') || 'Please enable notifications first',
        variant: 'destructive',
      });
      return;
    }
    
    // Создаем локальное уведомление
    new Notification(t('testNotificationTitle') || 'Test Notification', {
      body: t('testNotificationBody') || 'This is a test notification from AI Store',
      icon: '/icons/app-icon-96x96.png',
    });
    
    toast({
      title: t('testNotificationSent') || 'Test notification sent',
      description: t('testNotificationSentDesc') || 'If you don\'t see it, check your notification settings',
    });
  };
  
  // Если уведомления не поддерживаются, показываем соответствующее сообщение
  if (!isSupported) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('pushNotifications') || 'Push Notifications'}
        </h3>
        <p className="text-gray-600 mb-4">
          {t('pushNotSupportedDesc') || 'Your browser does not support push notifications. Please use a modern browser like Chrome, Firefox, or Edge.'}
        </p>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {t('pushNotifications') || 'Push Notifications'}
      </h3>
      
      <p className="text-gray-600 mb-4">
        {t('pushNotificationsDesc') || 'Receive notifications about order updates, new products, and special offers.'}
      </p>
      
      <div className="flex justify-between items-center mb-4">
        <span className="font-medium">
          {t('enablePushNotifications') || 'Enable push notifications'}
        </span>
        
        <button
          type="button"
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
            isPushEnabled ? 'bg-blue-600' : 'bg-gray-200'
          } ${isLoading ? 'opacity-50' : ''}`}
          onClick={handleTogglePushNotifications}
          disabled={isLoading}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
              isPushEnabled ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-start">
          <span className="material-icons text-blue-600 mr-2">shopping_cart</span>
          <div>
            <p className="font-medium">{t('orderUpdates') || 'Order Updates'}</p>
            <p className="text-sm text-gray-500">{t('orderUpdatesDesc') || 'Get notified about status changes and delivery updates'}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <span className="material-icons text-blue-600 mr-2">new_releases</span>
          <div>
            <p className="font-medium">{t('newProducts') || 'New Products'}</p>
            <p className="text-sm text-gray-500">{t('newProductsDesc') || 'Be the first to know about new AI products'}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <span className="material-icons text-blue-600 mr-2">local_offer</span>
          <div>
            <p className="font-medium">{t('specialOffers') || 'Special Offers'}</p>
            <p className="text-sm text-gray-500">{t('specialOffersDesc') || 'Don\'t miss out on discounts and promotions'}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <RippleEffect>
          <button
            type="button"
            className="md-btn-outlined w-full"
            onClick={sendTestNotification}
            disabled={isLoading || !isPushEnabled}
          >
            <span className="material-icons mr-2">notifications</span>
            {t('sendTestNotification') || 'Send Test Notification'}
          </button>
        </RippleEffect>
      </div>
    </div>
  );
};

export default PushNotificationSettings;