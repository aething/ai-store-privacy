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
  // Обработчик изменения значения
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('CountrySelect - country changed to:', e.target.value); 
    // Передаем новое значение в родительский компонент
    onChange(e.target.value);
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
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          id={id}
          name={name}
          value={getSelectedValue()}
          onChange={handleChange}
          className={`block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-700`}
        >
          <option value="">Select a country</option>
          {countries.map(country => (
            <option key={country.code} value={country.code}>
              {country.name} ({country.code})
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
      
      {/* Сообщение об ошибке */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      
      {/* Информационное сообщение убрано как запросил пользователь */}
    </div>
  );
};

export default CountrySelect;