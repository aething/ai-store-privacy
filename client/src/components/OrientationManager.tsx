import React, { useEffect, useState } from 'react';
import { useDeviceSize } from '@/hooks/use-device-size';
import { useLocale } from '@/context/LocaleContext';

/**
 * Компонент, который отображает уведомление, когда устройство находится в неподдерживаемой ориентации
 * Может ограничивать использование приложения только в определенной ориентации
 */
const OrientationManager: React.FC<{
  children: React.ReactNode;
  forcePortrait?: boolean;
  forceLandscape?: boolean;
}> = ({ 
  children, 
  forcePortrait = false, 
  forceLandscape = false 
}) => {
  const { isPortrait, isLandscape, isMobile, isTablet } = useDeviceSize();
  const { t } = useLocale();
  const [showOverlay, setShowOverlay] = useState(false);
  
  // Не применяем ограничения на десктопе
  const shouldRestrictOrientation = (isMobile || isTablet) && (forcePortrait || forceLandscape);
  
  useEffect(() => {
    if (!shouldRestrictOrientation) {
      setShowOverlay(false);
      return;
    }
    
    // Показываем оверлей, если ориентация не соответствует требуемой
    if ((forcePortrait && !isPortrait) || (forceLandscape && !isLandscape)) {
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
  }, [isPortrait, isLandscape, forcePortrait, forceLandscape, shouldRestrictOrientation]);
  
  if (!shouldRestrictOrientation) {
    return <>{children}</>;
  }
  
  return (
    <>
      {children}
      
      {/* Оверлей для уведомления о неправильной ориентации */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4 text-center">
          <div className="mb-8">
            {forcePortrait ? (
              <RotateToPortraitIcon />
            ) : (
              <RotateToLandscapeIcon />
            )}
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {forcePortrait 
              ? (t('pleaseRotateToPortrait') || 'Пожалуйста, поверните устройство') 
              : (t('pleaseRotateToLandscape') || 'Пожалуйста, поверните устройство горизонтально')}
          </h2>
          <p className="text-gray-300">
            {forcePortrait 
              ? (t('appBestInPortrait') || 'Это приложение лучше всего работает в портретной ориентации')
              : (t('appBestInLandscape') || 'Это приложение лучше всего работает в горизонтальной ориентации')}
          </p>
        </div>
      )}
    </>
  );
};

// Иконка для поворота в портретную ориентацию
const RotateToPortraitIcon: React.FC = () => (
  <div className="w-24 h-24 relative">
    <div className="w-12 h-20 border-2 border-white rounded-lg absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg className="w-20 h-20 text-white animate-spin-slow" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M7.11,8.53L5.7,7.11C4.8,8.27 4.24,9.61 4.07,11h2.02c0.14-0.87 0.49-1.72 1.02-2.47zM6.09,13H4.07c0.17,1.39 0.72,2.73 1.62,3.89l1.41-1.42c-0.52-0.75-0.87-1.59-1.01-2.47zm1.02,0c0.14,0.88 0.49,1.72 1.01,2.47l1.41-1.42c-0.9-1.16-1.45-2.5-1.62-3.89L7.11,13zm2.99,0l-2.01,0.05c0.78,2.83 3.08,5.13 5.91,5.91l0.05-2.02c-2.11-0.53-3.39-1.82-3.95-3.94zM13,4.07V2.05c-2.84,0.79-5.13,3.08-5.92,5.92l2.02,0.05C9.65,5.9 10.93,4.62 13,4.07zm0,1.02c-1.17,0.28-2.11,1.2-2.42,2.37l0.04,0.03L13,7.53V5.09zm0,7.91l-2.39,0.04c0.31,1.17 1.25,2.09 2.39,2.38v-2.42z"
        />
      </svg>
    </div>
  </div>
);

// Иконка для поворота в ландшафтную ориентацию
const RotateToLandscapeIcon: React.FC = () => (
  <div className="w-24 h-24 relative">
    <div className="w-20 h-12 border-2 border-white rounded-lg absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg className="w-20 h-20 text-white animate-spin-slow" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M7.11,8.53L5.7,7.11C4.8,8.27 4.24,9.61 4.07,11h2.02c0.14-0.87 0.49-1.72 1.02-2.47zM6.09,13H4.07c0.17,1.39 0.72,2.73 1.62,3.89l1.41-1.42c-0.52-0.75-0.87-1.59-1.01-2.47zm1.02,0c0.14,0.88 0.49,1.72 1.01,2.47l1.41-1.42c-0.9-1.16-1.45-2.5-1.62-3.89L7.11,13zm2.99,0l-2.01,0.05c0.78,2.83 3.08,5.13 5.91,5.91l0.05-2.02c-2.11-0.53-3.39-1.82-3.95-3.94zM13,4.07V2.05c-2.84,0.79-5.13,3.08-5.92,5.92l2.02,0.05C9.65,5.9 10.93,4.62 13,4.07zm0,1.02c-1.17,0.28-2.11,1.2-2.42,2.37l0.04,0.03L13,7.53V5.09zm0,7.91l-2.39,0.04c0.31,1.17 1.25,2.09 2.39,2.38v-2.42z"
        />
      </svg>
    </div>
  </div>
);

export default OrientationManager;