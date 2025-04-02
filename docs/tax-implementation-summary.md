# Tax Implementation Summary

This document provides a concise overview of how tax calculation and display are implemented in our e-commerce application.

## Core Implementation

Our tax processing system follows these key principles:

1. **Country-based Tax Rules**: Tax rates are determined by the customer's country
2. **EU VAT Compliance**: We apply correct VAT rates for all European Union countries
3. **Clear Display**: Tax information is shown with the appropriate local label (e.g., "MwSt." for Germany)
4. **Stripe Integration**: Tax amounts are properly passed to Stripe for payment processing

## Server-Side Tax Processing

### API Endpoint

The main API endpoint for tax processing is:

```
POST /api/create-payment-intent
```

This endpoint accepts the following parameters:
- `amount`: The base amount before tax
- `userId`: The ID of the user making the purchase
- `productId`: The ID of the product being purchased
- `country`: The customer's country (optional, will use user profile if not provided)
- `currency`: The currency to use (optional, will be determined from country if not provided)
- `couponCode`: Any coupon code to apply (optional)
- `state`: US state if applicable (optional)
- `force_country`: Override country for testing (optional, development only)

### Determining Tax Rates

Tax rates are determined by the `getTaxRateForCountry` function:

```javascript
function getTaxRateForCountry(country) {
  // EU VAT rates
  const vatRates = {
    'DE': 0.19, // Germany
    'FR': 0.20, // France
    'IT': 0.22, // Italy
    'ES': 0.21, // Spain
    // ... other EU countries
  };
  
  // Default to 0 for US and countries without defined rates
  return vatRates[country] || 0;
}
```

### Tax Calculation Process

1. **Country Determination**:
   - First check if `force_country` parameter is provided (for testing)
   - Then check country parameter from request
   - Finally fall back to user's profile country
   - Default to 'unknown' if no country information is available

2. **Tax Calculation**:
   ```javascript
   const taxRate = getTaxRateForCountry(country);
   const taxAmount = baseAmount * taxRate;
   const totalAmount = baseAmount + taxAmount;
   ```

3. **Currency Selection**:
   ```javascript
   const currency = getCurrencyForCountry(country);
   ```

4. **Stripe Payment Intent Creation**:
   ```javascript
   const paymentIntent = await stripe.paymentIntents.create({
     amount: Math.round(totalAmount * 100), // Convert to cents
     currency: currency,
     metadata: {
       tax_country: country,
       tax_rate: taxRate,
       tax_amount: taxAmount,
       base_amount: baseAmount
     }
   });
   ```

## Client-Side Tax Display

On the client side, taxes are displayed with the appropriate local label:

```javascript
function getTaxLabel(country, taxRate) {
  const taxLabels = {
    'DE': `MwSt. (${(taxRate * 100).toFixed(0)}%)`,
    'FR': `TVA (${(taxRate * 100).toFixed(0)}%)`,
    'IT': `IVA (${(taxRate * 100).toFixed(0)}%)`,
    'ES': `IVA (${(taxRate * 100).toFixed(0)}%)`,
    'US': 'No Sales Tax'
  };
  
  return taxLabels[country] || 'Tax';
}
```

This is shown on the checkout page along with the base price and total amount.

## Testing Tools

We've created several tools to verify tax calculations:

1. **Direct Tax Logic Tests**:
   - `tax-direct-test.js` - Tests the tax calculation logic directly
   - `tax-direct-test.cjs` - CommonJS version for Node.js environments

2. **API Integration Tests**:
   - `tax-live-test.js` - Tests the full API integration
   - `api-test.js` - Tests specific API endpoints

3. **Stripe Verification**:
   - `stripe-tax-verification.js` - Verifies that Stripe receives the correct tax amounts
   - `stripe-tax-debug.js` - Helps debug Stripe tax-related issues

## Validation and Verification

Every tax calculation is validated to ensure:
1. The correct tax rate is applied based on the customer's country
2. The tax amount is calculated correctly
3. The total amount (base + tax) is passed to Stripe
4. The appropriate tax label is displayed to the customer

## Mobile App Integration

For the Progressive Web App in Google Play, tax information is displayed consistently across all platforms. The tax calculation logic is identical between web and mobile versions, ensuring a seamless experience.

## Further Reference

For more detailed information, see:
- `docs/tax-rates.md` - Comprehensive list of tax rates by country
- `docs/playstore-setup.md` - Mobile app configuration including tax display