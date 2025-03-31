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
  
  // Полностью новая функция сброса прокрутки с принудительным подходом
  const resetScrollPosition = () => {
    // Принудительно сбрасываем скролл документа
    window.scrollTo({top: 0, left: 0, behavior: 'auto'});
    document.body.scrollTop = 0; // Для старых браузеров
    document.documentElement.scrollTop = 0;
    
    // Принудительно сбрасываем положение для нашего контент-контейнера
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    
    // Если есть корневой элемент, скролим его в верхнее положение во вьюпорте
    if (rootRef.current) {
      rootRef.current.scrollIntoView({block: 'start', behavior: 'auto'});
    }
    
    // Логируем для отладки
    console.log('[Policy] Принудительный сброс прокрутки', {
      windowScrollY: window.scrollY,
      contentScroll: contentRef.current?.scrollTop,
      path: window.location.pathname
    });
    
    // Дополнительно вызываем стандартные утилиты
    scrollToTop(false);
    scrollContainerToTop(contentRef, false);
    
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

  // Эффект при монтировании компонента
  useEffect(() => {
    // Устанавливаем флаг монтирования
    setMounted(true);
    
    // Сразу сбрасываем прокрутку
    resetScrollPosition();
    
    // Использует requestAnimationFrame для более надежной прокрутки
    scheduleScroll(resetScrollPosition);
    
    // Дополнительно используем таймеры на случай медленной загрузки контента
    const timers = [
      setTimeout(() => scheduleScroll(resetScrollPosition), 0),
      setTimeout(() => scheduleScroll(resetScrollPosition), 50),
      setTimeout(() => scheduleScroll(resetScrollPosition), 100),
      setTimeout(() => scheduleScroll(resetScrollPosition), 150),
      setTimeout(() => scheduleScroll(resetScrollPosition), 200),
      setTimeout(() => scheduleScroll(resetScrollPosition), 300),
      setTimeout(() => scheduleScroll(resetScrollPosition), 500),
      setTimeout(() => scheduleScroll(resetScrollPosition), 1000)
    ];
    
    // Очищаем все таймеры при размонтировании
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);
  
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
          id="info-content"
        >
          {/* Важный якорь для верхней части контента, используется PageTransition */}
          <div id="content-top"></div>
          
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
