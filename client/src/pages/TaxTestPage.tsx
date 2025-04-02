import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { TaxDisplayBoxSimple } from "@/components/TaxDisplayBoxSimple";
import { formatPrice } from "@/lib/currency";
import { useState, useEffect } from "react";

/**
 * Тестовая страница для отображения налоговой информации
 */
export default function TaxTestPage() {
  const [, setLocation] = useLocation();
  
  // Тестовые данные
  const countries = [
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' }
  ];

  const [selectedCountry, setSelectedCountry] = useState('DE');
  const [baseAmount, setBaseAmount] = useState(276000); // 2760 EUR in cents
  const [taxRate, setTaxRate] = useState(0.19); // 19% for Germany
  const [taxAmount, setTaxAmount] = useState(Math.round(276000 * 0.19)); // 19% tax for Germany
  const [taxLabel, setTaxLabel] = useState('MwSt. 19%');
  const [currency, setCurrency] = useState<'usd' | 'eur'>('eur');
  
  // Функция для расчета налогов в зависимости от страны
  const calculateTaxRate = (country: string) => {
    const euVatRates: Record<string, { rate: number; label: string }> = {
      // Страны ЕС
      'DE': { rate: 0.19, label: 'MwSt. 19%' }, // Германия
      'FR': { rate: 0.20, label: 'TVA 20%' },   // Франция
      'IT': { rate: 0.22, label: 'IVA 22%' },   // Италия
      'ES': { rate: 0.21, label: 'IVA 21%' },   // Испания
      'GB': { rate: 0.20, label: 'VAT 20%' },   // Великобритания
      'US': { rate: 0, label: 'No Sales Tax' }, // США
    };
    
    return euVatRates[country] || { rate: 0, label: 'No VAT/Tax' };
  };
  
  // Обновляем налоговую информацию при изменении страны
  useEffect(() => {
    const { rate, label } = calculateTaxRate(selectedCountry);
    setTaxRate(rate);
    setTaxLabel(label);
    
    // Устанавливаем валюту в зависимости от страны (EUR для стран ЕС, USD для остальных)
    if (['DE', 'FR', 'IT', 'ES'].includes(selectedCountry)) {
      setCurrency('eur');
      // Цена в EUR для стран ЕС
      setBaseAmount(276000); // 2760 EUR в центах
    } else {
      setCurrency('usd');
      // Цена в USD для остальных стран
      setBaseAmount(284500); // 2845 USD в центах
    }
    
    // Рассчитываем налог
    const newTaxAmount = Math.round(baseAmount * rate);
    setTaxAmount(newTaxAmount);
    
    console.log(`Changed country to ${selectedCountry}, tax rate: ${rate * 100}%, tax amount: ${newTaxAmount}`);
  }, [selectedCountry]);
  
  return (
    <div className="container max-w-2xl mx-auto py-4">
      <div className="flex items-center mb-4">
        <button 
          className="p-1 mr-2"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">Tax Display Test Page</h2>
      </div>
      
      <Card className="p-6 mb-6">
        <h3 className="font-medium mb-4">Select Country to Test Tax Calculation</h3>
        
        <div className="grid grid-cols-3 gap-2 mb-6">
          {countries.map(country => (
            <button
              key={country.code}
              className={`p-2 border rounded-md ${selectedCountry === country.code ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
              onClick={() => setSelectedCountry(country.code)}
            >
              {country.name}
            </button>
          ))}
        </div>
        
        <div className="border-t border-b py-4 my-4">
          <div className="mb-4">
            <h4 className="font-medium">Product Details</h4>
            <div className="flex justify-between mt-2">
              <span>AI-Driven Solutions</span>
              <span className="font-medium">{formatPrice(baseAmount, currency, false)}</span>
            </div>
          </div>
          
          <table className="w-full mb-4">
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
              
              <tr className="font-bold text-lg bg-green-50">
                <td className="text-left pt-2 pb-2 border-t">Total</td>
                <td className="text-right pt-2 pb-2 border-t">
                  {formatPrice(baseAmount + taxAmount, currency, false)}
                </td>
              </tr>
            </tbody>
          </table>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Tax Details Component:</h4>
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
        
        <div className="text-sm text-gray-500">
          <p className="mb-2">
            <strong>Note:</strong> This page is for testing the tax display component without 
            the need for authentication. The tax rates are calculated based on the selected country.
          </p>
          <p>
            <strong>Technical details:</strong> Using the simplified TaxDisplayBoxSimple component 
            to avoid hook-related errors that were occurring with the original TaxDisplayBox component.
          </p>
        </div>
      </Card>
    </div>
  );
}