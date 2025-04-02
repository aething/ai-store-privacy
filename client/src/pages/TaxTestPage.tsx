import React, { useState } from 'react';

interface TaxInfo {
  amount: number;
  rate: number;
  label: string;
  display?: string;
}

/**
 * Простой компонент для отображения информации о налоге
 */
const SimpleTaxDisplay: React.FC<{
  tax: TaxInfo | null;
  subtotal: number;
  currency: string;
  className?: string;
}> = ({ tax, subtotal, currency, className = '' }) => {
  
  // Форматирование валюты
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  // Если налоговая информация не предоставлена, показываем "Без налога"
  if (!tax) {
    return (
      <div className={`p-4 rounded border ${className}`}>
        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Tax:</span>
          <span>{formatCurrency(0)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
      </div>
    );
  }

  // Рассчитываем итоговую сумму
  const totalAmount = subtotal + tax.amount;

  return (
    <div className={`p-4 rounded border ${className}`}>
      <div className="flex justify-between mb-2">
        <span>Subtotal:</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span>Tax ({tax.label}):</span>
        <span>{formatCurrency(tax.amount)}</span>
      </div>
      {tax.rate > 0 && (
        <div className="text-sm text-gray-600 mb-2">
          <small>
            {tax.display || `${(tax.rate * 100).toFixed(2)}% ${tax.label}`}
          </small>
        </div>
      )}
      <div className="flex justify-between font-bold">
        <span>Total:</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
};

const TaxTestPage: React.FC = () => {
  console.log('Tax Test Page is rendering');
  
  const [amount, setAmount] = useState<number>(1000);
  const [currency, setCurrency] = useState<string>('usd');
  const [country, setCountry] = useState<string>('US');
  const [loading, setLoading] = useState<boolean>(false);
  const [taxInfo, setTaxInfo] = useState<TaxInfo | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Расчет налогов на основе страны
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
  }

  // Расчет налога локально для предварительного отображения
  const calculateLocalTax = (): TaxInfo => {
    const { rate, label } = calculateTaxRate(country);
    const taxAmount = Math.round(amount * rate);
    
    return {
      amount: taxAmount,
      rate,
      label
    };
  }

  // Создание Payment Intent с расчетом налога на сервере
  const createPaymentIntent = async () => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      const response = await fetch('/api/tax-debug/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: 1,
          userId: 1,
          amount,
          currency,
          country
        })
      });
      
      if (!response.ok) {
        throw new Error('Server responded with an error');
      }
      
      const result = await response.json();
      
      setClientSecret(result.clientSecret);
      setTaxInfo(result.tax || null);
      
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Предварительный локальный расчет налога
  const localTax = calculateLocalTax();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tax Calculation Test</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Configure Test Parameters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount (in cents)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={50}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              className="w-full p-2 border rounded"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="gbp">GBP</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <select
              className="w-full p-2 border rounded"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="US">United States</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="IT">Italy</option>
              <option value="ES">Spain</option>
              <option value="GB">United Kingdom</option>
            </select>
          </div>
        </div>
        
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          onClick={createPaymentIntent}
          disabled={loading}
        >
          {loading ? 'Calculating...' : 'Calculate Tax & Create Payment Intent'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Local Tax Calculation (Client-Side)</h2>
          <SimpleTaxDisplay
            tax={localTax}
            subtotal={amount}
            currency={currency}
            className="bg-gray-50"
          />
          <div className="mt-4 text-sm text-gray-600">
            <p>This calculation is done locally in the browser for preview purposes.</p>
            <p>Local calculation uses simplified tax rules and may not be accurate for all cases.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Server Tax Calculation (API)</h2>
          
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{errorMessage}</p>
            </div>
          )}
          
          {taxInfo ? (
            <>
              <SimpleTaxDisplay
                tax={taxInfo}
                subtotal={amount}
                currency={currency}
                className="bg-gray-50"
              />
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm">
                <p className="font-semibold">Payment Intent Created</p>
                <p className="mt-1 break-all">Client Secret: {clientSecret}</p>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 p-4 rounded text-center">
              <p className="text-gray-500">Click the calculate button to get server-side tax calculation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxTestPage;