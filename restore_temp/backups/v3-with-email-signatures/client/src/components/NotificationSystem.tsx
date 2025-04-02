import React, { useState, useEffect, createContext, useContext } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { Toast, ToastAction, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { registerPushWorker, isPushNotificationSupported } from '@/lib/push-notification';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  variant?: 'default' | 'destructive';
}

const NotificationSystem: React.FC = () => {
  const { t } = useLocale();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [pushSupported, setPushSupported] = useState<boolean>(false);
  
  // Проверка поддержки push-уведомлений при монтировании компонента
  useEffect(() => {
    setPushSupported(isPushNotificationSupported());
    
    // Проверка текущего разрешения на уведомления
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    
    // Регистрация сервис-воркера для push-уведомлений если пользователь уже дал разрешение
    if (Notification.permission === 'granted') {
      registerServiceWorkerForPush();
    }
  }, []);
  
  // Регистрация сервис-воркера для push-уведомлений
  const registerServiceWorkerForPush = async () => {
    try {
      // Перед регистрацией проверяем, есть ли пользователь в localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.log('User not logged in, skipping push notification registration');
        return;
      }
      
      const registrationScope = await registerPushWorker();
      
      if (registrationScope) {
        console.log('Push notification service worker registered with scope:', registrationScope);
      } else {
        console.error('Failed to register push notification service worker');
      }
    } catch (error) {
      console.error('Error registering push notifications:', error);
    }
  };
  
  // Слушатель событий хранилища для синхронизации уведомлений между вкладками
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'notifications') {
        try {
          const newNotifications = event.newValue ? JSON.parse(event.newValue) : [];
          setNotifications(newNotifications);
        } catch (error) {
          console.error('Error parsing notifications from localStorage:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Загрузка уведомлений из localStorage при монтировании
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
    }
  }, []);
  
  // Сохранение уведомлений в localStorage при их изменении
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  }, [notifications]);
  
  // Функция для добавления нового уведомления
  const addNotification = (notification: Omit<NotificationItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newNotification = { ...notification, id };
    
    setNotifications((prev) => [...prev, newNotification]);
    
    // Если поддерживаются браузерные уведомления и пользователь дал разрешение,
    // показываем также нативное уведомление браузера
    if (notificationPermission === 'granted' && 'Notification' in window) {
      try {
        const options: NotificationOptions = {
          body: notification.description,
          icon: '/icons/app-icon-96x96.png',
          badge: '/icons/badge-icon.png',
          vibrate: [100, 50, 100]
        };
        
        new Notification(notification.title, options);
      } catch (error) {
        console.error('Error showing browser notification:', error);
      }
    }
    
    return id;
  };
  
  // Функция для удаления уведомления по ID
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };
  
  // Экспорт функций для глобального использования
  React.useEffect(() => {
    // @ts-ignore - добавляем в глобальный объект window для доступа из других компонентов
    window.notificationSystem = {
      addNotification,
      removeNotification,
    };
  }, []);
  
  return (
    <ToastProvider>
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          variant={notification.variant || 'default'}
          onOpenChange={(open) => {
            if (!open) removeNotification(notification.id);
          }}
        >
          <div className="flex justify-between items-start gap-2">
            <div>
              <ToastTitle>{notification.title}</ToastTitle>
              <ToastDescription>{notification.description}</ToastDescription>
            </div>
            {notification.action && (
              <ToastAction
                altText={notification.action.label}
                onClick={notification.action.onClick}
              >
                {notification.action.label}
              </ToastAction>
            )}
          </div>
        </Toast>
      ))}
      <ToastViewport className="p-4 md:p-6" />
    </ToastProvider>
  );
};

// Глобальные типы для TypeScript
declare global {
  interface Window {
    notificationSystem?: {
      addNotification: (notification: Omit<NotificationItem, 'id'>) => string;
      removeNotification: (id: string) => void;
    };
  }
}

// Создаем контекст для глобального доступа к API уведомлений
interface NotificationContextType {
  addNotification: (notification: Omit<NotificationItem, 'id'>) => string;
  removeNotification: (id: string) => void;
  isPushSupported: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Хук для использования API уведомлений
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Провайдер уведомлений
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Создаем ref для сохранения ссылки на экземпляр компонента NotificationSystem
  const notificationSystemRef = React.useRef<{
    addNotification: (notification: Omit<NotificationItem, 'id'>) => string;
    removeNotification: (id: string) => void;
  } | null>(null);
  
  const [isPushSupported, setIsPushSupported] = useState<boolean>(false);
  
  // Проверяем поддержку push-уведомлений при монтировании
  useEffect(() => {
    setIsPushSupported(isPushNotificationSupported());
  }, []);
  
  // При монтировании компонента получаем доступ к функциям из window.notificationSystem
  useEffect(() => {
    const checkNotificationSystem = () => {
      if (window.notificationSystem) {
        notificationSystemRef.current = window.notificationSystem;
      } else {
        // Если notificationSystem еще не инициализирован, пробуем снова через 100мс
        setTimeout(checkNotificationSystem, 100);
      }
    };
    
    checkNotificationSystem();
  }, []);
  
  // Функция для добавления нотификации через контекст
  const addNotification = (notification: Omit<NotificationItem, 'id'>) => {
    if (notificationSystemRef.current) {
      return notificationSystemRef.current.addNotification(notification);
    }
    console.error('NotificationSystem is not initialized yet');
    return '';
  };
  
  // Функция для удаления нотификации через контекст
  const removeNotification = (id: string) => {
    if (notificationSystemRef.current) {
      notificationSystemRef.current.removeNotification(id);
    } else {
      console.error('NotificationSystem is not initialized yet');
    }
  };
  
  return (
    <NotificationContext.Provider 
      value={{ 
        addNotification, 
        removeNotification,
        isPushSupported
      }}
    >
      {children}
      <NotificationSystem />
    </NotificationContext.Provider>
  );
};

export default NotificationSystem;