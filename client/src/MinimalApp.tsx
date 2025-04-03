import React from 'react';

/**
 * Минимальное тестовое приложение React без сложных хуков
 * используется для диагностики проблем с React
 */
const MinimalApp: React.FC = () => {
  console.log("Рендер MinimalApp компонента");
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      margin: '20px 0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#0366d6' }}>
        Минимальное React-приложение
      </h2>
      <p>
        Этот компонент успешно отрендерился! Если вы видите этот текст,
        значит базовый механизм React работает правильно.
      </p>
      <div style={{
        backgroundColor: '#e6f6e6',
        padding: '10px',
        borderRadius: '4px',
        marginTop: '10px'
      }}>
        <p style={{ margin: '0', fontWeight: 'bold' }}>
          Статус: ✅ Успешно
        </p>
      </div>
    </div>
  );
};

export default MinimalApp;