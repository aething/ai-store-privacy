import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { InfoPage } from "@/types";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";

interface InfoPageCardProps {
  infoPage: InfoPage;
}

export default function InfoPageCard({ infoPage }: InfoPageCardProps) {
  const [, setLocation] = useLocation();
  const { t } = useLocale();

  return (
    <Card 
      className="flex-none w-64 h-[280px] rounded-lg overflow-hidden bg-white cursor-pointer shadow-md hover:shadow-lg transition-shadow"
      onClick={() => setLocation(`/info/${infoPage.id}`)}
    >
      <div className="flex flex-col h-full">
        {/* Содержание */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-medium text-lg mb-2">{infoPage.title}</h3>
          
          <p className="text-gray-500 text-sm flex-grow line-clamp-6 mb-4">
            {infoPage.description}
          </p>
          
          <Button 
            className="w-full bg-transparent hover:bg-gray-100 text-black border-2 border-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              setLocation(`/info/${infoPage.id}`);
            }}
          >
            {t("readMore") || "Read More"}
          </Button>
        </div>
      </div>
    </Card>
  );
}