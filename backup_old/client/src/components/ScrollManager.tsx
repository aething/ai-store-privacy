import React, { useEffect, useState } from 'react';
import { saveCurrentScrollPosition, restoreCurrentScrollPosition } from '@/lib/scrollUtils';

/**
 * Компонент для управления скроллом и отображения текущей позиции
 * Полезен для тестирования системы скролла в UI
 */
export default function ScrollManager() {
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [savedPositions, setSavedPositions] = useState<Record<string, string>>({});
  const [showDebug, setShowDebug] = useState<boolean>(false);

  // Обновляем текущую позицию скролла
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY || document.documentElement.scrollTop;
      setScrollPosition(position);
    };

    // Загружаем сохраненные позиции из sessionStorage
    const loadSavedPositions = () => {
      const positions: Record<string, string> = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('scroll-position-')) {
          const path = key.replace('scroll-position-', '');
          const value = sessionStorage.getItem(key) || '';
          positions[path] = value;
        }
      }
      setSavedPositions(positions);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Начальное значение
    
    // Периодически проверяем сохраненные позиции
    const intervalId = setInterval(loadSavedPositions, 2000);
    loadSavedPositions(); // Начальная загрузка

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(intervalId);
    };
  }, []);

  // Функция для сохранения текущей позиции
  const handleSavePosition = () => {
    saveCurrentScrollPosition();
    // Обновляем список сохраненных позиций
    setTimeout(() => {
      const positions: Record<string, string> = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('scroll-position-')) {
          const path = key.replace('scroll-position-', '');
          const value = sessionStorage.getItem(key) || '';
          positions[path] = value;
        }
      }
      setSavedPositions(positions);
    }, 100);
  };

  // Функция для восстановления текущей позиции
  const handleRestorePosition = () => {
    restoreCurrentScrollPosition();
  };

  // Функция для очистки всех сохраненных позиций
  const handleClearPositions = () => {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('scroll-position-')) {
        sessionStorage.removeItem(key);
      }
    });
    setSavedPositions({});
  };

  // Если отладка не включена, показываем только компактный виджет
  if (!showDebug) {
    return (
      <div 
        className="fixed bottom-4 right-4 bg-black/70 text-white p-2 rounded-lg text-xs shadow-lg"
        onClick={() => setShowDebug(true)}
      >
        Scroll: {scrollPosition}px
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border shadow-xl rounded-lg p-3 max-w-xs z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-sm">Scroll Manager</h3>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setShowDebug(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="mb-2 text-xs">
        <div>Current Position: <span className="font-mono">{scrollPosition}px</span></div>
        <div>Current Path: <span className="font-mono">{window.location.pathname}</span></div>
      </div>
      
      <div className="flex space-x-1 mb-3">
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white text-xs rounded px-2 py-1"
          onClick={handleSavePosition}
        >
          Save Position
        </button>
        <button 
          className="bg-green-500 hover:bg-green-600 text-white text-xs rounded px-2 py-1"
          onClick={handleRestorePosition}
        >
          Restore Position
        </button>
        <button 
          className="bg-red-500 hover:bg-red-600 text-white text-xs rounded px-2 py-1"
          onClick={handleClearPositions}
        >
          Clear All
        </button>
      </div>
      
      <div className="max-h-32 overflow-y-auto text-xs">
        <div className="font-medium mb-1">Saved Positions:</div>
        {Object.keys(savedPositions).length === 0 ? (
          <div className="text-gray-500 italic">No saved positions</div>
        ) : (
          <div className="space-y-1">
            {Object.entries(savedPositions).map(([path, position]) => (
              <div key={path} className="flex justify-between">
                <span className="truncate">{path}:</span>
                <span className="font-mono">{position}px</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}