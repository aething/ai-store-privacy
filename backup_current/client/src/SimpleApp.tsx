import React from 'react';

/**
 * Упрощенная версия приложения для изоляции проблемы
 */
function SimpleApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Тест приложения</h1>
      <p>Если вы видите этот текст, рендеринг работает корректно.</p>
    </div>
  );
}

export default SimpleApp;