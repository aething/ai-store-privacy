import React, { useEffect, useState, ErrorInfo } from 'react';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * Расширенный компонент для проверки и решения проблем отображения приложения
 * Этот компонент перехватывает ошибки, связанные с хуками React,
 * и предлагает перезагрузить страницу или очистить кэш
 */
const AppCheck: React.FC = () => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [componentWithError, setComponentWithError] = useState<string | null>(null);

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
        errorMsg.includes('useState') ||
        errorMsg.includes('useEffect') ||
        errorMsg.includes('useContext')
      ) {
        console.log('AppCheck: Обнаружена ошибка с хуками React');
        
        // Пытаемся извлечь имя компонента из стека ошибки
        const componentMatch = errorMsg.match(/in ([A-Z][a-zA-Z0-9]*)/);
        if (componentMatch && componentMatch[1]) {
          setComponentWithError(componentMatch[1]);
        }
        
        setHasError(true);
        setErrorMessage(errorMsg);
      }
      
      // Все равно выводим оригинальное сообщение ошибки
      originalConsoleError(...args);
    };

    // Кастомный обработчик глобальных ошибок
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.error && 
          (event.error.message.includes('hooks') || 
           event.error.message.includes('useState') ||
           event.error.message.includes('useEffect') ||
           event.error.message.includes('Cannot read properties of null'))) {
        console.log('AppCheck: Перехвачена глобальная ошибка хуков React');
        setHasError(true);
        setErrorMessage(event.error.message);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleGlobalError);

    // Восстанавливаем оригинальные обработчики при размонтировании
    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  // Обработчик ошибок из ErrorBoundary
  const handleBoundaryError = (error: Error, errorInfo: ErrorInfo) => {
    console.log('AppCheck: ErrorBoundary перехватил ошибку');
    setHasError(true);
    setErrorMessage(error.message);
    
    // Пытаемся извлечь имя компонента из стека ошибки
    const componentStack = errorInfo.componentStack || '';
    const match = componentStack.match(/in ([A-Z][a-zA-Z0-9]*)/);
    if (match && match[1]) {
      setComponentWithError(match[1]);
    }
  };

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

  // Если есть ошибка, показываем страницу с инструкциями
  if (hasError) {
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
        
        <p>Обнаружена проблема с React-хуками в приложении. Это может быть связано с кэшем или проблемами в загрузке компонентов.</p>
        
        {componentWithError && (
          <div style={{
            margin: '20px 0',
            padding: '10px',
            backgroundColor: '#cfe2ff',
            color: '#084298',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            Проблемный компонент: {componentWithError}
          </div>
        )}
        
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
  }

  // Оборачиваем App в ErrorBoundary для перехвата ошибок
  return (
    <ErrorBoundary 
      componentName="App" 
      onError={handleBoundaryError}
    >
      <App />
    </ErrorBoundary>
  );
};

export default AppCheck;