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

export function useOrders() {
  const { user } = useAppContext();
  
  const {
    data: orders,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['/api/users/orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const response = await apiRequest('GET', `/api/users/${user.id}/orders`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const orderData = await response.json();
      return orderData as Order[];
    },
    enabled: !!user?.id
  });
  
  const updateOrderTrackingNumber = async (orderId: number, trackingNumber: string) => {
    if (!user?.id) return null;
    
    const response = await apiRequest('POST', `/api/orders/${orderId}/update-tracking`, { trackingNumber });
    
    if (!response.ok) {
      throw new Error('Failed to update tracking number');
    }
    
    const updatedOrder = await response.json();
    await refetch(); // Reload the orders after updating
    
    return updatedOrder;
  };
  
  return {
    orders: orders || [],
    isLoading,
    isError,
    updateOrderTrackingNumber,
    refetch
  };
}