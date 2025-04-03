import { useState, useEffect } from 'react';

// Типы размеров устройств
export type DeviceSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Границы для определения размера устройства (в пикселях)
const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// Интерфейс для возвращаемых значений хука
export interface DeviceSizeInfo {
  // Текущий размер устройства
  deviceSize: DeviceSize;
  // Флаги для проверки разных размеров
  isMobile: boolean;    // xs, sm
  isTablet: boolean;    // md
  isDesktop: boolean;   // lg, xl
  // Ориентация экрана
  isPortrait: boolean;
  isLandscape: boolean;
  // Размеры окна
  width: number;
  height: number;
  // Функции сравнения
  isSmaller: (size: DeviceSize) => boolean;
  isLarger: (size: DeviceSize) => boolean;
  // Плотность пикселей устройства
  pixelRatio: number;
  // Сенсорный экран или нет
  isTouchDevice: boolean;
}

/**
 * Хук для определения размера устройства и других характеристик экрана
 * @returns Объект с информацией о размере устройства
 */
export function useDeviceSize(): DeviceSizeInfo {
  // Функция для получения текущего размера устройства
  const getDeviceSize = (): DeviceSize => {
    if (typeof window === 'undefined') return 'md'; // SSR fallback
    
    const width = window.innerWidth;
    if (width < breakpoints.sm) return 'xs';
    if (width < breakpoints.md) return 'sm';
    if (width < breakpoints.lg) return 'md';
    if (width < breakpoints.xl) return 'lg';
    return 'xl';
  };
  
  // Функция для получения ориентации экрана
  const getOrientation = (): { isPortrait: boolean; isLandscape: boolean } => {
    if (typeof window === 'undefined') {
      // SSR fallback
      return { isPortrait: true, isLandscape: false };
    }
    
    const portrait = window.innerHeight > window.innerWidth;
    return {
      isPortrait: portrait,
      isLandscape: !portrait,
    };
  };
  
  // Проверка на сенсорный экран
  const checkTouchDevice = (): boolean => {
    if (typeof window === 'undefined') return false; // SSR fallback
    
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  };
  
  // Начальные состояния
  const [deviceSize, setDeviceSize] = useState<DeviceSize>(getDeviceSize());
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  const [orientation, setOrientation] = useState(getOrientation());
  const [pixelRatio, setPixelRatio] = useState(
    typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  );
  const [isTouchDevice, setIsTouchDevice] = useState(checkTouchDevice());
  
  // Функция для сравнения размеров
  const getSizeIndex = (size: DeviceSize): number => {
    const sizeMap: Record<DeviceSize, number> = {
      xs: 0,
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4,
    };
    return sizeMap[size];
  };
  
  // Обновление размеров и характеристик при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
      const newSize = getDeviceSize();
      setDeviceSize(newSize);
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setOrientation(getOrientation());
      setPixelRatio(window.devicePixelRatio || 1);
    };
    
    // Добавляем слушатель изменения размера окна
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // При первом монтировании компонента также проверяем сенсорный экран
    setIsTouchDevice(checkTouchDevice());
    
    // Очистка слушателей
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  
  return {
    deviceSize,
    isMobile: deviceSize === 'xs' || deviceSize === 'sm',
    isTablet: deviceSize === 'md',
    isDesktop: deviceSize === 'lg' || deviceSize === 'xl',
    isPortrait: orientation.isPortrait,
    isLandscape: orientation.isLandscape,
    width: dimensions.width,
    height: dimensions.height,
    isSmaller: (size: DeviceSize) => getSizeIndex(deviceSize) < getSizeIndex(size),
    isLarger: (size: DeviceSize) => getSizeIndex(deviceSize) > getSizeIndex(size),
    pixelRatio,
    isTouchDevice,
  };
}