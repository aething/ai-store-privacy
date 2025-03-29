import React, { useState } from 'react';
import { useOrders, Order } from '@/hooks/use-orders';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/context/LocaleContext';
import MaterialInput from '@/components/MaterialInput';
import { TruckIcon, Package, ExternalLink, LogIn, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { useAppContext } from '@/context/AppContext';
import { useLocation } from 'wouter';

const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'ordered':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-700 text-white';
      case 'complete':
        return 'bg-purple-700 text-white';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {status}
    </span>
  );
};

const OrderCard: React.FC<{
  order: Order;
  onUpdateTracking: (orderId: number, trackingNumber: string) => Promise<void>;
}> = ({ order, onUpdateTracking }) => {
  const { t } = useLocale();
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpdateTracking = async () => {
    if (!trackingNumber.trim()) return;
    
    setIsUpdating(true);
    try {
      await onUpdateTracking(order.id, trackingNumber);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('default', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  return (
    <Card className="mb-4 p-4 overflow-hidden">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-medium">{t('order')} #{order.id}</div>
          <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      
      <div className="border-t border-b py-3 my-3">
        <div className="flex justify-between">
          <div className="font-medium">{t('amount')}:</div>
          <div>{formatCurrency(order.amount, order.currency)}</div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center mb-2">
          <TruckIcon size={18} className="mr-2 text-blue-600" />
          <span className="font-medium">{t('tracking') || 'Tracking'}</span>
        </div>
        
        {order.trackingNumber ? (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm bg-gray-100 p-2 rounded">
                {order.trackingNumber}
              </div>
            </div>
            
            <a 
              href={`https://www.aftership.com/track?tracking_number=${order.trackingNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 bg-gray-100 p-2 rounded hover:bg-gray-200"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="bg-gray-50 p-2 rounded text-sm text-gray-600 mb-2">
              {t('noTrackingYet') || "Tracking number will appear here when your order ships"}
            </div>
            
            {/* Примечание: в реальном приложении этот input блок будет скрыт для пользователей */}
            {/* Он оставлен только для демонстрации функционала */}
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-blue-600">{t('adminTools') || "Admin Tools"}</summary>
              <div className="mt-2 border-t pt-2">
                <div className="flex">
                  <div className="flex-1 mr-2">
                    <MaterialInput
                      id={`tracking-${order.id}`}
                      label={t('trackingNumber') || 'Tracking Number'}
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleUpdateTracking}
                    disabled={isUpdating || !trackingNumber.trim()}
                    className="bg-blue-600 text-white px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 self-end mb-1"
                  >
                    {isUpdating ? '...' : t('save') || 'Save'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('adminTrackingNote') || "Normally tracking numbers are updated automatically from Google Sheets"}
                </p>
              </div>
            </details>
          </div>
        )}
      </div>
    </Card>
  );
};

export default function OrdersList({ showDemoOrders = false }) {
  const { orders, isLoading, isError, updateOrderTrackingNumber } = useOrders();
  const { toast } = useToast();
  const { t } = useLocale();
  const { user } = useAppContext();
  const [, setLocation] = useLocation();
  
  // Проверка авторизации пользователя в продакшене (когда демо выключено)
  if (!user && !showDemoOrders) {
    return (
      <Card className="p-6 text-center">
        <LogIn className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600 mb-4">
          {t('loginToSeeOrders') || "Please log in to see your orders"}
        </p>
        <button
          onClick={() => setLocation('/checkout')}
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700"
        >
          <ShoppingBag className="inline-block mr-2" size={16} />
          {t('startShopping') || "Start Shopping"}
        </button>
      </Card>
    );
  }
  
  const handleUpdateTracking = async (orderId: number, trackingNumber: string) => {
    try {
      await updateOrderTrackingNumber(orderId, trackingNumber);
      toast({
        title: t('success') || 'Success',
        description: t('trackingUpdated') || 'Tracking number has been updated'
      });
    } catch (error) {
      toast({
        title: t('error') || 'Error',
        description: t('trackingUpdateFailed') || 'Failed to update tracking number',
        variant: 'destructive'
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <Card className="p-4 text-center text-red-600">
        <p>{t('errorFetchingOrders') || 'Error fetching orders. Please try again.'}</p>
      </Card>
    );
  }
  
  if (orders.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Package className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600">
          {t('noOrdersYet') || "You don't have any orders yet"}
        </p>
      </Card>
    );
  }
  
  return (
    <div>
      {orders.map(order => (
        <OrderCard 
          key={order.id} 
          order={order} 
          onUpdateTracking={handleUpdateTracking} 
        />
      ))}
    </div>
  );
}