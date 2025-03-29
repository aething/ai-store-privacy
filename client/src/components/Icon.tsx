import React from 'react';

type IconProps = {
  name: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
};

/**
 * SVG-иконки для основных действий
 * Вместо зависимости от внешних шрифтов используем встроенные SVG-иконки
 */
export function Icon({ name, className = '', size = 'medium', onClick }: IconProps) {
  // Определяем размеры на основе выбранного размера
  const sizeValue = {
    small: 16,
    medium: 24,
    large: 32,
  }[size];
  
  // Базовые стили для всех иконок
  const baseStyle = {
    display: 'inline-block',
    verticalAlign: 'middle',
    cursor: onClick ? 'pointer' : 'default',
    userSelect: 'none' as 'none',
  };
  
  // Объект с SVG-путями для каждой иконки
  const iconPaths: Record<string, React.ReactNode> = {
    // Навигационные иконки
    arrow_back: (
      <svg xmlns="http://www.w3.org/2000/svg" width={sizeValue} height={sizeValue} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={baseStyle} onClick={onClick}>
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    ),
    arrow_forward: (
      <svg xmlns="http://www.w3.org/2000/svg" width={sizeValue} height={sizeValue} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={baseStyle} onClick={onClick}>
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    ),
    close: (
      <svg xmlns="http://www.w3.org/2000/svg" width={sizeValue} height={sizeValue} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={baseStyle} onClick={onClick}>
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    ),
    // Действия
    edit: (
      <svg xmlns="http://www.w3.org/2000/svg" width={sizeValue} height={sizeValue} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={baseStyle} onClick={onClick}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    delete: (
      <svg xmlns="http://www.w3.org/2000/svg" width={sizeValue} height={sizeValue} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={baseStyle} onClick={onClick}>
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
    ),
    check: (
      <svg xmlns="http://www.w3.org/2000/svg" width={sizeValue} height={sizeValue} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={baseStyle} onClick={onClick}>
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    ),
    // Уведомления и статусы
    warning: (
      <svg xmlns="http://www.w3.org/2000/svg" width={sizeValue} height={sizeValue} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={baseStyle} onClick={onClick}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" width={sizeValue} height={sizeValue} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={baseStyle} onClick={onClick}>
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4M12 8h.01"/>
      </svg>
    ),
    // Пользовательский интерфейс
    menu: (
      <svg xmlns="http://www.w3.org/2000/svg" width={sizeValue} height={sizeValue} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={baseStyle} onClick={onClick}>
        <path d="M3 12h18M3 6h18M3 18h18"/>
      </svg>
    ),
    share: (
      <svg xmlns="http://www.w3.org/2000/svg" width={sizeValue} height={sizeValue} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={baseStyle} onClick={onClick}>
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
    user: (
      <svg xmlns="http://www.w3.org/2000/svg" width={sizeValue} height={sizeValue} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={baseStyle} onClick={onClick}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    search: (
      <svg xmlns="http://www.w3.org/2000/svg" width={sizeValue} height={sizeValue} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={baseStyle} onClick={onClick}>
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    shopping_cart: (
      <svg xmlns="http://www.w3.org/2000/svg" width={sizeValue} height={sizeValue} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={baseStyle} onClick={onClick}>
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
  };
  
  // Возвращаем иконку или текстовую замену
  return iconPaths[name] || (
    <span 
      className={className}
      onClick={onClick}
      style={{ 
        ...baseStyle,
        fontSize: sizeValue,
      }}
    >
      {name}
    </span>
  );
}

export default Icon;