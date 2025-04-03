import React from 'react';
import { AppProvider } from '@/context/AppContext';
import { LocaleProvider } from '@/context/LocaleContext';
import ErrorBoundary from './ErrorBoundary';

interface ContextProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * Компонент-обёртка для контекст-провайдеров приложения
 * Позволяет изолировать ошибки хуков в отдельных контекстах
 */
const ContextProviderWrapper: React.FC<ContextProviderWrapperProps> = ({ children }) => {
  return (
    <ErrorBoundary componentName="AppProvider">
      <AppProvider>
        <ErrorBoundary componentName="LocaleProvider">
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </ErrorBoundary>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default ContextProviderWrapper;