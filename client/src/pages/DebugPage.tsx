import { useState } from 'react';
import { useSessionDebug } from '@/hooks/useSessionDebug';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clearUserCache, clearAllCache, reloadPage } from '@/utils/clearCache';
import { useLocation } from 'wouter';
import { useAppContext } from '@/context/AppContext';
import DebugCountrySelect from '@/components/DebugCountrySelect';

export default function DebugPage() {
  const [, setLocation] = useLocation();
  const { sessionInfo, updateUserOnServer, refreshSession } = useSessionDebug();
  const { user } = useAppContext();
  const [newCountry, setNewCountry] = useState('US');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Функция для обновления страны
  const handleUpdateCountry = async () => {
    if (!sessionInfo.apiUser || !sessionInfo.apiUser.id) {
      setResult({ 
        message: 'Пользователь не авторизован. Выполните вход, чтобы продолжить.',
        type: 'error'
      });
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      const updateResult = await updateUserOnServer(sessionInfo.apiUser.id, newCountry);
      
      if (updateResult.success) {
        setResult({
          message: `Страна успешно обновлена на ${newCountry}. Через 2 секунды страница будет перезагружена для применения изменений.`,
          type: 'success'
        });
        
        // Перезагрузка страницы с задержкой для применения изменений
        setTimeout(() => {
          reloadPage();
        }, 2000);
      } else {
        setResult({
          message: `Ошибка при обновлении страны: ${updateResult.error}`,
          type: 'error'
        });
      }
    } catch (error) {
      setResult({
        message: `Произошла ошибка: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Функция для обновления данных сессии
  const handleRefreshSession = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      await refreshSession();
      setResult({
        message: 'Данные сессии обновлены',
        type: 'success'
      });
    } catch (error) {
      setResult({
        message: `Ошибка при обновлении данных сессии: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Функция для форматированного отображения информации о пользователе
  const formatUserInfo = (userObj: any) => {
    if (!userObj) return 'Нет данных';
    
    return JSON.stringify({
      id: userObj.id,
      username: userObj.username,
      country: userObj.country,
      // Другие важные поля
    }, null, 2);
  };
  
  // Функция для очистки кэша с сохранением страны
  const handleClearCachePreserveCountry = () => {
    clearUserCache(true);
    setResult({
      message: 'Кэш очищен с сохранением страны пользователя',
      type: 'info'
    });
  };
  
  // Функция для полной очистки кэша
  const handleClearAllCache = () => {
    clearAllCache();
    setResult({
      message: 'Весь кэш очищен',
      type: 'info'
    });
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Отладка сессии и страны пользователя</h1>
      
      {/* Информация о текущем пользователе */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Текущее состояние сессии</h2>
        
        <div className="flex items-center gap-2 mb-4">
          <div className={`h-3 w-3 rounded-full ${
            sessionInfo.status === 'loading' ? 'bg-yellow-500' :
            sessionInfo.status === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="font-medium">
            {sessionInfo.status === 'loading' ? 'Загрузка...' :
             sessionInfo.status === 'success' ? 'Сессия активна' : 'Проблема с сессией'}
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Данные из API:</h3>
            <pre className="text-sm bg-gray-100 p-3 rounded max-h-40 overflow-auto">
              {sessionInfo.status === 'loading' ? 'Загрузка...' : formatUserInfo(sessionInfo.apiUser)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Данные из localStorage:</h3>
            <pre className="text-sm bg-gray-100 p-3 rounded max-h-40 overflow-auto">
              {formatUserInfo(sessionInfo.localStorageUser)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Данные из контекста React:</h3>
            <pre className="text-sm bg-gray-100 p-3 rounded max-h-40 overflow-auto">
              {formatUserInfo(sessionInfo.contextUser)}
            </pre>
          </div>
        </div>
        
        <Button 
          onClick={handleRefreshSession} 
          className="mt-4"
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Обновить данные
        </Button>
      </Card>
      
      {/* Инструменты отладки */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Изменение страны пользователя</h2>
        
        {!sessionInfo.apiUser && (
          <div className="bg-yellow-50 p-4 rounded-lg mb-4 flex items-start">
            <AlertCircle className="text-yellow-500 mr-2 mt-0.5" size={18} />
            <p className="text-yellow-700">
              Пользователь не авторизован. Для изменения страны необходимо 
              <Button 
                variant="link" 
                className="p-0 h-auto text-blue-600" 
                onClick={() => setLocation('/login')}
              >
                выполнить вход
              </Button>.
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="country">Новая страна:</Label>
            <div className="mt-1 mb-3">
              <DebugCountrySelect
                id="debug-country"
                value={newCountry}
                onChange={setNewCountry}
                label="Выберите страну для тестирования"
              />
            </div>
            <Button 
              onClick={handleUpdateCountry} 
              disabled={loading || !sessionInfo.apiUser}
              className="mt-2"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Обновить страну
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Инструменты для работы с кэшем */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Управление кэшем</h2>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Эти инструменты позволяют управлять кэшем приложения для отладки проблем с отображением валюты и данными пользователя.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleClearCachePreserveCountry}>
              Очистить кэш с сохранением страны
            </Button>
            
            <Button variant="outline" onClick={handleClearAllCache}>
              Полная очистка кэша
            </Button>
            
            <Button variant="outline" onClick={reloadPage}>
              Перезагрузить страницу
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Результаты операций */}
      {result && (
        <div className={`p-4 rounded-lg mb-6 flex items-start ${
          result.type === 'success' ? 'bg-green-50' : 
          result.type === 'error' ? 'bg-red-50' : 'bg-blue-50'
        }`}>
          {result.type === 'success' ? (
            <CheckCircle2 className="text-green-500 mr-2 mt-0.5" size={18} />
          ) : result.type === 'error' ? (
            <AlertCircle className="text-red-500 mr-2 mt-0.5" size={18} />
          ) : (
            <RefreshCw className="text-blue-500 mr-2 mt-0.5" size={18} />
          )}
          <p className={`${
            result.type === 'success' ? 'text-green-700' : 
            result.type === 'error' ? 'text-red-700' : 'text-blue-700'
          }`}>
            {result.message}
          </p>
        </div>
      )}
      
      {/* Ссылка на возврат */}
      <Button 
        variant="link" 
        className="p-0" 
        onClick={() => setLocation('/')}
      >
        Вернуться на главную
      </Button>
    </div>
  );
}