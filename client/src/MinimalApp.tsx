import React from 'react';

/**
 * Минимальное приложение без хуков и дополнительной логики
 * для тестирования правильности рендеринга React
 */
function MinimalApp() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Минимальное приложение</h1>
      <p>Это тестовое приложение без хуков React.</p>
    </div>
  );
}

export default MinimalApp;