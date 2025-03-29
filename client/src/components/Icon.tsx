import React from 'react';

type IconProps = {
  name: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
};

/**
 * Компонент для отображения иконок Material Design
 * В случае если иконка не загрузится, отображается текстовая замена
 */
export function Icon({ name, className = '', size = 'medium', onClick }: IconProps) {
  // Определяем класс размера
  const sizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl',
  }[size];
  
  // Объединяем все классы
  const combinedClasses = `material-icons ${sizeClass} ${className}`;
  
  return (
    <span 
      className={combinedClasses}
      onClick={onClick}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none'
      }}
    >
      {name}
    </span>
  );
}

export default Icon;