/**
 * Модуль для работы с базой данных (in-memory версия)
 */

interface Order {
  id: number;
  userId: number;
  productId: number;
  amount: number;
  currency: string;
  status: string;
  paymentIntentId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// In-memory хранилище заказов
const orders: Order[] = [];
let nextOrderId = 1;

// Методы для работы с заказами
const ordersDb = {
  /**
   * Создать новый заказ
   */
  create: async (data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    const newOrder: Order = {
      id: nextOrderId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    orders.push(newOrder);
    return newOrder;
  },
  
  /**
   * Получить заказ по ID
   */
  findById: async (id: number): Promise<Order | null> => {
    return orders.find(order => order.id === id) || null;
  },
  
  /**
   * Получить все заказы пользователя
   */
  findByUserId: async (userId: number): Promise<Order[]> => {
    return orders.filter(order => order.userId === userId);
  },
  
  /**
   * Обновить статус заказа
   */
  updateStatus: async (id: number, status: string): Promise<Order | null> => {
    const orderIndex = orders.findIndex(order => order.id === id);
    if (orderIndex === -1) return null;
    
    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date();
    
    return orders[orderIndex];
  }
};

// Экспортируем интерфейс базы данных
export const db = {
  orders: ordersDb
};