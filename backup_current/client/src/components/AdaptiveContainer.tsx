import React from 'react';
import { useDeviceSize } from '@/hooks/use-device-size';

interface AdaptiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileOnly?: boolean;
  tabletOnly?: boolean;
  desktopOnly?: boolean;
  landscapeOnly?: boolean;
  portraitOnly?: boolean;
  style?: React.CSSProperties;
  mobileStyle?: React.CSSProperties;
  tabletStyle?: React.CSSProperties;
  desktopStyle?: React.CSSProperties;
  landscapeStyle?: React.CSSProperties;
  portraitStyle?: React.CSSProperties;
}

/**
 * Контейнер, который адаптируется к размеру устройства
 * Может отображать разный контент или стили в зависимости от устройства
 */
const AdaptiveContainer: React.FC<AdaptiveContainerProps> = ({
  children,
  className = '',
  mobileOnly = false,
  tabletOnly = false,
  desktopOnly = false,
  landscapeOnly = false,
  portraitOnly = false,
  style = {},
  mobileStyle = {},
  tabletStyle = {},
  desktopStyle = {},
  landscapeStyle = {},
  portraitStyle = {},
}) => {
  const {
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
  } = useDeviceSize();
  
  // Проверяем, должен ли компонент отображаться для текущего устройства
  const shouldRender = (
    (!mobileOnly && !tabletOnly && !desktopOnly) || 
    (mobileOnly && isMobile) || 
    (tabletOnly && isTablet) || 
    (desktopOnly && isDesktop)
  ) && (
    (!landscapeOnly && !portraitOnly) ||
    (landscapeOnly && isLandscape) ||
    (portraitOnly && isPortrait)
  );
  
  if (!shouldRender) {
    return null;
  }
  
  // Формируем объект стилей в зависимости от устройства
  const computedStyle = {
    ...style,
    ...(isMobile ? mobileStyle : {}),
    ...(isTablet ? tabletStyle : {}),
    ...(isDesktop ? desktopStyle : {}),
    ...(isLandscape ? landscapeStyle : {}),
    ...(isPortrait ? portraitStyle : {}),
  };
  
  return (
    <div className={className} style={computedStyle}>
      {children}
    </div>
  );
};

export default AdaptiveContainer;