import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { useMemo, useRef } from "react";
import { getPolicyById } from "@/constants/policies";
import { useLocale } from "@/context/LocaleContext";

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
  
  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  if (!policy) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">{t("policyNotFound")}</h2>
          <button 
            className="material-icons p-2 rounded-full hover:bg-gray-100"
            onClick={() => setLocation("/account")}
            aria-label="Close"
          >
            close
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
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-medium">{policy.title}</h2>
        <button 
          className="material-icons p-2 rounded-full hover:bg-gray-100"
          onClick={() => setLocation("/account")}
          aria-label="Close"
        >
          close
        </button>
      </div>
      
      {/* Scrollable content area */}
      <div 
        ref={contentRef}
        className="flex-1 p-4 overflow-auto"
      >
        <Card className="p-4 rounded-lg">
          <div dangerouslySetInnerHTML={{ __html: policy.content }} />
        </Card>
        
        {/* Back to top button */}
        <div className="flex justify-center mt-6 mb-4">
          <button
            onClick={scrollToTop}
            className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center hover:bg-blue-700"
          >
            <span className="material-icons mr-1">arrow_upward</span>
            {t("backToTop")}
          </button>
        </div>
      </div>
    </div>
  );
}
