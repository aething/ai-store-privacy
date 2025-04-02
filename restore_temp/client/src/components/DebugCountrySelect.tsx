import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface DebugCountrySelectProps {
  selectedCountry?: string;
  onCountryChange: (country: string) => void;
}

/**
 * Специальный компонент для отладочного режима, позволяющий выбирать страну пользователя
 * В отличие от обычного CountrySelect, этот компонент позволяет изменять страну
 */
const DebugCountrySelect: React.FC<DebugCountrySelectProps> = ({ 
  selectedCountry, 
  onCountryChange 
}) => {
  const countries = [
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'CA', name: 'Canada', currency: 'USD' },
    { code: 'DE', name: 'Germany', currency: 'EUR' },
    { code: 'FR', name: 'France', currency: 'EUR' },
    { code: 'IT', name: 'Italy', currency: 'EUR' },
    { code: 'GB', name: 'United Kingdom', currency: 'USD' },
    { code: 'JP', name: 'Japan', currency: 'USD' },
    { code: 'AU', name: 'Australia', currency: 'USD' },
    { code: 'ES', name: 'Spain', currency: 'EUR' }
  ];

  const [tempCountry, setTempCountry] = React.useState<string | undefined>(selectedCountry);

  // При изменении selectedCountry извне обновляем tempCountry
  React.useEffect(() => {
    setTempCountry(selectedCountry);
  }, [selectedCountry]);

  const handleApplyCountry = () => {
    if (tempCountry) {
      onCountryChange(tempCountry);
    }
  };

  const handleSelectChange = (value: string) => {
    setTempCountry(value);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex gap-2 items-center">
        <Select value={tempCountry} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Выберите страну" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name} ({country.code}) - {country.currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          onClick={handleApplyCountry}
          disabled={!tempCountry || tempCountry === selectedCountry}
        >
          Применить
        </Button>
      </div>
    </div>
  );
};

export default DebugCountrySelect;