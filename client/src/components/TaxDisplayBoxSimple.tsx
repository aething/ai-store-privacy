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
  showDetails = true
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

  // Если налоговая информация не предоставлена, показываем "Без налога"
  if (!tax) {
    return (
      <div className={`tax-display-box ${className}`}>
        <div className="summary-item">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="summary-item">
          <span>Tax:</span>
          <span>{formatCurrency(0)}</span>
        </div>
        <div className="summary-item total">
          <span>Total:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
      </div>
    );
  }

  // Рассчитываем итоговую сумму
  const totalAmount = subtotal + tax.amount;

  return (
    <div className={`tax-display-box ${className}`}>
      <div className="summary-item">
        <span>Subtotal:</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="summary-item">
        <span>Tax ({tax.label}):</span>
        <span>{formatCurrency(tax.amount)}</span>
      </div>
      {showDetails && tax.rate > 0 && (
        <div className="tax-details">
          <small>
            {tax.display || `${(tax.rate * 100).toFixed(2)}% ${tax.label}`}
          </small>
        </div>
      )}
      <div className="summary-item total">
        <span>Total:</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
};

export default TaxDisplayBoxSimple;
export { TaxDisplayBoxSimple };