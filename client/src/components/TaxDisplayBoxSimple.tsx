import React from 'react';

interface TaxInfo {
  amount: number;
  rate: number;
  label: string;
  display?: string;
}

interface TaxDisplayBoxProps {
  tax: TaxInfo | null;
  subtotal: number;
  currency: string;
  className?: string;
  showDetails?: boolean;
}

/**
 * Упрощенный компонент для отображения информации о налоге
 * Разработан для использования вне зависимости от других компонентов и контекста
 * В версии 2.0 полностью переработан для обеспечения надежного отображения
 */
const TaxDisplayBoxSimple: React.FC<TaxDisplayBoxProps> = ({
  tax,
  subtotal,
  currency,
  className = '',
  showDetails = true
}) => {
  // Базовые константы для резервного расчета
  const DEFAULT_TAX_RATE = 0.19; // 19% 
  const DEFAULT_TAX_LABEL = 'MwSt. 19%';
  
  // Форматирование валюты с защитой от ошибок
  const formatCurrency = (amount: number): string => {
    if (!amount && amount !== 0) amount = 0;
    if (!currency) currency = 'eur';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase()
      }).format(amount / 100);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
    }
  };

  // Определяем налоговые значения с резервными значениями при любых ошибках
  const taxRate = tax?.rate || DEFAULT_TAX_RATE;
  const taxLabel = tax?.label || DEFAULT_TAX_LABEL;
  const taxAmount = tax?.amount || Math.round(subtotal * DEFAULT_TAX_RATE);
  const totalAmount = subtotal + taxAmount;
  const taxDisplay = tax?.display || `${(taxRate * 100).toFixed(1)}% ${taxLabel}`;
  
  // Определяем стиль и цвет в зависимости от наличия корректных данных
  const boxStyle = tax 
    ? 'bg-green-50 border-green-200 border-green-300' 
    : 'bg-amber-50 border-amber-200 border-amber-300';
  const taxStyle = tax 
    ? 'text-blue-700 bg-blue-100 text-blue-800' 
    : 'text-amber-700 bg-amber-100 text-amber-800';

  return (
    <div className={`tax-display-box ${className} p-3 border rounded ${boxStyle}`}>
      {/* Subtotal информация */}
      <div className="summary-item flex justify-between py-1">
        <span className="text-gray-700">Subtotal:</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>
      
      {/* Налоговая информация */}
      <div className="summary-item flex justify-between py-1" style={{color: tax ? '#1d4ed8' : '#b45309'}}>
        <span>{taxLabel}:</span>
        <span className="font-medium">{formatCurrency(taxAmount)}</span>
      </div>
      
      {/* Детальная информация о налогах */}
      {showDetails && (
        <div className={`px-2 py-1 rounded my-1 text-xs ${taxStyle}`}>
          <span className="flex items-center justify-between">
            <span>{taxDisplay}</span>
            <span className="font-bold">{Math.round(taxRate * 100)}%</span>
          </span>
        </div>
      )}
      
      {/* Если используются данные по умолчанию, показываем предупреждение */}
      {!tax && (
        <div className="bg-red-50 border border-red-200 px-2 py-1 rounded my-1 text-xs text-red-600">
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Using default tax rate (19%)
          </span>
        </div>
      )}
      
      {/* Итоговая сумма всегда отображается */}
      <div className="summary-item flex justify-between py-2 mt-1 border-t font-bold text-lg" 
           style={{borderColor: tax ? '#86efac' : '#fcd34d'}}>
        <span>Total:</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>
      
      {/* Детальный расчет */}
      <div className="text-xs text-gray-500 text-center mt-1">
        {formatCurrency(subtotal)} + {formatCurrency(taxAmount)}
      </div>
    </div>
  );
};

export default TaxDisplayBoxSimple;
export { TaxDisplayBoxSimple };