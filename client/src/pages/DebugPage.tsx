import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { useEffect, useState } from "react";
import { updateUserCountry } from "@/utils/clearCache";
import DebugCountrySelect from "@/components/DebugCountrySelect";

const DEBUG_MODE = true;

/**
 * Страница для отладки функций приложения
 * Позволяет тестировать различные возможности без необходимости 
 * перезапуска сервера или выполнения скриптов
 */
export function DebugPage() {
  const { user } = useAppContext();
  const { toast } = useToast();
  const [currentCountry, setCurrentCountry] = useState<string | null>(null);
  const [isEUR, setIsEUR] = useState<boolean>(false);
  
  useEffect(() => {
    if (user?.country) {
      setCurrentCountry(user.country);
      
      // Проверяем, должна ли использоваться валюта EUR
      const eurCountries = [
        'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
        'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
        'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
      ];
      setIsEUR(eurCountries.includes(user.country));
    }
  }, [user]);
  
  const handleSetCountry = async (country: string) => {
    if (!country || country.length !== 2) {
      toast({
        title: "Ошибка",
        description: "Выберите корректный код страны",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Страна обновляется",
      description: `Изменение страны на ${country}. Страница перезагрузится автоматически.`,
    });
    
    // Используем утилиту для обновления страны пользователя
    try {
      await updateUserCountry(country);
    } catch (error) {
      console.error("Ошибка при обновлении страны:", error);
      
      // В случае ошибки делаем простое обновление через localStorage
      if (user) {
        const userData = { ...user, country };
        localStorage.setItem('user', JSON.stringify(userData));
        setTimeout(() => window.location.reload(), 300);
      }
    }
  };
  
  const handleClearCache = () => {
    // Используем обновление страны с текущим значением, что просто очистит кэш
    if (user?.country) {
      updateUserCountry(user.country);
    } else {
      // Если страна не задана, просто перезагружаем страницу
      toast({
        title: "Перезагрузка",
        description: "Страница будет перезагружена",
      });
      setTimeout(() => window.location.reload(), 300);
    }
  };
  
  if (!DEBUG_MODE) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Режим отладки отключен</CardTitle>
            <CardDescription>Доступ к этой странице ограничен</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Отладочный режим отключен в текущей сборке приложения.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Отладка приложения</CardTitle>
          <CardDescription>Инструменты для тестирования и отладки</CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4">
              <div>
                <p className="mb-2 font-semibold">Текущий пользователь:</p>
                <div className="bg-muted p-2 rounded text-sm">
                  <div><strong>ID:</strong> {user.id}</div>
                  <div><strong>Имя:</strong> {user.username}</div>
                  <div><strong>Email:</strong> {user.email}</div>
                  <div>
                    <strong>Страна:</strong> {user.country || "Не указана"} 
                    {isEUR && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">EUR</span>}
                    {!isEUR && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">USD</span>}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="font-semibold">Изменить страну:</p>
                <DebugCountrySelect 
                  selectedCountry={currentCountry || undefined} 
                  onCountryChange={handleSetCountry}
                />
                <div className="text-sm text-muted-foreground mt-1">
                  Изменение страны повлияет на отображаемую валюту. 
                  <br />Страны ЕС используют EUR, остальные - USD.
                </div>
              </div>
              
              <div className="pt-4">
                <p className="font-semibold mb-2">Другие действия:</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleClearCache}>
                    Очистить кэш приложения
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p>Пожалуйста, авторизуйтесь для доступа к инструментам отладки.</p>
              <Button className="mt-4" onClick={() => window.location.href = "/"}>
                Вернуться на главную
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DebugPage;