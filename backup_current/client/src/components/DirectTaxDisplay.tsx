import React from 'react';

interface DirectTaxDisplayProps {
  baseAmount: number;
  taxRate: number;
  taxLabel: string;
  currency: string;
  country: string;
}

/**
 * Компонент для прямого отображения налоговой информации без дополнительной логики
 * Специально разработан для обхода проблем с кэшированием и асинхронными обновлениями
 */
const DirectTaxDisplay: React.FC<DirectTaxDisplayProps> = ({
  baseAmount,
  taxRate,
  taxLabel,
  currency,
  country
}) => {
  // Вычисление данных
  const taxAmount = Math.round(baseAmount * taxRate);
  const totalAmount = baseAmount + taxAmount;
  
  // Форматирование валюты
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };
  
  return (
    <div className="p-3 border rounded bg-green-50 border-green-200">
      <div className="mb-2 text-sm text-green-800 bg-green-100 px-2 py-1 rounded">
        Direct Tax Display - Fixed Calculation
      </div>
      
      <table className="w-full text-sm">
        <tbody>
          <tr>
            <td className="py-1">Base Amount:</td>
            <td className="text-right">{formatCurrency(baseAmount)}</td>
          </tr>
          <tr>
            <td className="py-1">
              Tax Rate ({country}):
            </td>
            <td className="text-right">{(taxRate * 100).toFixed(1)}%</td>
          </tr>
          <tr className="text-blue-700">
            <td className="py-1">{taxLabel}:</td>
            <td className="text-right font-medium">{formatCurrency(taxAmount)}</td>
          </tr>
          <tr className="font-bold border-t border-green-300">
            <td className="pt-2">Total:</td>
            <td className="text-right pt-2">{formatCurrency(totalAmount)}</td>
          </tr>
          <tr>
            <td colSpan={2} className="text-center text-xs text-gray-500 pt-1">
              ({formatCurrency(baseAmount)} + {formatCurrency(taxAmount)})
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DirectTaxDisplay;