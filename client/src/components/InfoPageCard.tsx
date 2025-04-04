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

  if (!infoPage) {
    console.error('InfoPage is undefined or null');
    return null;
  }

  // Получаем ID страницы в строковом или числовом формате
  const pageId = 'id' in infoPage && infoPage.id ? infoPage.id.toString() : '';

  // Проверяем наличие обязательных полей
  if (!pageId) {
    console.error('InfoPage without valid id:', infoPage);
    return null;
  }

  // Получаем заголовок
  let title = '';
  if ('title' in infoPage && infoPage.title) {
    title = infoPage.title;
  } else {
    console.error('InfoPage without title:', infoPage);
    return null;
  }

  // Получаем описание (может быть опциональным)
  let description = '';
  if ('description' in infoPage && infoPage.description) {
    description = infoPage.description;
  }

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