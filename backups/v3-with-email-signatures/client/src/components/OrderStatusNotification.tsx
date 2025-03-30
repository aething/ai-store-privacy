import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";
import { useDeviceSize } from '@/hooks/use-device-size';
import { useAppContext } from '@/context/AppContext';
import { Order } from '@/types';
import { Card } from "@/components/ui/card";
import { formatPrice, getCurrencyForCountry } from '@/lib/currency';
import { Bell, Check, ClipboardCheck, Package, ShoppingBag, Truck, X } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import RippleEffect from './RippleEffect';

// Статусы заказов
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Объект с цветами для разных статусов
const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

// Объект с иконками для разных статусов
const statusIcons: Record<OrderStatus, React.ReactNode> = {
  pending: <ShoppingBag size={20} />,
  processing: <ClipboardCheck size={20} />,
  shipped: <Truck size={20} />,
  delivered: <Check size={20} />,
  cancelled: <X size={20} />,
};

// Интерфейс для уведомления о статусе заказа
interface OrderStatusNotificationProps {
  order: Order;
  onClose?: () => void;
  showCloseButton?: boolean;
  compact?: boolean;
  className?: string;
}

// Компонент уведомления о статусе заказа
export const OrderStatusNotification: React.FC<OrderStatusNotificationProps> = ({
  order,
  onClose,
  showCloseButton = true,
  compact = false,
  className = '',
}) => {
  const [, setLocation] = useLocation();
  const { isMobile } = useDeviceSize();
  const { t } = useLocale();
  
  // Получаем цвет статуса или дефолтный серый
  const statusColor = statusColors[order.status as OrderStatus] || 'bg-gray-100 text-gray-800';
  const statusIcon = statusIcons[order.status as OrderStatus] || <Bell size={20} />;
  
  // Функция для форматирования даты
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  const statusMessages: Record<OrderStatus, string> = {
    pending: t('orderStatusPending') || 'Ожидает оплаты',
    processing: t('orderStatusProcessing') || 'Заказ обрабатывается',
    shipped: t('orderStatusShipped') || 'Заказ отправлен',
    delivered: t('orderStatusDelivered') || 'Заказ доставлен',
    cancelled: t('orderStatusCancelled') || 'Заказ отменен',
  };
  
  // Получаем сообщение статуса
  const statusMessage = statusMessages[order.status as OrderStatus] || t('orderStatusUnknown') || 'Неизвестный статус';
  
  // Если compact=true, то показываем упрощенную версию
  if (compact) {
    return (
      <div 
        className={`flex items-center p-2 rounded-lg mb-2 cursor-pointer ${statusColor} ${className}`}
        onClick={() => setLocation(`/order/${order.id}`)}
      >
        <div className="mr-2">
          {statusIcon}
        </div>
        <div className="flex-1">
          <div className="font-medium">
            {t('orderNumber') || 'Заказ'} #{order.id}
          </div>
          <div className="text-xs">
            {statusMessage} - {formatDate(order.updatedAt)}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Card 
      className={`overflow-hidden shadow-md ${className}`}
    >
      <div className={`p-2 ${statusColor}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-2">
              {statusIcon}
            </div>
            <h3 className="font-medium">
              {statusMessage}
            </h3>
          </div>
          
          {showCloseButton && onClose && (
            <button 
              onClick={onClose} 
              className="rounded-full p-1 hover:bg-black/10"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">{t('orderNumber') || 'Заказ'}:</span>
          <span className="font-medium">#{order.id}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">{t('date') || 'Дата'}:</span>
          <span>{formatDate(order.createdAt)}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">{t('products') || 'Товары'}:</span>
          <span>{order.products.length}</span>
        </div>
        
        <div className="flex justify-between mb-4">
          <span className="text-gray-600">{t('total') || 'Сумма'}:</span>
          <span className="font-medium">
            {formatPrice(order.total, getCurrencyForCountry(order.country))}
          </span>
        </div>
        
        <RippleEffect>
          <button
            onClick={() => setLocation(`/order/${order.id}`)}
            className="w-full py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 flex items-center justify-center"
          >
            <span className="material-icons mr-1 text-sm">visibility</span>
            {t('viewOrderDetails') || 'Подробности заказа'}
          </button>
        </RippleEffect>
      </div>
    </Card>
  );
};

// Компонент поп-ап уведомления о статусе заказа
export const OrderStatusPopup: React.FC<{
  order: Order;
  onClose: () => void;
}> = ({ order, onClose }) => {
  const { isMobile } = useDeviceSize();
  const [isVisible, setIsVisible] = useState(false);
  
  // Анимация появления
  useEffect(() => {
    // Включаем анимацию появления через небольшую задержку
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    // Авто-закрытие через 10 секунд
    const closeTimeout = setTimeout(() => {
      handleClose();
    }, 10000);
    
    return () => {
      clearTimeout(timeout);
      clearTimeout(closeTimeout);
    };
  }, []);
  
  // Функция закрытия с анимацией
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Время анимации
  };
  
  const position = isMobile 
    ? 'bottom-4 left-4 right-4' 
    : 'bottom-4 right-4 w-80';
  
  return (
    <div 
      className={`fixed ${position} z-50 transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
      }`}
    >
      <OrderStatusNotification 
        order={order} 
        onClose={handleClose}
        showCloseButton={true}
      />
    </div>
  );
};

// Хук для работы с уведомлениями о статусе заказа
export const useOrderNotifications = () => {
  const { toast } = useToast();
  const { t } = useLocale();
  const [activeNotifications, setActiveNotifications] = useState<Order[]>([]);
  
  // Функция для показа уведомления о заказе
  const showOrderNotification = (order: Order) => {
    // Проверяем, не показывается ли уже уведомление с таким ID
    if (activeNotifications.some(n => n.id === order.id)) {
      return;
    }
    
    // Воспроизводим звуковой эффект, если доступно
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(() => {
        // Игнорируем ошибки воспроизведения (часто браузеры блокируют автовоспроизведение)
      });
    } catch (error) {
      console.log('Notification sound not supported');
    }
    
    // Также показываем всплывающее уведомление
    toast({
      title: t('orderStatusChanged') || 'Статус заказа изменен',
      description: `${t('orderNumber') || 'Заказ'} #${order.id}: ${order.status}`,
    });
    
    // Добавляем уведомление в активные
    setActiveNotifications(prev => [...prev, order]);
    
    // Удаляем уведомление через 10 секунд
    setTimeout(() => {
      setActiveNotifications(prev => prev.filter(n => n.id !== order.id));
    }, 10000);
  };
  
  // Функция для закрытия конкретного уведомления
  const closeOrderNotification = (orderId: number) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== orderId));
  };
  
  // Функция для закрытия всех уведомлений
  const closeAllOrderNotifications = () => {
    setActiveNotifications([]);
  };
  
  // Рендеринг активных уведомлений
  const renderActiveNotifications = () => {
    return activeNotifications.map(order => (
      <OrderStatusPopup
        key={order.id}
        order={order}
        onClose={() => closeOrderNotification(order.id)}
      />
    ));
  };
  
  return {
    showOrderNotification,
    closeOrderNotification,
    closeAllOrderNotifications,
    renderActiveNotifications,
    activeNotifications,
  };
};

export default OrderStatusNotification;