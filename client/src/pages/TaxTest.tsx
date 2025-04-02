import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DirectTaxDisplay from '@/components/DirectTaxDisplay';

/**
 * Простая тестовая страница для проверки отображения налоговой информации
 */
const TaxTest: React.FC = () => {
  const [, setLocation] = useLocation();
  const [country, setCountry] = useState('DE'); // Германия по умолчанию
  
  // Параметры для тестирования
  const baseAmount = 276000; // €2,760.00 в центах
  
  // Выбираем правильные значения налога в зависимости от страны
  const countryTaxData = {
    'DE': { rate: 0.19, label: 'MwSt. 19%' },
    'FR': { rate: 0.20, label: 'TVA 20%' },
    'US': { rate: 0.0, label: 'No Tax' }
  };
  
  const taxRate = countryTaxData[country as keyof typeof countryTaxData].rate;
  const taxLabel = countryTaxData[country as keyof typeof countryTaxData].label;
  const taxAmount = Math.round(baseAmount * taxRate); // Налог в центах
  const totalAmount = baseAmount + taxAmount; // Итоговая сумма в центах
  
  // Форматирование валюты
  const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
    console.log('Formatting currency:', amount, currency);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };
  
  // Страны для тестирования
  const countries = [
    { code: 'DE', name: 'Germany', rate: 0.19, label: 'MwSt. 19%' },
    { code: 'FR', name: 'France', rate: 0.20, label: 'TVA 20%' },
    { code: 'US', name: 'United States', rate: 0, label: 'No Tax' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="flex items-center mb-6">
        <button 
          className="p-1 mr-2"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Tax Display Test</h1>
      </header>
      
      {/* Выбор страны */}
      <Card className="p-4 mb-6">
        <h2 className="font-semibold mb-3">Select Country for Tax Calculation</h2>
        <div className="grid grid-cols-3 gap-2">
          {countries.map(c => (
            <button
              key={c.code}
              className={`p-2 rounded border ${
                country === c.code 
                ? 'bg-blue-600 text-white border-blue-700' 
                : 'bg-white hover:bg-gray-100 border-gray-300'
              }`}
              onClick={() => setCountry(c.code)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </Card>
      
      {/* Информация о товаре */}
      <Card className="p-4 mb-6">
        <h2 className="font-semibold mb-3">Product Information</h2>
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded mr-4 flex items-center justify-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium">AI-Driven Solutions</h3>
            <p className="text-lg">{formatCurrency(baseAmount)}</p>
          </div>
        </div>
      </Card>
      
      {/* Налоговая информация */}
      <Card className="p-4 mb-6">
        <h2 className="font-semibold mb-3">Tax Information</h2>
        
        <table className="w-full">
          <tbody>
            <tr className="border-b">
              <td className="py-2">Subtotal</td>
              <td className="text-right py-2">{formatCurrency(baseAmount)}</td>
            </tr>
            <tr className="border-b bg-yellow-50">
              <td className="py-2">{taxLabel} ({country})</td>
              <td className="text-right py-2 font-semibold">{formatCurrency(taxAmount)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Shipping</td>
              <td className="text-right py-2">Free</td>
            </tr>
            <tr className="font-bold text-lg">
              <td className="pt-2">Total</td>
              <td className="text-right pt-2">{formatCurrency(totalAmount)}</td>
            </tr>
            <tr>
              <td colSpan={2} className="text-center text-sm text-gray-500 pt-1">
                ({formatCurrency(baseAmount)} + {formatCurrency(taxAmount)})
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
      
      {/* Компонент прямого отображения налоговой информации */}
      <Card className="p-4 mb-6">
        <h2 className="font-semibold mb-3">Direct Tax Display Component</h2>
        <DirectTaxDisplay
          baseAmount={baseAmount}
          taxRate={taxRate}
          taxLabel={taxLabel}
          currency={'EUR'}
          country={country}
        />
      </Card>
      
      {/* Техническая информация */}
      <Card className="p-4 mb-6 bg-gray-50">
        <h2 className="font-semibold mb-3">Technical Details</h2>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
{`Base Amount: ${baseAmount} cents = ${formatCurrency(baseAmount)}
Tax Rate: ${taxRate * 100}%
Tax Amount: ${taxAmount} cents = ${formatCurrency(taxAmount)}
Total Amount: ${totalAmount} cents = ${formatCurrency(totalAmount)}
`}
        </pre>
      </Card>
    </div>
  );
};

export default TaxTest;