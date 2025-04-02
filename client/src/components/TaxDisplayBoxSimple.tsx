// Импортируем только необходимые функции, без hooks и контекста
import { formatPrice } from "@/lib/currency";

interface TaxDisplayBoxSimpleProps {
  country: string | null;
  currency: string;
  baseAmount: number;
  taxAmount: number;
  taxRate: number;
  taxLabel: string;
  showDebugInfo?: boolean;
}

/**
 * Упрощенный компонент для отображения информации о налоге, не использующий контекст
 * 
 * Важно: все цены указаны в виде exclusive (НДС добавляется сверху цены)
 * Этот компонент не использует React hooks и может быть использован где угодно
 */
export function TaxDisplayBoxSimple({ 
  country, 
  currency, 
  baseAmount,
  taxAmount,
  taxRate,
  taxLabel,
  showDebugInfo = false
}: TaxDisplayBoxSimpleProps) {
  // Даже если страна не указана, все равно показываем информацию о налогах
  const displayCountry = country || 'DE';
  
  // Простая функция форматирования цены если импорт не работает
  const formatPriceLocal = (amount: number, currency: string): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'eur' ? 'EUR' : 'USD',
      minimumFractionDigits: 2,
    });
    
    // Цена в центах, переводим в основные единицы
    return formatter.format(amount / 100);
  };
  
  const formattedTaxAmount = formatPrice ? formatPrice(taxAmount, currency, false) : formatPriceLocal(taxAmount, currency);
  const formattedBaseAmount = formatPrice ? formatPrice(baseAmount, currency, false) : formatPriceLocal(baseAmount, currency);
  const formattedTotalAmount = formatPrice ? formatPrice(baseAmount + taxAmount, currency, false) : formatPriceLocal(baseAmount + taxAmount, currency);
  
  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200 shadow-sm">
      <div className="flex justify-between font-medium">
        <span className="text-sm text-gray-800 flex items-center">
          {taxLabel}
          <span className="ml-2 px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{displayCountry.toUpperCase()}</span>
        </span>
        <span className="text-sm font-semibold">
          {formattedTaxAmount}
        </span>
      </div>
      
      {taxAmount > 0 && (
        <div className="flex justify-between text-sm mt-2 text-gray-700 pt-2 border-t border-gray-200">
          <span>Total with Tax</span>
          <span className="font-semibold">{formattedTotalAmount}</span>
        </div>
      )}
      
      {/* Пояснение о налогах */}
      <div className="mt-2 text-xs text-gray-500">
        {displayCountry === 'DE' ? (
          <div className="italic">* Price excludes VAT, which is added at checkout</div>
        ) : displayCountry === 'US' ? (
          <div className="italic">* No sales tax is applied as nexus thresholds haven't been reached</div>
        ) : (
          <div className="italic">* Tax rates are calculated based on your location</div>
        )}
      </div>
      
      {showDebugInfo && (
        <div className="mt-2 text-xs text-gray-500 border-t border-gray-200 pt-2">
          <div>Debug: Country: {country}</div>
          <div>Tax Rate: {(taxRate * 100).toFixed(2)}%</div>
          <div>Base Amount: {formattedBaseAmount}</div>
          <div>Tax Amount: {formattedTaxAmount}</div>
          <div>Total: {formattedTotalAmount}</div>
        </div>
      )}
    </div>
  );
}