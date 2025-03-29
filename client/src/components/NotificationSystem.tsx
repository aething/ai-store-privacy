import React, { useState, useEffect, createContext, useContext } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/context/LocaleContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  hasUnread: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  
  // Проверка наличия непрочитанных уведомлений
  useEffect(() => {
    const unread = notifications.some(notification => !notification.read);
    setHasUnread(unread);
  }, [notifications]);
  
  // Загрузка уведомлений из localStorage при монтировании
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsedNotifications = JSON.parse(savedNotifications);
        setNotifications(parsedNotifications);
      } catch (error) {
        console.error('Failed to parse notifications from localStorage:', error);
      }
    }
  }, []);
  
  // Сохранение уведомлений в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);
  
  // Добавление нового уведомления
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Проверяем поддержку уведомлений в браузере
    if ("Notification" in window) {
      // Если разрешения еще нет, запрашиваем его
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
      
      // Если разрешения есть, показываем уведомление
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    }
  };
  
  // Отметка уведомления как прочитанного
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  // Очистка всех уведомлений
  const clearAll = () => {
    setNotifications([]);
  };
  
  const value = {
    notifications,
    addNotification,
    markAsRead,
    clearAll,
    hasUnread
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Компонент для отображения списка уведомлений
interface NotificationListProps {
  onClose: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const { notifications, markAsRead, clearAll } = useNotification();
  const { t } = useLocale();
  
  // Обработка клика по уведомлению
  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };
  
  // Форматирование времени
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Получение иконки в зависимости от типа уведомления
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <span className="material-icons text-green-500">check_circle</span>;
      case 'warning':
        return <span className="material-icons text-yellow-500">warning</span>;
      case 'error':
        return <span className="material-icons text-red-500">error</span>;
      default:
        return <span className="material-icons text-blue-500">info</span>;
    }
  };
  
  return (
    <div className="notification-list bg-white rounded-lg shadow-xl p-4 max-h-[80vh] w-full max-w-md overflow-y-auto animate-slide-down">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{t("notifications") || "Notifications"}</h2>
        <div className="flex">
          <button 
            onClick={clearAll}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label={t("clearAll") || "Clear all"}
          >
            <span className="material-icons">delete_sweep</span>
          </button>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 ml-2"
            aria-label={t("close") || "Close"}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <span className="material-icons text-4xl mb-2">notifications_off</span>
          <p>{t("noNotifications") || "No notifications"}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map(notification => (
            <li 
              key={notification.id}
              className={`p-3 rounded-lg border ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'} cursor-pointer hover:bg-gray-100 transition-colors duration-200`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{notification.title}</h3>
                    {!notification.read && (
                      <span className="bg-blue-500 w-2 h-2 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatTime(notification.timestamp)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Компонент кнопки уведомлений
interface NotificationButtonProps {
  className?: string;
}

export const NotificationButton: React.FC<NotificationButtonProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { hasUnread } = useNotification();
  const { t } = useLocale();
  
  // Обработка открытия/закрытия списка уведомлений
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="relative">
      <button 
        onClick={toggleNotifications}
        className={`p-2 rounded-full flex items-center justify-center relative ${className}`}
        aria-label={t("notifications") || "Notifications"}
      >
        <span className="material-icons">notifications</span>
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-96">
          <NotificationList onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};

// Компонент для демонстрации системы уведомлений
export const NotificationDemo: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLocale();
  const { addNotification } = useNotification();
  
  const handleAddTestNotification = (type: 'info' | 'success' | 'warning' | 'error') => {
    let title, message;
    
    switch (type) {
      case 'success':
        title = t("orderComplete") || "Order complete";
        message = t("orderCompleteDesc") || "Your order has been successfully processed";
        break;
      case 'warning':
        title = t("lowStock") || "Low stock";
        message = t("lowStockDesc") || "Some items in your cart are running low on stock";
        break;
      case 'error':
        title = t("paymentFailed") || "Payment failed";
        message = t("paymentFailedDesc") || "There was a problem processing your payment";
        break;
      default:
        title = t("newFeature") || "New feature";
        message = t("newFeatureDesc") || "Check out our new product recommendations";
        break;
    }
    
    addNotification({
      title,
      message,
      type
    });
    
    toast({
      title: t("notificationAdded") || "Notification added",
      description: t("notificationAddedDesc") || "Check your notifications panel",
    });
  };
  
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <button 
        onClick={() => handleAddTestNotification('info')}
        className="md-btn-primary"
      >
        {t("addInfoNotification") || "Add Info Notification"}
      </button>
      <button 
        onClick={() => handleAddTestNotification('success')}
        className="bg-green-600 hover:bg-green-700 md-btn text-white"
      >
        {t("addSuccessNotification") || "Add Success Notification"}
      </button>
      <button 
        onClick={() => handleAddTestNotification('warning')}
        className="bg-yellow-600 hover:bg-yellow-700 md-btn text-white"
      >
        {t("addWarningNotification") || "Add Warning Notification"}
      </button>
      <button 
        onClick={() => handleAddTestNotification('error')}
        className="bg-red-600 hover:bg-red-700 md-btn text-white"
      >
        {t("addErrorNotification") || "Add Error Notification"}
      </button>
    </div>
  );
};