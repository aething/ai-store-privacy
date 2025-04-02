import React, { useState } from 'react';
import { TaxDisplayBoxSimple } from './components/TaxDisplayBoxSimple';

// Tax calculation function
const calculateTaxRate = (country: string) => {
  const euVatRates: Record<string, { rate: number; label: string }> = {
    // EU countries
    'DE': { rate: 0.19, label: 'MwSt. 19%' }, // Germany
    'FR': { rate: 0.20, label: 'TVA 20%' },   // France
    'IT': { rate: 0.22, label: 'IVA 22%' },   // Italy
    'ES': { rate: 0.21, label: 'IVA 21%' },   // Spain
    'GB': { rate: 0.20, label: 'VAT 20%' },   // United Kingdom
    'US': { rate: 0, label: 'No Sales Tax' }, // USA
  };
  
  return euVatRates[country] || { rate: 0, label: 'No Tax' };
};

// Simple formatter for prices
const formatPrice = (amount: number, currency: string): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'eur' ? 'EUR' : 'USD',
    minimumFractionDigits: 2,
  });
  
  return formatter.format(amount / 100);
};

// Currency selection based on country
const getCurrencyForCountry = (country: string): 'usd' | 'eur' => {
  // List of countries using EUR
  const eurCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  
  return eurCountries.includes(country) ? 'eur' : 'usd';
};

// Product prices
const prices = {
  usd: 284500, // $2,845
  eur: 276000  // €2,760
};

// Demo app
export default function StandaloneTaxDemo() {
  const countries = [
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' }
  ];
  
  const [selectedCountry, setSelectedCountry] = useState('DE');
  
  // Calculate tax information based on selected country
  const currency = getCurrencyForCountry(selectedCountry);
  const baseAmount = prices[currency];
  const { rate, label } = calculateTaxRate(selectedCountry);
  const taxAmount = Math.round(baseAmount * rate);
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Tax Calculation Demo</h1>
        <p className="text-gray-600">
          This page demonstrates tax calculation for different countries
        </p>
      </header>
      
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">Select Country</h2>
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
      </div>
      
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Product Information</h2>
        
        <div className="mb-4 p-3 bg-white rounded border">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">AI-Driven Solutions</h3>
              <p className="text-sm text-gray-600">
                Professional AI Platform
              </p>
            </div>
            <div className="text-xl font-semibold">
              {formatPrice(baseAmount, currency)}
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="pb-2">Subtotal:</td>
                <td className="text-right pb-2">{formatPrice(baseAmount, currency)}</td>
              </tr>
              <tr className="bg-yellow-50">
                <td className="py-2">
                  <span className="flex items-center">
                    {label}
                    <span className="ml-2 bg-blue-100 text-blue-700 text-xs rounded px-1">
                      {selectedCountry}
                    </span>
                  </span>
                </td>
                <td className="text-right py-2">{formatPrice(taxAmount, currency)}</td>
              </tr>
              <tr className="font-bold border-t">
                <td className="pt-2">Total:</td>
                <td className="text-right pt-2">{formatPrice(baseAmount + taxAmount, currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Tax Display Component</h2>
        
        <TaxDisplayBoxSimple 
          country={selectedCountry}
          currency={currency}
          baseAmount={baseAmount}
          taxAmount={taxAmount}
          taxRate={rate}
          taxLabel={label}
          showDebugInfo={true}
        />
      </div>
      
      <div className="text-sm text-gray-500 border-t pt-4">
        <p>This is a standalone demo page that doesn't require authentication or context.</p>
        <p>It demonstrates how the tax calculation works for different countries.</p>
      </div>
    </div>
  );
}