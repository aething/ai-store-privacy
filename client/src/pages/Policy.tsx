import React, { useMemo, useRef, useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPolicyById } from "@/constants/policies";
import { getLocalizedPolicy } from "@/constants/multilingual-policies";
import { useLocale } from "@/context/LocaleContext";
import SwipeBack from "@/components/SwipeBack";
import { X } from "lucide-react";
import { saveScrollPositionForPath, scrollToTop } from "@/lib/scrollUtils";

export default function Policy() {
  const [match, params] = useRoute("/policy/:id");
  const [, setLocation] = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { t, currentLocale } = useLocale();
  const [mounted, setMounted] = useState(false);
  
  const policyId = match ? params.id : null;
  
  const policy = useMemo(() => {
    if (!policyId) return null;
    
    // Сначала проверяем наличие многоязычной версии политики
    const localizedPolicy = getLocalizedPolicy(policyId, currentLocale);
    if (localizedPolicy) {
      return {
        id: policyId,
        title: localizedPolicy.title,
        content: localizedPolicy.content
      };
    }
    
    // Если многоязычной версии нет, используем стандартную
    return getPolicyById(policyId);
  }, [policyId, currentLocale]);
  
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
    
    // Важно: НЕ перезаписываем позицию аккаунта здесь, чтобы сохранить исходную
    // Это позволит при возврате восстановить позицию страницы аккаунта, где был пользователь
    // saveScrollPositionForPath('/account'); - это приводило к сбросу запомненной позиции
    
    // Позицию главной страницы можно перезаписать, если потребуется
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
      // Устанавливаем скролл для страницы Account к разделу Policies
      import("@/lib/scrollUtils").then(({ scrollToAccountPoliciesSection }) => {
        // Логируем для отладки
        console.log('[Policy] Свайп назад - возвращаемся с прокруткой к разделу Policies');
        
        // Устанавливаем флаг для прокрутки к разделу Policies
        sessionStorage.setItem('account_scroll_to_policies', 'true');
        sessionStorage.setItem('account_scroll_timestamp', Date.now().toString());
        
        // Используем особый флаг в URL для явного указания места открытия страницы
        // Вместо использования window.history.back() с последующей прокруткой
        // переходим на страницу аккаунта с хэшем для точного позиционирования
        window.location.href = '/account#policies-section';
        
        // Очищаем флаги в sessionStorage, так как используем более надежное решение через URL-хэш
        sessionStorage.removeItem('account_scroll_to_policies');
        sessionStorage.removeItem('account_scroll_timestamp');
      });
    }}>
      <div id="policy-root" ref={rootRef} className="w-full max-w-4xl mx-auto bg-white flex flex-col min-h-screen sm:min-h-0 sm:rounded-lg sm:shadow-lg sm:my-4">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">{policy.title}</h2>
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => {
              // Устанавливаем скролл для страницы Account к разделу Policies
              import("@/lib/scrollUtils").then(({ scrollToAccountPoliciesSection }) => {
                // Логируем для отладки
                console.log('[Policy] Закрываем политику, устанавливаем прокрутку к разделу Policies');
                
                // Устанавливаем флаг для прокрутки к разделу Policies
                sessionStorage.setItem('account_scroll_to_policies', 'true');
                sessionStorage.setItem('account_scroll_timestamp', Date.now().toString());
                
                // Используем особый флаг в URL для явного указания места открытия страницы
                // Вместо использования window.history.back() с последующей прокруткой
                // переходим на страницу аккаунта с хэшем для точного позиционирования
                window.location.href = '/account#policies-section';
                
                // Очищаем флаги в sessionStorage, так как используем более надежное решение через URL-хэш
                sessionStorage.removeItem('account_scroll_to_policies');
                sessionStorage.removeItem('account_scroll_timestamp');
              });
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
          
          {/* Back to top button - использует scrollToTop из utils */}
          <div className="flex justify-center mt-6 mb-4">
            <Button
              className="bg-transparent hover:bg-gray-100 text-black border-2 border-blue-600"
              onClick={() => scrollToTop(true)}
            >
              {t("scrollToTop")}
            </Button>
          </div>
        </div>
      </div>
    </SwipeBack>
  );
}
