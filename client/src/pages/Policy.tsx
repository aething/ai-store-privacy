import React, { useEffect, useMemo, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { getPolicyById } from "@/constants/policies";
import { useLocale } from "@/context/LocaleContext";
import SwipeBack from "@/components/SwipeBack";
import { X, MoveLeft } from "lucide-react";
import { scrollToTop as globalScrollToTop } from "@/lib/scrollUtils";
import ScrollToTopButton from "@/components/ScrollToTopButton";

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
  
  // Скроллим содержимое страницы в начало при загрузке
  useEffect(() => {
    // Простая прокрутка страницы к началу
    window.scrollTo(0, 0);
    
    // Скроллим контент, если он существует
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    
    // Повторный скролл с задержкой для подстраховки на медленных устройствах
    const delayedScrollTimer = setTimeout(() => {
      window.scrollTo(0, 0);
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }, 100);
    
    return () => {
      clearTimeout(delayedScrollTimer);
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
    <SwipeBack onSwipeBack={() => setLocation("/account")}>
      <div id="policy-root" className="w-full max-w-4xl mx-auto bg-white flex flex-col min-h-screen sm:min-h-0 sm:rounded-lg sm:shadow-lg sm:my-4">
        {/* Якорь для верхней точки страницы */}
        <div id="policy-page-top" className="scroll-m-0"></div>
        
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">{policy.title}</h2>
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => {
              // Используем глобальную утилиту скроллинга перед навигацией
              globalScrollToTop(false);
              setLocation("/account");
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Вспомогательная подсказка для свайпа */}
        <div className="text-gray-400 text-xs text-center py-1 border-b">
          <MoveLeft size={14} className="inline mr-1" />
          {t("swipeRightToGoBack")}
        </div>
        
        {/* Scrollable content area без ограничения по высоте */}
        <div 
          ref={contentRef}
          className="flex-1 p-4 overflow-auto"
        >
          <Card className="p-4 rounded-lg">
            <div dangerouslySetInnerHTML={{ __html: policy.content }} />
          </Card>
          
          {/* Back to top button */}
          <div className="flex justify-center mt-6 mb-4">
            <ScrollToTopButton contentRef={contentRef} />
          </div>
        </div>
      </div>
    </SwipeBack>
  );
}
