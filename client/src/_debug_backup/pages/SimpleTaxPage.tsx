import React, { useState } from 'react';

/**
 * Простая страница для тестирования налогов
 */
const SimpleTaxPage: React.FC = () => {
  const [amount, setAmount] = useState<number>(1000);
  const [country, setCountry] = useState<string>('DE');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const calculateTax = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tax-debug/calculate?amount=${amount}&country=${country}`);
      const data = await response.json();
      setResult(data);
      console.log("Tax data:", data);
    } catch (error) {
      console.error("Error calculating tax:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>Simple Tax Calculator</h1>
      
      <div style={{ marginBottom: '15px' }}>
        <label>
          Amount (in cents): 
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(parseInt(e.target.value))}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>
          Country: 
          <select 
            value={country} 
            onChange={(e) => setCountry(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="US">United States</option>
          </select>
        </label>
      </div>
      
      <button 
        onClick={calculateTax}
        disabled={loading}
        style={{ 
          padding: '8px 16px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer' 
        }}
      >
        {loading ? 'Calculating...' : 'Calculate Tax'}
      </button>
      
      {result && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SimpleTaxPage;