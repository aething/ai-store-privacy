import React from "react";
import { useTranslation } from "@shared/localization/useTranslation";

interface TaxDisplayBoxProps {
  country: string | null;
  currency: string;
  amount: number;
  showDebugInfo?: boolean;
}

/**
 * Компонент для отображения информации о налоге
 * 
 * Важно: все цены указаны в виде exclusive (НДС добавляется сверху цены)
 */
export function TaxDisplayBox({ 
  country, 
  currency, 
  amount,
  showDebugInfo = false
}: TaxDisplayBoxProps) {
  const { t } = useTranslation();
  
  // Определяем, является ли страна членом ЕС
  const isEUCountry = React.useMemo(() => {
    if (!country) return false;
    
    const euCountries = [
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
      'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
      'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
    ];
    
    return euCountries.includes(country);
  }, [country]);
  
  // Определяем ставку налога в зависимости от страны
  const taxRate = React.useMemo(() => {
    if (!country) return 0;
    
    if (isEUCountry) {
      // Разные ставки НДС для стран ЕС
      switch (country) {
        case 'DE': return 0.19; // 19% для Германии
        case 'FR': return 0.20; // 20% для Франции
        case 'IT': return 0.22; // 22% для Италии
        case 'IE': return 0.23; // 23% для Ирландии
        default: return 0.21; // Средняя ставка для других стран ЕС
      }
    }
    
    // Для США и других стран налог не учитывается
    return 0;
  }, [country, isEUCountry]);
  
  // Рассчитываем сумму налога (цены указаны exclusive - без НДС)
  const taxAmount = Math.round(amount * taxRate);
  
  // Форматирование суммы в зависимости от валюты
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2
    }).format(amount / 100);
  };
  
  // Определяем текст для отображения
  const getTaxLabel = (): string => {
    if (!country) return t('tax.unknown');
    
    if (isEUCountry) {
      switch (country) {
        case 'DE': return 'MwSt. 19%';
        case 'FR': return 'TVA 20%';
        case 'IT': return 'IVA 22%';
        case 'ES': return 'IVA 21%';
        default: return `VAT ${Math.round(taxRate * 100)}%`;
      }
    }
    
    if (country === 'US') {
      return 'No Sales Tax';
    }
    
    return 'No Tax';
  };
  
  // Даже если страна не указана, все равно показываем информацию о налогах
  const displayCountry = country || 'unknown';
  
  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
      <div className="flex justify-between font-medium">
        <span className="text-sm text-gray-600">{getTaxLabel()}</span>
        <span className="text-sm">
          {taxAmount > 0 ? formatCurrency(taxAmount) : 'N/A'}
        </span>
      </div>
      
      {taxAmount > 0 && (
        <div className="flex justify-between text-sm mt-2 text-gray-500 pt-2 border-t border-gray-200">
          <span>Total with Tax</span>
          <span className="font-medium">{formatCurrency(amount + taxAmount)}</span>
        </div>
      )}
      
      {/* Пояснение о налогах */}
      <div className="mt-2 text-xs text-gray-500">
        {isEUCountry ? (
          <div className="italic">* Price excludes VAT, which is added at checkout</div>
        ) : country === 'US' ? (
          <div className="italic">* No sales tax is applied as nexus thresholds haven't been reached</div>
        ) : (
          <div className="italic">* Tax rates are calculated based on your location</div>
        )}
      </div>
      
      {showDebugInfo && (
        <div className="mt-2 text-xs text-gray-500 border-t border-gray-200 pt-2">
          <div>Debug: Country: {country}</div>
          <div>Tax Rate: {(taxRate * 100).toFixed(2)}%</div>
          <div>Base Amount: {formatCurrency(amount)}</div>
          <div>Tax Amount: {formatCurrency(taxAmount)}</div>
          <div>Total: {formatCurrency(amount + taxAmount)}</div>
        </div>
      )}
    </div>
  );
}