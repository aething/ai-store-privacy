import React from 'react';
import { createRoot } from "react-dom/client";
import SimpleApp from "./SimpleApp";
import "./index.css";

// Логи для отладки
console.log('Запуск простого приложения...');

// Создаем корневой элемент
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Корневой элемент #root не найден!');
} else {
  console.log('Корневой элемент найден, пробуем рендер...');
  
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <SimpleApp />
      </React.StrictMode>
    );
    console.log('Рендеринг успешно выполнен!');
  } catch (error) {
    console.error('Ошибка при рендеринге:', error);
  }
}

// Логи состояния DOM после рендеринга
setTimeout(() => {
  const rootContent = document.getElementById('root')?.innerHTML;
  console.log('Содержимое #root через 500мс:', rootContent?.substring(0, 100) + '...');
}, 500);