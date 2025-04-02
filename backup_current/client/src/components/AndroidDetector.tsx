import { useState, useEffect } from 'react';
import { isAndroidApp } from '../utils/capacitorBridge';
import '../styles/android.css';

/**
 * Компонент для обнаружения запуска в Android/Capacitor
 * и отображения сообщения о нативной среде
 */
function AndroidDetector() {
  const [isAndroid, setIsAndroid] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  
  useEffect(() => {
    // Проверяем, запущено ли приложение в Android
    const androidDetected = isAndroidApp();
    setIsAndroid(androidDetected);
    
    // Проверяем, нужно ли показывать баннер (не показываем, если пользователь ранее закрыл)
    const bannerDismissed = localStorage.getItem('android_banner_dismissed') === 'true';
    setShowBanner(!bannerDismissed);
  }, []);
  
  // Не рендерим ничего, если не Android или баннер был закрыт
  if (!isAndroid || !showBanner) {
    return null;
  }
  
  // Функция для закрытия баннера
  const dismissBanner = () => {
    localStorage.setItem('android_banner_dismissed', 'true');
    setShowBanner(false);
  };
  
  return (
    <div className="android-banner">
      <div className="android-banner-content">
        <div className="android-banner-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6,18c0,0.55 0.45,1 1,1h1v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5L11,19h2v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5L16,19h1c0.55,0 1,-0.45 1,-1L18,8L6,8L6,18zM3.5,8C2.67,8 2,8.67 2,9.5v7c0,0.83 0.67,1.5 1.5,1.5S5,17.33 5,16.5v-7C5,8.67 4.33,8 3.5,8zM20.5,8c-0.83,0 -1.5,0.67 -1.5,1.5v7c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5v-7c0,-0.83 -0.67,-1.5 -1.5,-1.5zM15.53,2.16l1.3,-1.3c0.2,-0.2 0.2,-0.51 0,-0.71 -0.2,-0.2 -0.51,-0.2 -0.71,0l-1.48,1.48C13.85,1.23 12.95,1 12,1c-0.96,0 -1.86,0.23 -2.66,0.63L7.85,0.15c-0.2,-0.2 -0.51,-0.2 -0.71,0 -0.2,0.2 -0.2,0.51 0,0.71l1.31,1.31C6.97,3.26 6,5.01 6,7h12c0,-1.99 -0.97,-3.75 -2.47,-4.84zM10,5L9,5L9,4h1v1zM15,5h-1L14,4h1v1z" fill="#3DDC84"/>
          </svg>
        </div>
        <div className="android-banner-message">
          Приложение запущено в режиме Android. 
          Доступен расширенный оффлайн-режим и нативные функции.
        </div>
        <button className="android-banner-close" onClick={dismissBanner}>
          ✕
        </button>
      </div>
    </div>
  );
}

// Добавляем CSS в отдельном файле (client/src/styles/android.css)
export default AndroidDetector;