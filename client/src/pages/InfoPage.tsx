import { useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useLocale } from "@/context/LocaleContext";
import { getInfoPageById } from "@/constants/infoPages";
import SwipeBack from "@/components/SwipeBack";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home } from "lucide-react";

export default function InfoPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>("/info/:id");
  const { t } = useLocale();
  const contentRef = useRef<HTMLDivElement>(null);

  const infoPage = params && getInfoPageById(parseInt(params.id, 10));

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Scroll to top when page changes
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0 });
    }
  }, [params?.id]);

  if (!match || !infoPage) {
    return (
      <div className="flex flex-col items-center justify-center p-4 min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-2">{t("pageNotFound")}</h1>
        <p className="text-gray-500 mb-4">{t("pageCouldNotBeFound")}</p>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setLocation("/")}
        >
          <Home className="mr-2 h-4 w-4" />
          {t("backToHome")}
        </Button>
      </div>
    );
  }

  return (
    <SwipeBack onSwipeBack={() => setLocation("/")}>
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden shadow-md rounded-lg">
          <div className="relative">
            <div className="absolute top-4 left-4 z-10">
              <Button
                variant="outline"
                size="icon"
                className="bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Hero Image */}
            <div className="w-full h-56 sm:h-72 md:h-96 bg-gray-200 overflow-hidden">
              <img
                src={infoPage.imageUrl}
                alt={infoPage.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Content */}
          <div 
            ref={contentRef}
            className="p-4 sm:p-6 max-h-[calc(100vh-300px)] overflow-y-auto"
          >
            <h1 className="text-2xl font-bold mb-2">{infoPage.title}</h1>
            <p className="text-gray-500 mb-6">{infoPage.description}</p>
            
            <div 
              className="prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: infoPage.content }} 
            />
            
            <div className="mt-8 flex justify-center">
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={scrollToTop}
              >
                Back to Top
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </SwipeBack>
  );
}