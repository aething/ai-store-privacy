import React, { useMemo, useRef, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { getPolicyById } from "@/constants/policies";
import { useLocale } from "@/context/LocaleContext";
import SwipeBack from "@/components/SwipeBack";
import { X, MoveLeft } from "lucide-react";
import SimpleScrollToTop from "@/components/SimpleScrollToTop";
import { scrollToTop, scrollContainerToTop, saveScrollPositionForPath } from "@/lib/scrollUtils";

export default function Policy() {
  const [match, params] = useRoute("/policy/:id");
  const [, setLocation] = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();
  
  const policyId = match ? params.id : null;
  
  const policy = useMemo(() => {
    if (!policyId) return null;
    return getPolicyById(policyId);
  }, [policyId]);
  
  // Функция сброса прокрутки (в стиле InfoPage)
  const resetScrollPosition = () => {
    // Сбрасываем глобальный скролл страницы
    window.scrollTo(0, 0);
    
    // Сбрасываем скролл контента
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    
    // Дополнительно используем утилиты скролла
    scrollContainerToTop(contentRef, false);
    scrollToTop(false);
    
    // Сохраняем текущую позицию скролла для возврата
    saveScrollPositionForPath('/account');
    saveScrollPositionForPath('/');
    
    console.log('[Policy] Прокрутили страницу и контент наверх');
  };

  // При монтировании компонента и изменении policyId скроллим страницу и контент наверх
  useEffect(() => {
    if (policy) {
      // Сразу сбрасываем прокрутку
      resetScrollPosition();
      
      // Дополнительный сброс с таймерами для надежности (как в InfoPage)
      const timer1 = setTimeout(resetScrollPosition, 50);
      const timer2 = setTimeout(resetScrollPosition, 150);
      const timer3 = setTimeout(resetScrollPosition, 300);
      const timer4 = setTimeout(resetScrollPosition, 500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [policyId, policy]);
  
  if (!policy) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">{t("policyNotFound")}</h2>
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setLocation("/account")}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <Card className="p-4">
            <p>{t("policyCouldNotBeFound")}</p>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <SwipeBack onSwipeBack={() => {
      // При свайпе назад используем history.back() для работы 
      // с механизмом восстановления позиции скролла
      window.history.back();
    }}>
      <div id="policy-root" className="w-full max-w-4xl mx-auto bg-white flex flex-col min-h-screen sm:min-h-0 sm:rounded-lg sm:shadow-lg sm:my-4">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">{policy.title}</h2>
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => {
              // Возвращаемся на страницу Account с помощью history.back()
              // для правильной работы с механизмом восстановления позиции скролла
              window.history.back();
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Удалили подсказку для свайпа, так как она может влиять на скроллинг */}
        
        {/* Scrollable content area без ограничения по высоте */}
        <div 
          ref={contentRef}
          className="flex-1 p-4 overflow-auto"
        >
          <Card className="p-4 rounded-lg">
            <div dangerouslySetInnerHTML={{ __html: policy.content }} />
          </Card>
          
          {/* Back to top button - используем новый компонент */}
          <div className="flex justify-center mt-6 mb-4">
            <SimpleScrollToTop contentRef={contentRef} />
          </div>
        </div>
      </div>
    </SwipeBack>
  );
}
