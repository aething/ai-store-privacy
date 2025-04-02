import { Request, Response } from 'express';
import Stripe from 'stripe';
import { calculateTaxRate } from '../shared/tax';
import { storage } from './storage';

// Инициализируем Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
  telemetry: false
});

/**
 * Обработчик для создания payment intent с налоговой информацией
 * Этот маршрут специально создан для демонстрации и отладки налоговой информации
 */
export async function createPaymentIntentWithTaxInfo(req: Request, res: Response) {
  try {
    const { amount, currency = 'usd', country = 'unknown', productId, userId } = req.body;
    
    if (!amount || !productId || !userId) {
      return res.status(400).json({ error: 'Missing required fields: amount, productId, userId' });
    }
    
    console.log(`Creating PaymentIntent for amount: ${amount} ${currency}`);
    
    // Применяем налоговую ставку на основе страны
    const { rate: taxRate, label: taxLabel } = calculateTaxRate(country);
    const taxAmount = Math.round(amount * taxRate);
    const totalAmount = amount + taxAmount;
    
    console.log(`New total amount with tax: ${totalAmount} ${currency} (base: ${amount}, tax: ${taxAmount})`);
    
    // Для ЕС стран добавляем информацию о НДС
    if (taxRate > 0) {
      if (country === 'DE') {
        console.log(`Applied German VAT: ${taxAmount} ${currency}`);
      } else if (country === 'FR') {
        console.log(`Applied French TVA: ${taxAmount} ${currency}`);
      } else if (country === 'IT') {
        console.log(`Applied Italian IVA: ${taxAmount} ${currency}`);
      } else if (country === 'ES') {
        console.log(`Applied Spanish IVA: ${taxAmount} ${currency}`);
      } else {
        console.log(`Applied tax for ${country}: ${taxAmount} ${currency}`);
      }
    }
    
    // Записываем информацию о налогах в метаданные
    const taxMetadata = {
      country: country || null,
      taxRate,
      taxLabel,
      taxRateId: null,
      product_price: amount,
      metadata: JSON.stringify({
        userId: userId.toString(),
        productId: productId.toString(),
        currency,
        country,
      }),
    };
    
    // Создаем объект платежного намерения для логирования
    const paymentIntentObject = {
      amount,
      currency,
      country,
      tax_behavior: 'exclusive',
      tax_rate_applied: false,
      tax_details: taxMetadata,
    };
    
    console.log('Creating PaymentIntent:', paymentIntentObject);
    
    // Создаем Payment Intent в Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency,
      payment_method_types: ['card'], // Добавляем тип платежного метода
      metadata: {
        userId: userId.toString(),
        productId: productId.toString(),
        taxRate: taxRate.toString(),
        taxAmount: taxAmount.toString(),
      }
    });
    
    console.log(`Created PaymentIntent: ${paymentIntent.id} with amount: ${totalAmount} ${currency} (including tax: ${taxAmount} ${currency})`);
    
    // Создаем заказ
    const order = await storage.createOrder({
      userId: Number(userId), 
      productId: Number(productId),
      amount: totalAmount,
      currency,
      status: 'pending',
      paymentIntentId: paymentIntent.id
    });
    
    // Отправляем ответ клиенту с информацией о налогах
    return res.json({
      clientSecret: `${paymentIntent.id}_secret_smNuigr2KDCjZqtjOAFMehoBs`, // Фиктивный client secret для демо
      orderId: order.id,
      tax: {
        amount: taxAmount,
        rate: taxRate,
        label: taxLabel,
        display: taxLabel
      }
    });
    
  } catch (error: any) {
    console.error('Error creating payment intent:', error.message);
    return res.status(500).json({ error: error.message });
  }
}