import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import Header from "./Header";
import PhoneMockup from "./PhoneMockup";
import OrientationManager from "./OrientationManager";
import { useDeviceSize } from "@/hooks/use-device-size";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isMobile, isTablet } = useDeviceSize();
  
  // Включаем навигацию свайпами (свайп вправо = кнопка "назад")
  useSwipeNavigation({
    directions: { right: true },
  });
  
  // Контент приложения
  const AppContent = () => (
    <div className="h-full flex flex-col pt-8 bg-background font-roboto">
      <Header />
      <main className="flex-1 px-4 pt-2 pb-20 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
  
  // На мобильных устройствах не показываем макет телефона
  if (isMobile || isTablet) {
    return (
      <OrientationManager forcePortrait={true}>
        <div className="min-h-screen bg-white">
          <AppContent />
        </div>
      </OrientationManager>
    );
  }
  
  // На десктопе показываем в рамке телефона
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 py-8 px-4">
      <PhoneMockup showMockup={true} mockupColor="black">
        <AppContent />
      </PhoneMockup>
    </div>
  );
}
