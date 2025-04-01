import React from 'react';
import { countries, Country } from '@/data/countries';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
  className?: string;
  required?: boolean;
  label?: string;
  error?: string;
}

/**
 * Компонент выпадающего списка для выбора страны
 */
const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  id = 'country',
  name = 'country',
  className = '',
  required = false,
  label = 'Country',
  error
}) => {
  // Обработчик изменения значения - в текущей версии изменять страну не разрешено
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Просто для сохранения старого поведения оставляем логирование
    console.log('CountrySelect - selection disabled'); 
    // Не передаем новое значение, поэтому страна не меняется
  };

  // Находим страну по коду или имени
  const getSelectedValue = () => {
    if (!value) return '';
    
    console.log('CountrySelect - current value:', value);
    
    // Сначала пробуем найти по коду (предполагаем, что значение - это код)
    const foundByCode = countries.find(c => c.code.toLowerCase() === value.toLowerCase());
    if (foundByCode) {
      console.log('CountrySelect - found by code:', foundByCode.code);
      return foundByCode.code;
    }
    
    // Если не нашли по коду, пробуем найти по имени
    const foundByName = countries.find(c => c.name.toLowerCase() === value.toLowerCase());
    if (foundByName) {
      console.log('CountrySelect - found by name:', foundByName.code);
      return foundByName.code;
    }
    
    // Если не нашли, но значение не пустое, выводим предупреждение и возвращаем исходное значение
    if (value) {
      console.warn('CountrySelect - country not found in list:', value);
      return value;
    }
    
    // Если значение пустое, возвращаем пустую строку
    return '';
  };

  // Получаем имя страны для отображения
  const getCountryName = () => {
    if (!value) return 'Select a country';
    
    const foundByCode = countries.find(c => c.code.toLowerCase() === value.toLowerCase());
    if (foundByCode) return `${foundByCode.name} (${foundByCode.code})`;
    
    const foundByName = countries.find(c => c.name.toLowerCase() === value.toLowerCase());
    if (foundByName) return `${foundByName.name} (${foundByName.code})`;
    
    return value;
  };

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-sm font-medium text-gray-700 mb-1 ${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`}
        >
          {label}
          <span className="ml-2 text-xs text-gray-500">(Readonly)</span>
        </label>
      )}
      
      <div className="relative">
        <div 
          className={`block w-full px-3 py-2 bg-gray-100 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-gray-700`}
        >
          {getCountryName()}
        </div>
        
        {/* Скрытое поле для хранения текущего значения */}
        <input type="hidden" id={id} name={name} value={getSelectedValue()} />
      </div>
      
      {/* Сообщение об ошибке */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      
      {/* Информационное сообщение */}
      <p className="mt-1 text-xs text-gray-500">
        Страна пользователя устанавливается при регистрации и не может быть изменена для обеспечения корректности ценообразования. Для использования другой валюты, пожалуйста, создайте новый аккаунт.
      </p>
    </div>
  );
};

export default CountrySelect;