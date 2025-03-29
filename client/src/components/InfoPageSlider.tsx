import { useLocation } from "wouter";
import { InfoPage } from "@/types";
import InfoPageCard from "./InfoPageCard";
import { useLocale } from "@/context/LocaleContext";

interface InfoPageSliderProps {
  title: string;
  infoPages: InfoPage[];
}

export default function InfoPageSlider({ title, infoPages }: InfoPageSliderProps) {
  const [, setLocation] = useLocation();
  const { t } = useLocale();
  
  if (!infoPages || infoPages.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 relative">
      <h2 className="text-lg font-medium mb-4">{title}</h2>
      <div 
        id="info-pages-scroll"
        className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
      >
        {infoPages.map((infoPage) => (
          <InfoPageCard 
            key={infoPage.id} 
            infoPage={infoPage} 
          />
        ))}
      </div>
      
      {infoPages.length > 2 && (
        <>
          <button
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-full shadow-md p-1 z-10"
            onClick={() => {
              const scrollElem = document.getElementById('info-pages-scroll');
              if (scrollElem) {
                scrollElem.scrollBy({ left: -280, behavior: 'smooth' });
              }
            }}
          >
            <span className="material-icons">chevron_left</span>
          </button>
          <button
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white rounded-full shadow-md p-1 z-10"
            onClick={() => {
              const scrollElem = document.getElementById('info-pages-scroll');
              if (scrollElem) {
                scrollElem.scrollBy({ left: 280, behavior: 'smooth' });
              }
            }}
          >
            <span className="material-icons">chevron_right</span>
          </button>
        </>
      )}
    </div>
  );
}