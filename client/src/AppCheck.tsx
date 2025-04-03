import React, { useEffect, useState } from 'react';
import App from './App';

/**
 * Компонент для проверки и решения проблем отображения приложения
 * Этот компонент перехватывает ошибки, связанные с хуками React,
 * и предлагает перезагрузить страницу или очистить кэш
 */
const AppCheck: React.FC = () => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [triggerReload, setTriggerReload] = useState(false);

  useEffect(() => {
    console.log("AppCheck: Проверка приложения...");
    
    // Установка глобального обработчика ошибок хуков React
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      // Перехватываем ошибки хуков React
      const errorMsg = args.join(' ');
      if (
        errorMsg.includes('Invalid hook call') || 
        errorMsg.includes('Cannot read properties of null') ||
        errorMsg.includes('useState')
      ) {
        console.log('AppCheck: Обнаружена ошибка с хуками React');
        setHasError(true);
        setErrorMessage(errorMsg);
      }
      
      // Все равно выводим оригинальное сообщение ошибки
      originalConsoleError(...args);
    };

    // Восстанавливаем оригинальный обработчик при размонтировании
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // Обработчик перезагрузки страницы
  const handleReload = () => {
    console.log("AppCheck: Перезагрузка страницы...");
    window.location.reload();
  };

  // Обработчик очистки кэша
  const handleClearCache = () => {
    console.log("AppCheck: Переход на страницу очистки кэша...");
    window.location.href = '/force-update/';
  };

  // Если нет ошибок, рендерим основное приложение
  if (!hasError) {
    try {
      return <App />;
    } catch (error) {
      console.log("AppCheck: Поймано исключение при рендеринге App", error);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  }

  // В случае ошибки показываем страницу с инструкциями
  return (
    <div style={{
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      maxWidth: '600px',
      margin: '50px auto',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#0d6efd' }}>Проблема отображения приложения</h1>
      
      <p>Похоже, возникла проблема с отображением приложения. Это может быть связано с кэшем или проблемами в работе React.</p>
      
      {errorMessage && (
        <div style={{
          margin: '20px 0',
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#842029',
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: 'monospace',
          textAlign: 'left',
          overflow: 'auto'
        }}>
          <strong>Ошибка:</strong> {errorMessage}
        </div>
      )}
      
      <p>Пожалуйста, попробуйте следующие действия для решения проблемы:</p>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        margin: '30px 0'
      }}>
        <button 
          onClick={handleReload}
          style={{
            backgroundColor: '#0d6efd',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Перезагрузить страницу
        </button>
        
        <button 
          onClick={handleClearCache}
          style={{
            backgroundColor: '#198754',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Очистить кэш приложения
        </button>
      </div>
      
      <p style={{ fontSize: '14px', color: '#6c757d' }}>
        Если проблема не решается, попробуйте открыть приложение в другом браузере или в режиме инкогнито.
      </p>
    </div>
  );
};

export default AppCheck;