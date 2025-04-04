import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { InfoPage } from "@/types";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";
import { InfoPageTranslations } from "@/locales/infopages";

// Расширяем тип локализованных страниц с добавлением id
type ExtendedInfoPageTranslations = InfoPageTranslations & {
  id: string | number;
};

// Расширяем тип для поддержки как системных, так и локализованных страниц
interface InfoPageCardProps {
  infoPage: InfoPage | ExtendedInfoPageTranslations | { 
    id: string | number;
    title: string;
    description?: string;
    content?: string;
  };
}

export default function InfoPageCard({ infoPage }: InfoPageCardProps) {
  const [, setLocation] = useLocation();
  const { t } = useLocale();

  // Проверяем, что infoPage существует
  if (!infoPage) {
    console.error('InfoPage is undefined or null');
    return null;
  }

  // Безопасно получаем id - предотвращаем ошибки доступа к свойствам
  const id = infoPage && typeof infoPage === 'object' && 'id' in infoPage ? infoPage.id : null;
  if (id === null || id === undefined) {
    console.error('InfoPage without valid id:', infoPage);
    return null;
  }
  
  const pageId = id.toString();
  
  // Безопасно получаем title
  const title = infoPage && typeof infoPage === 'object' && 'title' in infoPage ? infoPage.title : null;
  if (!title) {
    console.error('InfoPage without title:', infoPage);
    return null;
  }
  
  // Безопасно получаем description (опционально)
  const description = infoPage && typeof infoPage === 'object' && 'description' in infoPage ? infoPage.description || '' : '';

  return (
    <Card 
      className="flex-none w-64 h-[280px] rounded-lg overflow-hidden bg-white cursor-pointer shadow-md hover:shadow-lg transition-shadow"
      onClick={() => setLocation(`/info/${pageId}`)}
    >
      <div className="flex flex-col h-full">
        {/* Содержание */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-medium text-lg mb-2">{title}</h3>
          
          <p className="text-gray-500 text-sm flex-grow line-clamp-6 mb-4">
            {description}
          </p>
          
          <Button 
            className="w-full bg-transparent hover:bg-gray-100 text-black border-2 border-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              setLocation(`/info/${pageId}`);
            }}
          >
            {t("readMore") || "Read More"}
          </Button>
        </div>
      </div>
    </Card>
  );
}