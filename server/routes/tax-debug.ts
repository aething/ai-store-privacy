/**
 * Маршруты для отладки расчета налогов
 */
import { Router } from 'express';
import { isEUCountry, getTaxRateForCountry, shouldUseEUR } from '../../shared/tax';
import Stripe from 'stripe';

const router = Router();

/**
 * Простой эндпоинт для расчета налогов по стране и сумме
 * GET /api/tax-debug/calculate?amount=1000&country=DE
 * POST /api/tax-debug/calculate с телом {amount: 1000, country: 'DE', currency: 'eur'}
 */
router.get('/calculate', (req, res) => {
  try {
    const amount = parseInt(req.query.amount as string) || 1000;
    const country = (req.query.country as string) || 'DE';
    
    const isEU = isEUCountry(country);
    const taxRate = getTaxRateForCountry(country);
    const currency = shouldUseEUR(country) ? 'eur' : 'usd';
    
    // Рассчитываем сумму налога
    const taxAmount = Math.round(amount * taxRate);
    const total = amount + taxAmount;
    
    // Определяем название налога
    let taxLabel = 'Tax';
    if (isEU) {
      taxLabel = `VAT (${(taxRate * 100).toFixed(0)}%)`;
    } else if (country === 'US') {
      taxLabel = 'Sales Tax';
    }
    
    res.json({
      amount,
      country,
      currency,
      taxRate,
      taxAmount,
      taxLabel,
      total,
      isEU
    });
  } catch (error: any) {
    console.error('Error in tax calculation:', error);
    res.status(500).json({ 
      error: 'Failed to calculate tax',
      message: error.message
    });
  }
});

/**
 * POST версия эндпоинта для расчета налогов
 * Позволяет передавать параметры в теле запроса
 */
router.post('/calculate', (req, res) => {
  try {
    const amount = req.body.amount || 1000;
    const country = req.body.country || 'DE';
    const requestedCurrency = req.body.currency;
    
    const isEU = isEUCountry(country);
    const taxRate = getTaxRateForCountry(country);
    
    // Определяем валюту: используем переданную в запросе или определяем по стране
    const currency = requestedCurrency || (shouldUseEUR(country) ? 'eur' : 'usd');
    
    // Рассчитываем сумму налога
    const taxAmount = Math.round(amount * taxRate);
    const totalAmount = amount + taxAmount;
    
    // Определяем название налога
    let taxLabel = 'Tax';
    if (isEU) {
      taxLabel = `VAT (${(taxRate * 100).toFixed(0)}%)`;
    } else if (country === 'US') {
      taxLabel = 'Sales Tax';
    }
    
    console.log(`[Tax Debug] Расчет налога: страна ${country}, сумма ${amount} ${currency}, ставка ${taxRate * 100}%, налог ${taxAmount}`);
    
    res.json({
      amount,
      country,
      currency,
      taxRate,
      taxAmount,
      taxLabel,
      totalAmount,
      taxInclusive: false,
      isEU
    });
  } catch (error: any) {
    console.error('Error in tax calculation (POST):', error);
    res.status(500).json({ 
      error: 'Failed to calculate tax',
      message: error.message
    });
  }
});

/**
 * Тестирование функции для проверки, является ли страна частью ЕС
 * GET /api/tax-debug/is-eu?country=DE
 */
router.get('/is-eu', (req, res) => {
  const country = (req.query.country as string) || 'DE';
  const isEU = isEUCountry(country);
  res.json({ country, isEU });
});

/**
 * Тестирование функции для получения налоговой ставки по стране
 * GET /api/tax-debug/tax-rate?country=DE
 */
router.get('/tax-rate', (req, res) => {
  const country = (req.query.country as string) || 'DE';
  const taxRate = getTaxRateForCountry(country);
  res.json({ country, taxRate: taxRate * 100 });
});

/**
 * Тестирование функции для определения валюты
 * GET /api/tax-debug/currency?country=DE
 */
router.get('/currency', (req, res) => {
  const country = (req.query.country as string) || 'DE';
  const useEUR = shouldUseEUR(country);
  const currency = useEUR ? 'EUR' : 'USD';
  res.json({ country, currency });
});

/**
 * Создание тестового PaymentIntent с включенной налоговой информацией
 * POST /api/tax-debug/create-payment-intent
 * Тело запроса: {
 *   amount: number,
 *   country: string (код страны),
 *   currency?: string (по умолчанию определяется по стране)
 * }
 */
router.post('/create-payment-intent', async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe secret key is not configured' });
    }

    const amount = req.body.amount || 1000; // сумма в минимальных единицах (центы)
    const country = req.body.country || 'DE'; // страна по умолчанию - Германия
    
    // Определяем валюту по стране (EUR для стран ЕС, USD для остальных)
    const currency = req.body.currency || (shouldUseEUR(country) ? 'eur' : 'usd');
    
    // Рассчитываем налог
    const taxRate = getTaxRateForCountry(country);
    const taxAmount = Math.round(amount * taxRate);
    
    // Инициализируем Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      telemetry: false,
    });
    
    // Создаем PaymentIntent с указанием налога как отдельной строки
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount + taxAmount, // сумма с налогом
      currency,
      payment_method_types: ['card'], // обязательный параметр
      metadata: {
        tax_amount: taxAmount.toString(),
        tax_rate: (taxRate * 100).toFixed(2) + '%',
        tax_country: country,
        base_amount: amount.toString(),
        currency
      },
      description: `Test payment with tax for country ${country} (${taxRate * 100}%)`,
    });
    
    // Формируем понятное название налога для отображения
    let taxLabel = 'Tax';
    if (isEUCountry(country)) {
      taxLabel = `VAT (${(taxRate * 100).toFixed(0)}%)`;
    } else if (country === 'US') {
      taxLabel = 'Sales Tax';
    }
    
    // Отправляем ответ с данными для клиента
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      taxAmount,
      taxRate,
      taxLabel,
      total: amount + taxAmount,
      currency,
      country,
      isEU: isEUCountry(country)
    });
  } catch (error: any) {
    console.error('Error creating payment intent with tax:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      message: error.message
    });
  }
});

export default router;