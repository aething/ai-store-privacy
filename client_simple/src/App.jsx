import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Простое React-приложение</h1>
      <p>Это базовое приложение без сложных зависимостей</p>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '0.5rem' 
      }}>
        <h2>Счетчик: {count}</h2>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Увеличить
        </button>
      </div>
    </div>
  );
}

export default App;