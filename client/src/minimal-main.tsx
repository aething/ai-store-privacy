// Простой файл инициализации без хуков и сложной логики
import React from 'react';
import { createRoot } from 'react-dom/client';
import MinimalApp from './MinimalApp';

// Простая проверка реакта
console.log('React version:', React.version);

// Простое логирование
console.log('Попытка рендеринга минимального приложения...');

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  
  try {
    root.render(<MinimalApp />);
    console.log('Минимальное приложение успешно отрендерено');
  } catch (error) {
    console.error('Ошибка при рендеринге:', error);
  }
} else {
  console.error('Элемент с id="root" не найден');
}