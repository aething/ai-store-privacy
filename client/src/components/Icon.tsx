import React from 'react';

type IconProps = {
  name: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
};

/**
 * Компонент иконки Material Icons
 * @param name - название иконки из библиотеки Material Icons
 * @param className - дополнительные CSS классы
 * @param size - размер иконки: 'small' (18px), 'medium' (24px), 'large' (36px)
 * @param onClick - обработчик клика
 */
export function Icon({ name, className = '', size = 'medium', onClick }: IconProps) {
  // Определение класса размера
  const sizeClass = {
    small: 'text-lg', // ~18px
    medium: 'text-2xl', // ~24px
    large: 'text-3xl', // ~36px
  }[size];
  
  // Базовый класс для всех иконок
  const baseClass = 'material-icons';
  
  // Объединение всех классов
  const combinedClasses = `${baseClass} ${sizeClass} ${className} ${onClick ? 'cursor-pointer' : ''}`;
  
  return (
    <span 
      className={combinedClasses}
      onClick={onClick}
    >
      {name}
    </span>
  );
}

export default Icon;