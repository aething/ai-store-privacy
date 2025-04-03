import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

/**
 * Простая страница для тестирования расчета налогов
 */
const StandaloneTaxTest: React.FC = () => {
  const [amount, setAmount] = React.useState(1000);
  const [country, setCountry] = React.useState('DE');
  const [taxInfo, setTaxInfo] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTaxInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/tax-debug/calculate?amount=${amount}&country=${country}`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      setTaxInfo(data);
      console.log('Tax info:', data);
    } catch (err) {
      console.error('Error fetching tax info:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Standalone Tax Test</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="DE">Germany (DE)</option>
              <option value="FR">France (FR)</option>
              <option value="US">United States (US)</option>
              <option value="GB">United Kingdom (GB)</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={fetchTaxInfo}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Calculate Tax'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {taxInfo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Tax Calculation Result</h2>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Amount:</div>
            <div>{taxInfo.amount} {taxInfo.currency.toUpperCase()}</div>
            
            <div className="font-medium">Tax Rate:</div>
            <div>{(taxInfo.taxRate * 100).toFixed(2)}%</div>
            
            <div className="font-medium">Tax Amount:</div>
            <div>{taxInfo.taxAmount} {taxInfo.currency.toUpperCase()}</div>
            
            <div className="font-medium">Total:</div>
            <div>{taxInfo.total} {taxInfo.currency.toUpperCase()}</div>
            
            <div className="font-medium">Country:</div>
            <div>{taxInfo.country}</div>
            
            <div className="font-medium">Tax Label:</div>
            <div>{taxInfo.taxLabel}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Рендерим независимо от основного приложения
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StandaloneTaxTest />
  </React.StrictMode>
);