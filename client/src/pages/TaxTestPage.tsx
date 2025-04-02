import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface TaxApiResponse {
  amount: number;
  taxRate: number;
  taxAmount: number;
  taxLabel: string;
  total: number;
  currency: string;
  country: string;
  isEU: boolean;
}

const countries = [
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'US', name: 'United States' }
];

const TaxTestPage: React.FC = () => {
  const [country, setCountry] = useState<string>('DE');
  const [amount, setAmount] = useState<number>(1000);
  const [taxData, setTaxData] = useState<TaxApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Функция для вызова API расчета налогов
  const calculateTax = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tax-debug/calculate?amount=${amount}&country=${country}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setTaxData(data);
      console.log('Tax calculation result:', data);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate tax');
      console.error('Tax calculation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Вызовем расчет налогов при загрузке страницы
  useEffect(() => {
    calculateTax();
  }, []);

  // Функция для форматирования суммы
  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tax Calculation Test</h1>
      <p className="mb-4">This page tests tax calculation for different countries.</p>
      
      <div className="mb-4">
        <label className="block mb-2">Country:</label>
        <select 
          value={country} 
          onChange={(e) => setCountry(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">Amount (in cents/pennies):</label>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(parseInt(e.target.value))} 
          className="w-full p-2 border rounded"
        />
      </div>
      
      <Button onClick={calculateTax} className="mb-4" disabled={isLoading}>
        {isLoading ? 'Calculating...' : 'Calculate Tax'}
      </Button>
      
      {error && (
        <div className="bg-red-100 p-4 mb-4 rounded text-red-700">
          Error: {error}
        </div>
      )}
      
      {taxData && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Results:</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>Country:</div>
            <div>{taxData.country} {taxData.isEU ? '(EU)' : ''}</div>
            
            <div>Base Amount:</div>
            <div>{formatCurrency(taxData.amount, taxData.currency)}</div>
            
            <div>Tax Rate:</div>
            <div>{(taxData.taxRate * 100).toFixed(2)}%</div>
            
            <div>Tax Amount:</div>
            <div>{formatCurrency(taxData.taxAmount, taxData.currency)}</div>
            
            <div>Tax Label:</div>
            <div>{taxData.taxLabel}</div>
            
            <div>Total:</div>
            <div>{formatCurrency(taxData.total, taxData.currency)}</div>
            
            <div>Currency:</div>
            <div>{taxData.currency.toUpperCase()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxTestPage;