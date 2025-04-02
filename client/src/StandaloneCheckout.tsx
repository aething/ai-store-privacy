import React from 'react';
import ReactDOM from 'react-dom/client';
import { Card } from "./components/ui/card";
import { formatPrice } from "./lib/currency";
import { TaxDisplayBoxSimple } from "./components/TaxDisplayBoxSimple";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import './index.css';

const countries = [
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' }
];

// Простая страница оформления заказа без использования React-контекстов
const StandaloneCheckout = () => {
  const [selectedCountry, setSelectedCountry] = React.useState('DE');
  const [baseAmount, setBaseAmount] = React.useState(276000); // 2760 EUR in cents
  const [currency, setCurrency] = React.useState<'usd' | 'eur'>('eur');
  
  // Функция для расчета налогов в зависимости от страны
  const calculateTaxRate = (country: string) => {
    const euVatRates: Record<string, { rate: number; label: string }> = {
      'DE': { rate: 0.19, label: 'MwSt. 19%' }, // Германия
      'FR': { rate: 0.20, label: 'TVA 20%' },   // Франция
      'IT': { rate: 0.22, label: 'IVA 22%' },   // Италия
      'ES': { rate: 0.21, label: 'IVA 21%' },   // Испания
      'GB': { rate: 0.20, label: 'VAT 20%' },   // Великобритания
      'US': { rate: 0, label: 'No Sales Tax' }, // США
    };
    
    return euVatRates[country] || { rate: 0, label: 'No VAT/Tax' };
  };
  
  // Рассчитываем налоговую информацию
  const { rate: taxRate, label: taxLabel } = calculateTaxRate(selectedCountry);
  const taxAmount = Math.round(baseAmount * taxRate);
  
  // Обновляем валюту и цену при изменении страны
  React.useEffect(() => {
    if (['DE', 'FR', 'IT', 'ES'].includes(selectedCountry)) {
      setCurrency('eur');
      setBaseAmount(276000); // 2760 EUR в центах
    } else {
      setCurrency('usd');
      setBaseAmount(284500); // 2845 USD в центах
    }
  }, [selectedCountry]);
  
  const productName = "AI-Driven Solutions";
  const productDescription = "Advanced AI platform with multilingual capabilities";
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <header className="flex items-center mb-6">
        <button 
          className="p-1 mr-2"
          onClick={() => window.location.href = "/"}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Checkout Demo</h1>
      </header>
      
      {/* Выбор страны */}
      <Card className="p-4 mb-6">
        <h2 className="font-semibold mb-3">Select Country for Tax Calculation</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {countries.map(country => (
            <button
              key={country.code}
              className={`p-2 rounded border ${
                selectedCountry === country.code 
                ? 'bg-blue-600 text-white border-blue-700' 
                : 'bg-white hover:bg-gray-100 border-gray-300'
              }`}
              onClick={() => setSelectedCountry(country.code)}
            >
              {country.name}
            </button>
          ))}
        </div>
      </Card>
      
      {/* Информация о продукте и стоимости */}
      <Card className="p-4 mb-6">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded mr-4 flex items-center justify-center text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"/></svg>
          </div>
          <div>
            <h3 className="font-medium">{productName}</h3>
            <p className="text-gray-600 text-sm">{productDescription}</p>
            <p className="text-lg font-semibold mt-1">{formatPrice(baseAmount, currency, false)}</p>
          </div>
        </div>
        
        <div className="border-t border-b py-3 my-3">
          <table className="w-full">
            <tbody>
              <tr className="mb-2">
                <td className="text-left pb-2">Subtotal</td>
                <td className="text-right pb-2">{formatPrice(baseAmount, currency, false)}</td>
              </tr>
              
              {/* Налоговая информация */}
              <tr className="mb-2 bg-yellow-50">
                <td className="text-left pb-2 pt-2 font-medium">
                  <span className="flex items-center">
                    {taxLabel}
                    <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-1 py-0.5 rounded">{selectedCountry}</span>
                  </span>
                </td>
                <td className="text-right pb-2 pt-2 font-medium">
                  {formatPrice(taxAmount, currency, false)}
                </td>
              </tr>
              
              {/* Добавляем строку с пояснением о налогах */}
              <tr className="mb-2 bg-blue-50">
                <td colSpan={2} className="text-left pb-2 pt-2 px-2 text-xs text-blue-600 italic rounded">
                  {selectedCountry === 'DE' 
                    ? "* Prices exclude VAT (19%), which is added at checkout" 
                    : selectedCountry === 'US'
                      ? "* No sales tax is applied (nexus thresholds not reached)"
                      : "* Tax rates are calculated based on your location"}
                </td>
              </tr>
              
              <tr className="mb-2">
                <td className="text-left pb-2">Shipping</td>
                <td className="text-right pb-2">Free</td>
              </tr>
              
              <tr className="font-bold text-lg bg-green-50">
                <td className="text-left pt-2 pb-2 border-t">Total</td>
                <td className="text-right pt-2 pb-2 border-t">
                  {formatPrice(baseAmount + taxAmount, currency, false)}
                </td>
              </tr>
            </tbody>
          </table>
          
          {/* Используем компонент TaxDisplayBoxSimple для отображения информации о налоге */}
          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium mb-2 flex items-center">
              <AlertTriangle size={16} className="mr-2 text-amber-500" />
              Tax Calculation Details:
            </h4>
            <TaxDisplayBoxSimple 
              country={selectedCountry} 
              currency={currency}
              baseAmount={baseAmount}
              taxAmount={taxAmount}
              taxRate={taxRate}
              taxLabel={taxLabel}
              showDebugInfo={true} 
            />
          </div>
        </div>
        
        {/* Пояснительный текст */}
        <div className="text-sm text-gray-500">
          <p className="mb-2">
            <strong>Note:</strong> This is a standalone demo that shows tax calculations
            without requiring authentication or context. It's designed to demonstrate the
            tax calculation logic and display without the complexity of the full application.
          </p>
        </div>
      </Card>
      
      {/* Кнопка оплаты (неактивная) */}
      <Card className="p-4 mb-4">
        <h3 className="font-medium mb-4">Payment Information</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-gray-700 mb-2">This is a demo version without actual payment processing</p>
            <button
              className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
              disabled
            >
              Continue to Payment (Demo)
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Рендерим приложение
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StandaloneCheckout />
  </React.StrictMode>
);

export default StandaloneCheckout;