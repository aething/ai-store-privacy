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
  
  // Рассчитываем сумму налога
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
        case 'DE': return t('tax.vat_de');
        case 'FR': return t('tax.vat_fr');
        case 'IT': return t('tax.vat_it');
        case 'ES': return t('tax.vat_es');
        default: return t('tax.vat_eu', { rate: Math.round(taxRate * 100) });
      }
    }
    
    if (country === 'US') {
      return t('tax.us_sales_tax');
    }
    
    return t('tax.no_tax');
  };
  
  if (!country) return null;
  
  return (
    <div className="mt-4 p-3 bg-muted/50 rounded-md border border-border">
      <div className="flex justify-between">
        <span className="text-sm text-muted-foreground">{getTaxLabel()}</span>
        <span className="text-sm font-medium">
          {taxAmount > 0 ? formatCurrency(taxAmount) : t('tax.not_applicable')}
        </span>
      </div>
      
      {showDebugInfo && (
        <div className="mt-2 text-xs text-muted-foreground border-t pt-2">
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