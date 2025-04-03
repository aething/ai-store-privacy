import React, { useState, useEffect } from 'react';
import { useDeviceSize } from '@/hooks/use-device-size';

interface PhoneMockupProps {
  children: React.ReactNode;
  showMockup?: boolean;
  mockupColor?: 'black' | 'white' | 'gray';
  className?: string;
}

/**
 * Компонент, который оборачивает содержимое в макет мобильного телефона
 * Полезно для демонстрации мобильного приложения в браузере
 */
const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  showMockup = true,
  mockupColor = 'black',
  className = '',
}) => {
  const { isMobile, deviceSize } = useDeviceSize();
  const [mockupVisible, setMockupVisible] = useState(showMockup);
  
  // На мобильных устройствах не показываем макет
  useEffect(() => {
    setMockupVisible(showMockup && !isMobile);
  }, [showMockup, isMobile]);
  
  // Цвета для разных вариантов макета
  const colorClasses = {
    black: 'bg-gray-900 border-gray-800',
    white: 'bg-gray-100 border-gray-200',
    gray: 'bg-gray-300 border-gray-400',
  };
  
  // Применяем разные размеры в зависимости от экрана
  const getSizeClasses = () => {
    if (deviceSize === 'xl') {
      return {
        container: 'w-[340px] h-[680px] rounded-[36px] border-[12px]',
        screen: 'rounded-[24px]',
        notch: 'w-32 h-6 rounded-b-xl',
      };
    }
    
    if (deviceSize === 'lg') {
      return {
        container: 'w-[320px] h-[640px] rounded-[32px] border-[10px]',
        screen: 'rounded-[22px]',
        notch: 'w-28 h-5 rounded-b-xl',
      };
    }
    
    return {
      container: 'w-[280px] h-[560px] rounded-[28px] border-[8px]',
      screen: 'rounded-[20px]',
      notch: 'w-24 h-4 rounded-b-lg',
    };
  };
  
  const sizeClasses = getSizeClasses();
  
  if (!mockupVisible) {
    return <div className={`w-full h-full ${className}`}>{children}</div>;
  }
  
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div 
        className={`relative ${sizeClasses.container} ${colorClasses[mockupColor]} shadow-xl`}
      >
        {/* Экран */}
        <div className={`absolute inset-0 bg-white overflow-hidden ${sizeClasses.screen}`}>
          {/* Вырез (notch) */}
          <div 
            className={`absolute top-0 left-1/2 transform -translate-x-1/2 ${sizeClasses.notch} ${colorClasses[mockupColor]}`}
          />
          
          {/* Содержимое */}
          <div className="w-full h-full overflow-auto">
            {children}
          </div>
        </div>
        
        {/* Кнопки */}
        <div className={`absolute -right-[14px] top-24 h-16 w-[4px] rounded-r ${mockupColor === 'black' ? 'bg-gray-800' : 'bg-gray-300'}`} />
        <div className={`absolute -right-[14px] top-44 h-20 w-[4px] rounded-r ${mockupColor === 'black' ? 'bg-gray-800' : 'bg-gray-300'}`} />
        <div className={`absolute -left-[14px] top-32 h-16 w-[4px] rounded-l ${mockupColor === 'black' ? 'bg-gray-800' : 'bg-gray-300'}`} />
      </div>
    </div>
  );
};

export default PhoneMockup;