import React, { useState, useRef, useEffect } from 'react';

interface RippleEffectProps {
  children: React.ReactNode;
  color?: string;
  duration?: number;
  disabled?: boolean;
  className?: string;
}

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

/**
 * Компонент для добавления эффекта пульсации (Ripple) при клике
 * Следует Material Design принципам
 */
const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  color = 'rgba(255, 255, 255, 0.4)', // Цвет эффекта
  duration = 600, // Длительность анимации в мс
  disabled = false, // Отключение эффекта
  className = '',
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  
  // Очистка эффекта при размонтировании
  useEffect(() => {
    return () => {
      setRipples([]);
    };
  }, []);
  
  // Удаляем ripple после окончания анимации
  useEffect(() => {
    const timeoutIds: NodeJS.Timeout[] = [];
    
    ripples.forEach(ripple => {
      const timeoutId = setTimeout(() => {
        setRipples(prevRipples => prevRipples.filter(r => r.id !== ripple.id));
      }, duration);
      
      timeoutIds.push(timeoutId);
    });
    
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [ripples, duration]);
  
  // Обработчик клика для создания эффекта
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    
    // Определяем позицию клика относительно контейнера
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Определяем размер ripple на основе размеров контейнера
    // Берем максимальный размер, чтобы покрыть весь контейнер
    const size = Math.max(rect.width, rect.height) * 2;
    
    // Создаем новый ripple
    const newRipple: Ripple = {
      x,
      y,
      size,
      id: nextId.current,
    };
    
    nextId.current += 1;
    
    // Добавляем ripple
    setRipples(prevRipples => [...prevRipples, newRipple]);
  };
  
  // Если ребенок - кнопка или элемент с onClick, оборачиваем его div'ом
  // чтобы избежать конфликтов с обработчиками событий
  const isInteractive =
    React.isValidElement(children) &&
    (children.type === 'button' || 
     children.type === 'a' || 
     (typeof children.type === 'string' && children.props.onClick));
  
  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
      
      {/* Контейнер для ripple эффектов */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            style={{
              position: 'absolute',
              top: ripple.y - ripple.size / 2,
              left: ripple.x - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
              borderRadius: '50%',
              backgroundColor: color,
              transform: 'scale(0)',
              opacity: '0.5',
              animation: `ripple-animation ${duration}ms ease-out forwards`,
            }}
          />
        ))}
      </div>
      
      {/* Стили для анимации */}
      <style jsx>{`
        @keyframes ripple-animation {
          0% {
            transform: scale(0);
            opacity: 0.5;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default RippleEffect;