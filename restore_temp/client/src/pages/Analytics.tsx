import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from '@/context/LocaleContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Типы данных для аналитики
interface AnalyticsData {
  // Общие метрики
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  
  // Данные по продуктам
  productViews: {
    productId: number;
    productName: string;
    views: number;
  }[];
  
  // Данные по конверсии
  conversionRate: number;
  
  // Активность пользователей
  userActivity: {
    date: string;
    activeUsers: number;
  }[];
  
  // Геолокационные данные
  geoData: {
    country: string;
    users: number;
  }[];
  
  // Данные по платформам
  platformData: {
    platform: string;
    users: number;
  }[];
}

// Типы временных интервалов
type TimeRange = 'day' | 'week' | 'month' | 'year';

const Analytics = () => {
  const { t } = useLocale();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  
  // Запрос данных аналитики
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      // В реальном приложении здесь был бы запрос к API
      // return await apiRequest('GET', `/api/analytics?range=${timeRange}`);
      
      // Для демонстрации используем моковые данные
      return mockAnalyticsData(timeRange);
    }
  });
  
  // Мок данных для демонстрации
  const mockAnalyticsData = (range: TimeRange): AnalyticsData => {
    // В реальном приложении данные будут приходить с сервера
    const baseData: AnalyticsData = {
      totalUsers: 1250,
      totalOrders: 328,
      totalRevenue: 12489.99,
      
      productViews: [
        { productId: 1, productName: 'AI Personal Assistant', views: 842 },
        { productId: 2, productName: 'Smart Home Hub', views: 756 },
        { productId: 3, productName: 'AI Learning System', views: 621 },
      ],
      
      conversionRate: 8.4,
      
      userActivity: [
        { date: '2025-03-23', activeUsers: 124 },
        { date: '2025-03-24', activeUsers: 132 },
        { date: '2025-03-25', activeUsers: 145 },
        { date: '2025-03-26', activeUsers: 138 },
        { date: '2025-03-27', activeUsers: 156 },
        { date: '2025-03-28', activeUsers: 187 },
        { date: '2025-03-29', activeUsers: 197 },
      ],
      
      geoData: [
        { country: 'США', users: 543 },
        { country: 'Германия', users: 231 },
        { country: 'Франция', users: 187 },
        { country: 'Россия', users: 156 },
        { country: 'Другие', users: 133 },
      ],
      
      platformData: [
        { platform: 'Android', users: 682 },
        { platform: 'iOS', users: 324 },
        { platform: 'Web', users: 244 },
      ]
    };
    
    // Модификация данных в зависимости от выбранного диапазона
    switch (range) {
      case 'day':
        return {
          ...baseData,
          totalUsers: Math.round(baseData.totalUsers / 7),
          totalOrders: Math.round(baseData.totalOrders / 7),
          totalRevenue: Math.round(baseData.totalRevenue / 7),
          userActivity: baseData.userActivity.slice(-1),
        };
      case 'month':
        return {
          ...baseData,
          totalUsers: baseData.totalUsers * 4,
          totalOrders: baseData.totalOrders * 4,
          totalRevenue: baseData.totalRevenue * 4,
          userActivity: [...baseData.userActivity, ...baseData.userActivity, ...baseData.userActivity, ...baseData.userActivity],
        };
      case 'year':
        return {
          ...baseData,
          totalUsers: baseData.totalUsers * 52,
          totalOrders: baseData.totalOrders * 52,
          totalRevenue: baseData.totalRevenue * 52,
          userActivity: Array(52).fill(0).map((_, i) => ({
            date: `Week ${i + 1}`,
            activeUsers: 100 + Math.round(Math.random() * 100)
          })),
        };
      default:
        return baseData;
    }
  };
  
  // Отображение ошибки загрузки данных
  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700">
          {t('analyticsError') || 'Error loading analytics data'}
        </h2>
        <p className="text-red-600">
          {(error as Error).message}
        </p>
      </div>
    );
  }
  
  // Компонент отображения числовой метрики
  const MetricCard = ({ title, value, unit = '', icon }: { title: string, value: number | string, unit?: string, icon: string }) => (
    <div className="bg-white rounded-lg shadow-md p-4 hover-lift hover-shadow">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        <span className="material-icons text-primary">{icon}</span>
      </div>
      <p className="text-3xl font-semibold mt-2">
        {value}{unit}
      </p>
    </div>
  );
  
  // Отображение загрузки
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">{t('analytics') || 'Analytics'}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse"></div>
          ))}
        </div>
        <div className="bg-gray-100 rounded-lg h-64 mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-100 rounded-lg h-80 animate-pulse"></div>
          <div className="bg-gray-100 rounded-lg h-80 animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('analytics') || 'Analytics'}</h1>
        
        {/* Селектор временного диапазона */}
        <div className="bg-white rounded-lg shadow-sm p-1 flex">
          {(['day', 'week', 'month', 'year'] as TimeRange[]).map((range) => (
            <button
              key={range}
              className={`px-4 py-2 rounded-md ${timeRange === range ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setTimeRange(range)}
            >
              {t(range) || range}
            </button>
          ))}
        </div>
      </div>
      
      {analyticsData && (
        <>
          {/* Основные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard 
              title={t('totalUsers') || 'Total Users'} 
              value={analyticsData.totalUsers} 
              icon="people" 
            />
            <MetricCard 
              title={t('totalOrders') || 'Total Orders'} 
              value={analyticsData.totalOrders} 
              icon="shopping_cart" 
            />
            <MetricCard 
              title={t('totalRevenue') || 'Total Revenue'} 
              value={`$${analyticsData.totalRevenue.toLocaleString()}`} 
              icon="attach_money" 
            />
            <MetricCard 
              title={t('conversionRate') || 'Conversion Rate'} 
              value={analyticsData.conversionRate} 
              unit="%" 
              icon="trending_up" 
            />
          </div>
          
          {/* График активности пользователей */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('userActivity') || 'User Activity'}</h2>
            <div className="h-64 flex items-end space-x-2">
              {analyticsData.userActivity.map((day, index) => {
                // Находим максимальное значение для нормализации высоты
                const maxUsers = Math.max(...analyticsData.userActivity.map(d => d.activeUsers));
                const height = (day.activeUsers / maxUsers) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full">
                      <div 
                        className="bg-blue-500 hover:bg-blue-600 rounded-t-sm transition-all duration-300"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                      ></div>
                      <div className="absolute bottom-0 left-0 right-0 transform translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs rounded p-1 text-center">
                        {day.activeUsers} {t('users') || 'users'}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Нижние графики */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Популярность продуктов */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">{t('productPopularity') || 'Product Popularity'}</h2>
              <div className="space-y-4">
                {analyticsData.productViews.map((product) => (
                  <div key={product.productId} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{product.productName}</span>
                      <span className="text-sm text-gray-500">{product.views} {t('views') || 'views'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(product.views / Math.max(...analyticsData.productViews.map(p => p.views))) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Распределение по странам */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">{t('geoDistribution') || 'Geographic Distribution'}</h2>
              <div className="space-y-4">
                {analyticsData.geoData.map((geo, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full mr-2" 
                        style={{ 
                          backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
                        }}
                      ></span>
                      <span>{geo.country}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">{geo.users}</span>
                      <span className="text-gray-500 text-sm ml-1">
                        ({Math.round((geo.users / analyticsData.totalUsers) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Распределение по платформам */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">{t('platformDistribution') || 'Platform Distribution'}</h2>
              <div className="space-y-4">
                {analyticsData.platformData.map((platform, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{platform.platform}</span>
                      <span className="text-sm text-gray-500">{platform.users} {t('users') || 'users'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${(platform.users / analyticsData.totalUsers) * 100}%`,
                          backgroundColor: index === 0 ? '#34A853' : index === 1 ? '#4285F4' : '#FBBC05'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Кнопки экспорта */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">{t('exportData') || 'Export Data'}</h2>
              <p className="text-gray-600 mb-4">
                {t('exportDescription') || 'Export analytics data in different formats for further analysis or reporting.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  className="md-btn-primary flex items-center justify-center"
                  onClick={() => {
                    toast({
                      title: t('exportStarted') || 'Export Started',
                      description: t('csvExportDesc') || 'CSV file will be downloaded shortly.',
                    });
                  }}
                >
                  <span className="material-icons mr-2">download</span>
                  {t('exportCSV') || 'Export CSV'}
                </button>
                <button 
                  className="md-btn-outlined flex items-center justify-center"
                  onClick={() => {
                    toast({
                      title: t('exportStarted') || 'Export Started',
                      description: t('pdfExportDesc') || 'PDF report will be generated shortly.',
                    });
                  }}
                >
                  <span className="material-icons mr-2">picture_as_pdf</span>
                  {t('exportPDF') || 'Export PDF'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;