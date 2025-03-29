import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface Order {
  id: number;
  userId: number;
  productId: number;
  status: string;
  amount: number;
  currency: string;
  stripePaymentId: string | null;
  trackingNumber: string | null;
  createdAt: string;
  product?: {
    title: string;
    imageUrl: string;
    price: number;
  };
}

// Демо-данные для неавторизованных пользователей
const DEMO_ORDERS: Order[] = [
  {
    id: 1001,
    userId: 999,
    productId: 1,
    status: 'ordered',
    amount: 299.99,
    currency: 'USD',
    stripePaymentId: 'demo_payment_id_1',
    trackingNumber: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 дня назад
    product: {
      title: 'AI Personal Assistant',
      imageUrl: '/assets/products/assistant.jpg',
      price: 299.99
    }
  },
  {
    id: 1002,
    userId: 999,
    productId: 2,
    status: 'shipped',
    amount: 149.99,
    currency: 'USD',
    stripePaymentId: 'demo_payment_id_2',
    trackingNumber: 'DEMO123456789',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 дней назад
    product: {
      title: 'Smart Home Hub',
      imageUrl: '/assets/products/smart-home.jpg',
      price: 149.99
    }
  },
  {
    id: 1003,
    userId: 999,
    productId: 3,
    status: 'complete',
    amount: 199.99,
    currency: 'USD',
    stripePaymentId: 'demo_payment_id_3',
    trackingNumber: 'DEMO987654321',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 дней назад
    product: {
      title: 'Wireless Earbuds',
      imageUrl: '/assets/products/earbuds.jpg',
      price: 199.99
    }
  }
];

// Хранение демо-данных между рендерами
let demoOrdersState = [...DEMO_ORDERS];

export function useOrders() {
  const { user } = useAppContext();
  const [demoOrders, setDemoOrders] = useState<Order[]>(demoOrdersState);
  
  const {
    data: orders,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['/api/users/orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return demoOrders;
      
      const response = await apiRequest('GET', `/api/users/${user.id}/orders`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const orderData = await response.json();
      return orderData as Order[];
    },
    enabled: true // Всегда выполняем запрос, даже если пользователь не авторизован
  });
  
  const updateOrderTrackingNumber = async (orderId: number, trackingNumber: string) => {
    // Для демо-режима - обновляем локальное состояние
    if (!user?.id) {
      const updatedDemoOrders = demoOrders.map(order => 
        order.id === orderId ? { ...order, trackingNumber } : order
      );
      setDemoOrders(updatedDemoOrders);
      demoOrdersState = updatedDemoOrders; // Обновляем глобальное состояние
      return { ...demoOrders.find(o => o.id === orderId), trackingNumber };
    }
    
    // Для авторизованных пользователей - отправляем на сервер
    const response = await apiRequest('POST', `/api/orders/${orderId}/update-tracking`, { trackingNumber });
    
    if (!response.ok) {
      throw new Error('Failed to update tracking number');
    }
    
    const updatedOrder = await response.json();
    await refetch(); // Reload the orders after updating
    
    return updatedOrder;
  };
  
  return {
    orders: user?.id ? (orders || []) : demoOrders,
    isLoading: user?.id ? isLoading : false,
    isError: user?.id ? isError : false,
    updateOrderTrackingNumber,
    refetch
  };
}