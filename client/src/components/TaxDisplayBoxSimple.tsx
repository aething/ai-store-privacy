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
  
  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200 shadow-sm">
      <div className="flex justify-between font-medium">
        <span className="text-sm text-gray-800 flex items-center">
          {taxLabel}
          <span className="ml-2 px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{displayCountry.toUpperCase()}</span>
        </span>
        <span className="text-sm font-semibold">
          {formatPrice(taxAmount, currency, false)}
        </span>
      </div>
      
      {taxAmount > 0 && (
        <div className="flex justify-between text-sm mt-2 text-gray-700 pt-2 border-t border-gray-200">
          <span>Total with Tax</span>
          <span className="font-semibold">{formatPrice(baseAmount + taxAmount, currency, false)}</span>
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
          <div>Base Amount: {formatPrice(baseAmount, currency, false)}</div>
          <div>Tax Amount: {formatPrice(taxAmount, currency, false)}</div>
          <div>Total: {formatPrice(baseAmount + taxAmount, currency, false)}</div>
        </div>
      )}
    </div>
  );
}