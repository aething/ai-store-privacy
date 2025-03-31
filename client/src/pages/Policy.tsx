import React, { useMemo, useRef, useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { getPolicyById } from "@/constants/policies";
import { useLocale } from "@/context/LocaleContext";
import SwipeBack from "@/components/SwipeBack";
import { X } from "lucide-react";
import SimpleScrollToTop from "@/components/SimpleScrollToTop";
import { scrollToTop, scrollContainerToTop, saveScrollPositionForPath } from "@/lib/scrollUtils";

export default function Policy() {
  const [match, params] = useRoute("/policy/:id");
  const [, setLocation] = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);
  
  const policyId = match ? params.id : null;
  
  const policy = useMemo(() => {
    if (!policyId) return null;
    return getPolicyById(policyId);
  }, [policyId]);
  
  // Упрощённая функция сброса прокрутки для страницы с единым скроллингом
  const resetScrollPosition = () => {
    // Сбрасываем глобальный скролл страницы
    window.scrollTo(0, 0);
    
    // Принудительно устанавливаем фокус на верхнюю часть страницы
    if (rootRef.current) {
      rootRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
    
    // Логируем для отладки
    console.log('[Policy] Сбросили скролл', {
      windowScrollY: window.scrollY,
      path: window.location.pathname
    });
    
    // Сохраняем позиции для возврата
    saveScrollPositionForPath('/account');
    saveScrollPositionForPath('/');
  };
  
  // Используем RAF для плавных анимаций и корректного рендеринга
  const scheduleScroll = (callback: () => void) => {
    requestAnimationFrame(() => {
      callback();
      
      // Иногда требуется еще один кадр для гарантии
      requestAnimationFrame(() => {
        callback();
      });
    });
  };

  // Эффект при монтировании компонента - копируем таймеры из InfoPage
  useEffect(() => {
    // Устанавливаем флаг монтирования
    setMounted(true);
    
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
  }, [policyId]);
  
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
      <div id="policy-root" ref={rootRef} className="w-full max-w-4xl mx-auto bg-white flex flex-col min-h-screen sm:min-h-0 sm:rounded-lg sm:shadow-lg sm:my-4">
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
        
        {/* Простой контейнер без отдельной прокрутки */}
        <div 
          ref={contentRef}
          className="flex-1 p-4"
          id="info-content"
        >
          {/* Важный якорь для верхней части контента */}
          <div id="content-top"></div>
          
          <Card className="p-4 rounded-lg">
            <div dangerouslySetInnerHTML={{ __html: policy.content }} />
          </Card>
          
          {/* Back to top button - использует window.scrollTo */}
          <div className="flex justify-center mt-6 mb-4">
            <Button
              className="bg-transparent hover:bg-gray-100 text-black border-2 border-blue-600"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              {t("scrollToTop")}
            </Button>
          </div>
        </div>
      </div>
    </SwipeBack>
  );
}
