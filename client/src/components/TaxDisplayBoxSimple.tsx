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
 */
const TaxDisplayBoxSimple: React.FC<TaxDisplayBoxProps> = ({
  tax,
  subtotal,
  currency,
  className = '',
  showDetails = false
}) => {
  console.log('TaxDisplayBoxSimple rendering:', { tax, subtotal, currency });
  
  // Форматирование валюты
  const formatCurrency = (amount: number): string => {
    console.log('Formatting currency:', amount, currency);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  // Если налоговая информация не предоставлена, показываем информацию с 19% налогом по умолчанию
  if (!tax) {
    console.warn("Tax information is missing, using default 19% rate");
    const defaultTaxAmount = Math.round(subtotal * 0.19); // 19% по умолчанию
    
    return (
      <div className={`tax-display-box ${className} bg-amber-50 p-3 border border-amber-200 rounded`}>
        <div className="summary-item flex justify-between py-1">
          <span className="text-gray-700">Subtotal:</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="summary-item flex justify-between py-1 text-amber-700">
          <span>Tax (Default 19%):</span>
          <span className="font-medium">{formatCurrency(defaultTaxAmount)}</span>
        </div>
        <div className="bg-red-50 border border-red-200 px-2 py-1 rounded my-1 text-xs text-red-600">
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Tax calculation fallback is used. Original tax data is missing.
          </span>
        </div>
        <div className="summary-item flex justify-between py-2 mt-1 border-t border-amber-300 font-bold text-lg">
          <span>Total:</span>
          <span>{formatCurrency(subtotal + defaultTaxAmount)}</span>
        </div>
      </div>
    );
  }

  // Рассчитываем итоговую сумму
  const totalAmount = subtotal + tax.amount;

  return (
    <div className={`tax-display-box ${className} p-3 border border-green-200 rounded bg-green-50`}>
      <div className="summary-item flex justify-between py-1">
        <span className="text-gray-700">Subtotal:</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>
      <div className="summary-item flex justify-between py-1 text-blue-700">
        <span>Tax ({tax.label}):</span>
        <span className="font-medium">{formatCurrency(tax.amount)}</span>
      </div>
      {showDetails && tax.rate > 0 && (
        <div className="tax-details bg-blue-100 px-2 py-1 rounded my-1 text-blue-800">
          <small>
            {tax.display || `${(tax.rate * 100).toFixed(2)}% ${tax.label}`}
          </small>
        </div>
      )}
      <div className="summary-item flex justify-between py-2 mt-1 border-t border-green-300 font-bold text-lg">
        <span>Total:</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
};

export default TaxDisplayBoxSimple;
export { TaxDisplayBoxSimple };