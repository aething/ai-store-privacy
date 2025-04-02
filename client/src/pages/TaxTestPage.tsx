import React, { useState, useEffect } from 'react';
import { TaxDisplayBox } from '@/components/TaxDisplayBox';
import { TaxDisplayBoxSimple } from '@/components/TaxDisplayBoxSimple';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface TaxInfo {
  amount: number;
  rate: number;
  label: string;
  display?: string;
}

const countries = [
  { code: 'DE', name: 'Germany', taxRate: '19%', currency: 'EUR' },
  { code: 'FR', name: 'France', taxRate: '20%', currency: 'EUR' },
  { code: 'IT', name: 'Italy', taxRate: '22%', currency: 'EUR' },
  { code: 'ES', name: 'Spain', taxRate: '21%', currency: 'EUR' },
  { code: 'NL', name: 'Netherlands', taxRate: '21%', currency: 'EUR' },
  { code: 'US', name: 'United States', taxRate: '0%', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', taxRate: '20%', currency: 'GBP' }
];

const TaxTestPage: React.FC = () => {
  const [country, setCountry] = useState<string>('DE');
  const [amount, setAmount] = useState<number>(1000);
  const [taxData, setTaxData] = useState<TaxApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paymentIntentData, setPaymentIntentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Для упрощенного компонента
  const [taxInfoSimple, setTaxInfoSimple] = useState<TaxInfo | null>(null);

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
      
      // Подготавливаем данные для упрощенного компонента
      setTaxInfoSimple({
        amount: data.taxAmount,
        rate: data.taxRate,
        label: data.taxLabel,
        display: data.taxLabel
      });
      
      console.log('Tax calculation result:', data);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate tax');
      console.error('Tax calculation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для создания PaymentIntent с налогами
  const createPaymentIntent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tax-debug/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          country: country
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setPaymentIntentData(data);
      
      // Обновляем данные для упрощенного компонента
      setTaxInfoSimple({
        amount: data.taxAmount,
        rate: data.taxRate,
        label: data.taxLabel,
        display: data.taxLabel
      });
      
      console.log('PaymentIntent created:', data);
    } catch (err: any) {
      setError(err.message || 'Failed to create PaymentIntent');
      console.error('PaymentIntent error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Вызовем расчет налогов при загрузке страницы и изменении страны/суммы
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
      <h1 className="text-3xl font-bold mb-6">Tax Calculation Testing</h1>
      <p className="mb-6 text-lg text-gray-600">
        This page demonstrates tax calculation for different countries based on our implemented tax logic.
      </p>
      
      <Tabs defaultValue="basic">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Basic Testing</TabsTrigger>
          <TabsTrigger value="components">Component Testing</TabsTrigger>
          <TabsTrigger value="payment">Payment Intent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Tax Calculator</CardTitle>
              <CardDescription>Test tax calculations for different countries and amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name} ({country.taxRate})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount (in cents/pennies)</label>
                    <Input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(parseInt(e.target.value))} 
                      className="w-full"
                    />
                  </div>
                </div>
                
                <Button onClick={calculateTax} disabled={isLoading}>
                  {isLoading ? 'Calculating...' : 'Calculate Tax'}
                </Button>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
                  Error: {error}
                </div>
              )}
              
              {taxData && (
                <div className="bg-gray-50 p-4 rounded border">
                  <h3 className="font-semibold mb-2">Tax Calculation Results</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Country:</div>
                    <div className="font-medium">{taxData.country} {taxData.isEU ? '(EU)' : ''}</div>
                    
                    <div>Base Amount:</div>
                    <div className="font-medium">{formatCurrency(taxData.amount, taxData.currency)}</div>
                    
                    <div>Tax Rate:</div>
                    <div className="font-medium">{(taxData.taxRate * 100).toFixed(2)}%</div>
                    
                    <div>Tax Amount:</div>
                    <div className="font-medium">{formatCurrency(taxData.taxAmount, taxData.currency)}</div>
                    
                    <div>Tax Label:</div>
                    <div className="font-medium">{taxData.taxLabel}</div>
                    
                    <div>Total:</div>
                    <div className="font-medium">{formatCurrency(taxData.total, taxData.currency)}</div>
                    
                    <div>Currency:</div>
                    <div className="font-medium">{taxData.currency.toUpperCase()}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="components">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>TaxDisplayBox Component</CardTitle>
                <CardDescription>Standard tax display component</CardDescription>
              </CardHeader>
              <CardContent>
                {taxData && (
                  <TaxDisplayBox 
                    country={country}
                    currency={taxData.currency}
                    amount={amount}
                    showDebugInfo={true}
                  />
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>TaxDisplayBoxSimple Component</CardTitle>
                <CardDescription>Simplified tax display component</CardDescription>
              </CardHeader>
              <CardContent>
                {taxInfoSimple && (
                  <TaxDisplayBoxSimple 
                    tax={taxInfoSimple}
                    subtotal={amount}
                    currency={taxData?.currency || 'eur'}
                    showDetails={true}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Intent with Tax</CardTitle>
              <CardDescription>Test creating a PaymentIntent with tax calculation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name} ({country.taxRate})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount (in cents/pennies)</label>
                    <Input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(parseInt(e.target.value))} 
                      className="w-full"
                    />
                  </div>
                </div>
                
                <Button onClick={createPaymentIntent} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create PaymentIntent with Tax'}
                </Button>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
                  Error: {error}
                </div>
              )}
              
              {paymentIntentData && (
                <div className="bg-gray-50 p-4 rounded border">
                  <h3 className="font-semibold mb-2">PaymentIntent Created</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Payment ID:</div>
                    <div className="font-medium">{paymentIntentData.paymentIntentId}</div>
                    
                    <div>Country:</div>
                    <div className="font-medium">{paymentIntentData.country} {paymentIntentData.isEU ? '(EU)' : ''}</div>
                    
                    <div>Base Amount:</div>
                    <div className="font-medium">{formatCurrency(paymentIntentData.amount, paymentIntentData.currency)}</div>
                    
                    <div>Tax Rate:</div>
                    <div className="font-medium">{(paymentIntentData.taxRate * 100).toFixed(2)}%</div>
                    
                    <div>Tax Amount:</div>
                    <div className="font-medium">{formatCurrency(paymentIntentData.taxAmount, paymentIntentData.currency)}</div>
                    
                    <div>Tax Label:</div>
                    <div className="font-medium">{paymentIntentData.taxLabel}</div>
                    
                    <div>Total:</div>
                    <div className="font-medium">{formatCurrency(paymentIntentData.total, paymentIntentData.currency)}</div>
                    
                    <div>Currency:</div>
                    <div className="font-medium">{paymentIntentData.currency.toUpperCase()}</div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm mb-1">Client Secret:</h4>
                    <div className="font-mono text-xs bg-gray-100 p-2 rounded border overflow-x-auto">
                      {paymentIntentData.clientSecret}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxTestPage;