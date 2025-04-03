import { useState } from 'react';
import CountrySelect from '@/components/CountrySelect';
import { Card } from '@/components/ui/card';
import { countries } from '@/data/countries';

export default function CountrySelectDemo() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Country Select Demo</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Register Form Country Selection</h2>
        
        <div className="mb-6">
          <CountrySelect
            id="demo-country"
            label="Country"
            value={selectedCountry}
            onChange={setSelectedCountry}
            required={true}
          />
        </div>
        
        {selectedCountry && (
          <div className="p-4 bg-green-50 rounded-md">
            <p className="font-medium">Selected country: {selectedCountry}</p>
            <p>
              {countries.find(c => c.code === selectedCountry)?.name} 
              {' - '}
              {countries.find(c => c.code === selectedCountry)?.currencyType}
            </p>
          </div>
        )}
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Available Countries</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium mb-2">European Countries (EUR)</h3>
            <ul className="list-disc pl-5 space-y-1">
              {countries
                .filter(c => c.currencyType === 'EUR')
                .map(country => (
                  <li key={country.code}>{country.name} ({country.code})</li>
                ))}
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-medium mb-2">Other Countries (USD)</h3>
            <ul className="list-disc pl-5 space-y-1 columns-1 md:columns-2 lg:columns-3">
              {countries
                .filter(c => c.currencyType === 'USD')
                .map(country => (
                  <li key={country.code}>{country.name} ({country.code})</li>
                ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}