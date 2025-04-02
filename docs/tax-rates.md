# Tax Rates by Country

This document outlines the tax rates used in our e-commerce application for different countries, particularly focusing on the European Union VAT rates and how they are implemented in our system.

## Overview

The application automatically applies the appropriate tax rate based on the customer's country. For EU countries, VAT is added to the product price. For the US and other non-EU countries, no tax is added.

## European Union VAT Rates

| Country | Country Code | VAT Rate | Local Name | Implementation |
|---------|--------------|----------|------------|----------------|
| Germany | DE | 19% | MwSt. (Mehrwertsteuer) | Added to product price |
| France | FR | 20% | TVA (Taxe sur la Valeur Ajoutée) | Added to product price |
| Italy | IT | 22% | IVA (Imposta sul Valore Aggiunto) | Added to product price |
| Spain | ES | 21% | IVA (Impuesto sobre el Valor Añadido) | Added to product price |
| Austria | AT | 20% | USt. (Umsatzsteuer) | Added to product price |
| Belgium | BE | 21% | TVA/BTW | Added to product price |
| Bulgaria | BG | 20% | ДДС (DDS) | Added to product price |
| Croatia | HR | 25% | PDV | Added to product price |
| Cyprus | CY | 19% | ΦΠΑ (FPA) | Added to product price |
| Czech Republic | CZ | 21% | DPH | Added to product price |
| Denmark | DK | 25% | MOMS | Added to product price |
| Estonia | EE | 20% | KM | Added to product price |
| Finland | FI | 24% | ALV | Added to product price |
| Greece | GR | 24% | ΦΠΑ (FPA) | Added to product price |
| Hungary | HU | 27% | ÁFA | Added to product price |
| Ireland | IE | 23% | VAT | Added to product price |
| Latvia | LV | 21% | PVN | Added to product price |
| Lithuania | LT | 21% | PVM | Added to product price |
| Luxembourg | LU | 17% | TVA | Added to product price |
| Malta | MT | 18% | VAT | Added to product price |
| Netherlands | NL | 21% | BTW | Added to product price |
| Poland | PL | 23% | PTU/VAT | Added to product price |
| Portugal | PT | 23% | IVA | Added to product price |
| Romania | RO | 19% | TVA | Added to product price |
| Slovakia | SK | 20% | DPH | Added to product price |
| Slovenia | SI | 22% | DDV | Added to product price |
| Sweden | SE | 25% | MOMS | Added to product price |

## Non-EU Countries

| Country | Country Code | Tax Rate | Notes |
|---------|--------------|----------|-------|
| United States | US | 0% | No federal sales tax applied |
| United Kingdom | GB | 20% | VAT applied similar to EU |
| Switzerland | CH | 7.7% | MWST/TVA/IVA depending on the language region |
| Canada | CA | 5% | GST (Federal); PST/HST varies by province |
| Australia | AU | 10% | GST |
| Japan | JP | 10% | Consumption Tax |

## Implementation Details

### How Taxes Are Applied

1. The customer's country is determined through:
   - User profile settings
   - Session data
   - API request parameters (for testing with `force_country`)

2. The appropriate tax rate is retrieved based on the country code:
   ```javascript
   function getTaxRateForCountry(country) {
     const taxRates = {
       'DE': 0.19,
       'FR': 0.20,
       'IT': 0.22,
       'ES': 0.21,
       // ... other countries
       'US': 0
     };
     return taxRates[country] || 0;
   }
   ```

3. The tax amount is calculated:
   ```javascript
   function calculateTax(amount, country) {
     const taxRate = getTaxRateForCountry(country);
     return amount * taxRate;
   }
   ```

4. The tax amount is displayed separately on the checkout page with the appropriate label:
   ```javascript
   function getTaxLabel(country, taxRate) {
     const labels = {
       'DE': `MwSt. (${(taxRate * 100).toFixed(0)}%)`,
       'FR': `TVA (${(taxRate * 100).toFixed(0)}%)`,
       'IT': `IVA (${(taxRate * 100).toFixed(0)}%)`,
       'ES': `IVA (${(taxRate * 100).toFixed(0)}%)`,
       // ... other countries
       'US': 'No Sales Tax'
     };
     return labels[country] || 'Tax';
   }
   ```

### Currency Selection Based on Country

The application also selects the appropriate currency based on the customer's country:

- For EU countries: EUR (€)
- For US and most other countries: USD ($)

```javascript
function getCurrencyForCountry(country) {
  return isEUCountry(country) ? 'eur' : 'usd';
}

function isEUCountry(country) {
  const euCountries = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE'];
  return euCountries.includes(country);
}
```

## Testing Tax Calculations

To test tax calculations for different countries, you can:

1. Create test users with different country settings
2. Use the API endpoint with the `force_country` parameter
3. Use the tax testing scripts in the project root:
   - `node tax-direct-test.js` - Tests tax calculation logic directly
   - `node tax-live-test.js [country]` - Tests live API calculations

## References

- [European Commission - VAT rates](https://ec.europa.eu/taxation_customs/business/vat/eu-vat-rules-topic/vat-rates_en)
- [OECD Tax Database](https://www.oecd.org/tax/tax-policy/tax-database/)