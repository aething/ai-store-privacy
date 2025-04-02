import { useState, useEffect } from 'react';
import { useDeviceSize } from './use-device-size';

/**
 * Интерфейс для передачи размеров текста для разных устройств
 */
interface TextSizeConfig {
  xs?: number | string;
  sm?: number | string;
  md?: number | string;
  lg?: number | string;
  xl?: number | string;
  base: number | string;
}

/**
 * Хук для адаптивного изменения размера текста
 * @param config Конфигурация размеров для разных устройств
 * @returns Текущий размер текста
 */
export function useResponsiveText(config: TextSizeConfig): string | number {
  const { deviceSize } = useDeviceSize();
  const [textSize, setTextSize] = useState<string | number>(config.base);
  
  useEffect(() => {
    // Выбираем размер в зависимости от устройства
    let newSize: string | number = config.base;
    
    switch (deviceSize) {
      case 'xs':
        if (config.xs !== undefined) newSize = config.xs;
        break;
      case 'sm':
        if (config.sm !== undefined) newSize = config.sm;
        break;
      case 'md':
        if (config.md !== undefined) newSize = config.md;
        break;
      case 'lg':
        if (config.lg !== undefined) newSize = config.lg;
        break;
      case 'xl':
        if (config.xl !== undefined) newSize = config.xl;
        break;
    }
    
    setTextSize(newSize);
  }, [deviceSize, config]);
  
  return textSize;
}

/**
 * Адаптивный размер заголовка h1
 */
export function useH1Size(): string {
  return useResponsiveText({
    xs: 'text-2xl',
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
    base: 'text-3xl',
  }) as string;
}

/**
 * Адаптивный размер заголовка h2
 */
export function useH2Size(): string {
  return useResponsiveText({
    xs: 'text-xl',
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    base: 'text-2xl',
  }) as string;
}

/**
 * Адаптивный размер заголовка h3
 */
export function useH3Size(): string {
  return useResponsiveText({
    xs: 'text-lg',
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    base: 'text-xl',
  }) as string;
}

/**
 * Адаптивный размер обычного текста
 */
export function useBodySize(): string {
  return useResponsiveText({
    xs: 'text-sm',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-base',
    xl: 'text-lg',
    base: 'text-base',
  }) as string;
}

/**
 * Адаптивный размер мелкого текста
 */
export function useSmallSize(): string {
  return useResponsiveText({
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm',
    xl: 'text-base',
    base: 'text-sm',
  }) as string;
}