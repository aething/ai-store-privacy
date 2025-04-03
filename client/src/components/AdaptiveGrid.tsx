import React from 'react';
import { useDeviceSize } from '@/hooks/use-device-size';

interface AdaptiveGridProps {
  children: React.ReactNode[];
  className?: string;
  gap?: number | string;
  minItemWidth?: number | string;
}

/**
 * Компонент для отображения элементов в адаптивной сетке
 * Автоматически определяет количество колонок в зависимости от размера экрана
 */
const AdaptiveGrid: React.FC<AdaptiveGridProps> = ({
  children,
  className = '',
  gap = 'gap-4',
  minItemWidth = '250px',
}) => {
  const { deviceSize } = useDeviceSize();
  
  // Определяем количество колонок в зависимости от размера устройства
  const getColumns = () => {
    switch (deviceSize) {
      case 'xs': return 1;
      case 'sm': return 2;
      case 'md': return 3;
      case 'lg': return 4;
      case 'xl': return 5;
      default: return 3;
    }
  };
  
  // CSS-переменная для минимальной ширины элемента
  const itemWidthStyle = {
    '--min-item-width': typeof minItemWidth === 'number' ? `${minItemWidth}px` : minItemWidth,
  } as React.CSSProperties;
  
  // Для очень маленьких экранов используем одну колонку
  if (deviceSize === 'xs') {
    return (
      <div className={`flex flex-col ${typeof gap === 'string' ? gap : `gap-${gap}`} ${className}`}>
        {children}
      </div>
    );
  }
  
  return (
    <div 
      className={`grid ${typeof gap === 'string' ? gap : `gap-${gap}`} ${className}`}
      style={{
        ...itemWidthStyle,
        gridTemplateColumns: `repeat(auto-fill, minmax(var(--min-item-width), 1fr))`,
      }}
    >
      {children}
    </div>
  );
};

export default AdaptiveGrid;