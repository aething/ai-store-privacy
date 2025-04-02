import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

/**
 * Хук для отладки проблем с сессией
 * Собирает информацию о текущем состоянии сессии, localStorage и контексте приложения
 */
export function useSessionDebug() {
  const { user, setUser } = useAppContext();
  const [sessionInfo, setSessionInfo] = useState<{
    apiUser: any | null;
    localStorageUser: any | null;
    contextUser: any | null;
    status: 'loading' | 'error' | 'success';
    message: string;
  }>({
    apiUser: null,
    localStorageUser: null,
    contextUser: user,
    status: 'loading',
    message: 'Загрузка данных сессии...'
  });

  // Функция для обновления данных пользователя на сервере
  const updateUserOnServer = async (userId: number, country: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: '',
          phone: '',
          country: country,
          street: '',
          house: '',
          apartment: ''
        })
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка обновления пользователя: ${response.status}`);
      }
      
      const updatedUser = await response.json();
      
      // Обновляем пользователя в localStorage и контексте
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return {
        success: true,
        user: updatedUser
      };
    } catch (error) {
      console.error('Ошибка при обновлении пользователя:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  };

  // Функция для проверки состояния сессии
  const checkSession = async () => {
    try {
      // Получаем данные из localStorage
      let localStorageUser = null;
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          localStorageUser = JSON.parse(userData);
        }
      } catch (e) {
        console.error('Ошибка при парсинге localStorage.user:', e);
      }
      
      // Делаем запрос к API
      const response = await fetch('/api/users/me');
      
      if (!response.ok) {
        // Если пользователь не авторизован
        if (response.status === 401) {
          setSessionInfo({
            apiUser: null,
            localStorageUser,
            contextUser: user,
            status: 'error',
            message: 'Сессия истекла или пользователь не авторизован'
          });
          return;
        }
        
        throw new Error(`Ошибка получения данных пользователя: ${response.status}`);
      }
      
      const apiUser = await response.json();
      
      // Обновляем состояние
      setSessionInfo({
        apiUser,
        localStorageUser,
        contextUser: user,
        status: 'success',
        message: 'Сессия активна'
      });
      
      // Проверяем синхронизацию данных
      if (localStorageUser && apiUser.id === localStorageUser.id) {
        // Проверяем, отличается ли страна в localStorage от API
        if (localStorageUser.country !== apiUser.country) {
          console.log('Обнаружено несоответствие страны между localStorage и API, синхронизируем...');
          
          // Обновляем пользователя в localStorage
          localStorage.setItem('user', JSON.stringify(apiUser));
          
          // Также обновляем в контексте, если требуется
          if (!user || user.country !== apiUser.country) {
            setUser(apiUser);
          }
        }
      }
    } catch (error) {
      setSessionInfo({
        apiUser: null,
        localStorageUser: null,
        contextUser: user,
        status: 'error',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  };

  // Проверяем сессию при монтировании
  useEffect(() => {
    checkSession();
  }, []);

  // Возвращаем данные и функции для отладки
  return {
    sessionInfo,
    updateUserOnServer,
    refreshSession: checkSession
  };
}