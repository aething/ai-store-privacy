import React from 'react';
import { useDeviceSize } from '@/hooks/use-device-size';
import { useLocale } from '@/context/LocaleContext';
import { Star, StarHalf, Download, Tags, ShieldCheck, Share, RefreshCcw, Image } from 'lucide-react';
import SwipeableCarousel from './SwipeableCarousel';

interface PlayMarketCardProps {
  appName: string;
  developer: string;
  icon: string | React.ReactNode;
  rating: number;
  reviews: number;
  downloads: string;
  category: string;
  contentRating: string;
  onInstall: () => void;
  onShare: () => void;
  isInstalling?: boolean;
}

const PlayMarketCard: React.FC<PlayMarketCardProps> = ({
  appName,
  developer,
  icon,
  rating,
  reviews,
  downloads,
  category,
  contentRating,
  onInstall,
  onShare,
  isInstalling = false,
}) => {
  const { isMobile } = useDeviceSize();
  const { t } = useLocale();
  
  // Рендеринг звездного рейтинга
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="text-yellow-500" size={18} fill="currentColor" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} className="text-yellow-500" size={18} fill="currentColor" />);
      } else {
        stars.push(<Star key={i} className="text-gray-300" size={18} />);
      }
    }
    
    return <div className="flex">{stars}</div>;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4">
        {/* Шапка карточки в стиле Google Play */}
        <div className="flex items-start space-x-4 mb-4">
          {/* Иконка приложения */}
          <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
            {typeof icon === 'string' ? (
              <img src={icon} alt={appName} className="w-full h-full object-cover" />
            ) : (
              icon
            )}
          </div>
          
          {/* Информация о приложении */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">{appName}</h2>
            <p className="text-blue-600 text-sm mb-1">{developer}</p>
            <div className="flex items-center">
              <div className="flex items-center">
                <span className="font-semibold mr-1">{rating}</span>
                {isMobile ? (
                  <Star className="text-yellow-500" size={18} fill="currentColor" />
                ) : (
                  renderStars(rating)
                )}
              </div>
              <span className="text-xs text-gray-500 ml-2">
                {reviews} {t("reviews") || "reviews"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Статистика и кнопки */}
        <div className="flex flex-col space-y-3">
          {/* Статистика */}
          <div className="flex justify-between text-sm">
            <div className="text-center flex-1">
              <p className="font-semibold">{downloads}</p>
              <p className="text-xs text-gray-600">{t("downloads") || "downloads"}</p>
            </div>
            
            <div className="text-center flex-1">
              <Tags className="text-gray-700 mx-auto mb-1" size={20} />
              <p className="text-xs text-gray-600">{category}</p>
            </div>
            
            <div className="text-center flex-1">
              <ShieldCheck className="text-gray-700 mx-auto mb-1" size={20} />
              <p className="text-xs text-gray-600">{contentRating}</p>
            </div>
          </div>
          
          {/* Кнопки действий */}
          <div className="flex space-x-2">
            <button
              onClick={onInstall}
              disabled={isInstalling}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {isInstalling ? (
                <RefreshCcw className="animate-spin mr-1" size={16} />
              ) : (
                <Download className="mr-1" size={16} />
              )}
              {t("install") || "Install"}
            </button>
            
            <button
              onClick={onShare}
              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Share size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ScreenshotGalleryProps {
  screenshots: string[];
  placeholderLabels?: string[];
}

export const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({ 
  screenshots, 
  placeholderLabels = [] 
}) => {
  const { deviceSize, isMobile, isLandscape } = useDeviceSize();
  const { t } = useLocale();
  
  // Определяем количество отображаемых скриншотов на экране
  const getVisibleItems = () => {
    if (isLandscape) {
      return { xs: 2, sm: 3, md: 3, lg: 4, xl: 5 };
    }
    return { xs: 1.5, sm: 2.5, md: 3, lg: 3.5, xl: 4 };
  };
  
  // Определяем высоту скриншота в зависимости от устройства
  const getScreenshotHeight = () => {
    if (isLandscape) {
      return isMobile ? 140 : 200;
    }
    return isMobile ? 280 : 400;
  };
  
  // Рендерим плейсхолдер для скриншота
  const renderPlaceholder = (index: number) => {
    const label = placeholderLabels[index] || `Screenshot ${index + 1}`;
    
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-100">
        <Image className="text-4xl mb-2" size={36} />
        <span className="text-center px-2">{label}</span>
      </div>
    );
  };
  
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-3">{t("screenshots") || "Screenshots"}</h2>
      
      <SwipeableCarousel
        visibleItems={getVisibleItems()}
        showArrows={!isMobile}
        showDots={true}
        gap={12}
      >
        {screenshots.map((screenshot, index) => (
          <div
            key={index}
            className="rounded-lg overflow-hidden border border-gray-200"
            style={{ height: `${getScreenshotHeight()}px` }}
          >
            {screenshot ? (
              <img 
                src={screenshot} 
                alt={`Screenshot ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            ) : (
              renderPlaceholder(index)
            )}
          </div>
        ))}
      </SwipeableCarousel>
    </div>
  );
};

export default PlayMarketCard;