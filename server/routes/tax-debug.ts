import { Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { calculateTaxRate, getCurrencyForCountry } from '@shared/tax';

// Инициализация клиента Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

/**
 * Простой обработчик для расчета налогов
 * Этот маршрут предназначен для тестирования и дебага
 */
export async function calculateTaxDebug(req: Request, res: Response) {
  try {
    const { amount = 1000, country = 'DE' } = req.query;
    
    // Проверяем параметры
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return res.status(400).json({ error: 'Amount must be a valid number' });
    }
    
    if (typeof country !== 'string') {
      return res.status(400).json({ error: 'Country must be a valid string' });
    }
    
    console.log(`Calculating tax for amount: ${numAmount}, country: ${country}`);
    
    // Рассчитываем налог
    const { rate: taxRate, label: taxLabel } = calculateTaxRate(country);
    const currency = getCurrencyForCountry(country);
    const taxAmount = Math.round(numAmount * taxRate);
    const total = numAmount + taxAmount;
    
    // Формируем ответ
    const result = {
      amount: numAmount,
      currency,
      country,
      taxRate,
      taxAmount,
      taxLabel,
      total,
      isEU: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
        'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
        'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'].includes(country.toUpperCase())
    };
    
    console.log('Tax calculation result:', result);
    
    return res.json(result);
  } catch (error: any) {
    console.error('Error calculating tax:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Обработчик для создания payment intent с налоговой информацией
 * Тестовый маршрут специально для демонстрации расчета налогов
 */
export async function createTaxDebugPaymentIntent(req: Request, res: Response) {
  try {
    const { productId, userId, amount, currency, country } = req.body;

    if (!productId || !userId || !amount || !currency || !country) {
      return res.status(400).json({ 
        error: 'Missing required fields. Please provide productId, userId, amount, currency, and country.' 
      });
    }

    console.log(`Creating PaymentIntent for amount: ${amount} ${currency}`);
    
    // Рассчитываем налог
    const { rate: taxRate, label: taxLabel } = calculateTaxRate(country);
    const taxAmount = Math.round(amount * taxRate);
    const totalAmount = amount + taxAmount;
    
    if (taxAmount > 0) {
      console.log(`New total amount with tax: ${totalAmount} ${currency} (base: ${amount}, tax: ${taxAmount})`);
      console.log(`Applied ${country === 'DE' ? 'German VAT' : 'local tax'}: ${taxAmount} ${currency}`);
    } else {
      console.log(`No tax applied for country: ${country}`);
    }

    // Объект для создания Payment Intent
    const paymentIntentObject = {
      amount: totalAmount,
      currency,
      payment_method_types: ['card'],
      metadata: {
        userId: userId.toString(),
        productId: productId.toString(),
        taxRate: taxRate.toString(),
        taxAmount: taxAmount.toString(),
        taxLabel,
        country
      },
      // Для полноценной интеграции с налогами Stripe можно добавить:
      // tax_behavior: 'exclusive',
      // tax_rate: taxRateId,
    };

    console.log('Creating PaymentIntent:', {
      amount,
      currency,
      country,
      tax_behavior: 'exclusive',
      tax_rate_applied: false,
      tax_details: {
        country,
        taxRate,
        taxLabel,
        taxRateId: null,
        product_price: amount,
        metadata: JSON.stringify({
          userId: userId.toString(),
          productId: productId.toString(),
          currency,
          country
        })
      }
    });
    
    // Создаем Payment Intent в Stripe
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentObject);
    
    console.log(`Created PaymentIntent: ${paymentIntent.id} with amount: ${totalAmount} ${currency} (including tax: ${taxAmount} ${currency})`);
    
    // Создаем заказ
    const order = await db.orders.create({
      userId: Number(userId), 
      productId: Number(productId),
      amount: totalAmount,
      currency,
      status: 'pending',
      paymentIntentId: paymentIntent.id
    });
    
    // Отправляем ответ клиенту с информацией о налогах
    return res.json({
      clientSecret: paymentIntent.client_secret,
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