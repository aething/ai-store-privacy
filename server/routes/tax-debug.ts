/**
 * Отладочные маршруты для тестирования расчета налогов
 */

import express, { Router, Request, Response } from 'express';
import { calculateTaxRate } from '../../shared/tax';

const router = Router();

// Создаем отдельный роутер для отладочных API налогов
router.post('/api/tax-debug', (req: Request, res: Response) => {
  const { country } = req.body;
  
  console.log(`[TAX DEBUG] Received country in POST body: ${country}`);
  
  try {
    // Проверяем страну из запроса
    if (!country) {
      return res.status(400).json({
        error: 'Country is required',
        success: false
      });
    }
    
    // Рассчитываем налоговую ставку
    const taxInfo = calculateTaxRate(country);
    
    console.log(`[TAX DEBUG] Calculated tax info for ${country}:`, taxInfo);
    
    // Возвращаем результат
    return res.json({
      country,
      taxInfo,
      success: true
    });
  } catch (error) {
    console.error(`[TAX DEBUG] Error calculating tax for ${country}:`, error);
    return res.status(500).json({
      error: String(error),
      country,
      success: false
    });
  }
});

// GET маршрут для тестирования через URL
router.get('/:country', (req: Request, res: Response) => {
  const { country } = req.params;
  
  console.log(`[TAX DEBUG] Received country in URL: ${country}`);
  
  try {
    // Рассчитываем налоговую ставку
    const taxInfo = calculateTaxRate(country);
    
    console.log(`[TAX DEBUG] Calculated tax info for ${country}:`, taxInfo);
    
    // Возвращаем результат
    return res.json({
      country,
      taxInfo,
      success: true
    });
  } catch (error) {
    console.error(`[TAX DEBUG] Error calculating tax for ${country}:`, error);
    return res.status(500).json({
      error: String(error),
      country,
      success: false
    });
  }
});

// Тестовый маршрут для проверки всех важных стран
router.get('/all', (_req: Request, res: Response) => {
  const countries = ['DE', 'FR', 'IT', 'ES', 'AT', 'BE', 'NL', 'FI', 'GB', 'US'];
  const results: Record<string, any> = {};
  
  try {
    for (const country of countries) {
      results[country] = calculateTaxRate(country);
    }
    
    return res.json({
      results,
      success: true
    });
  } catch (error) {
    console.error('[TAX DEBUG] Error testing all countries:', error);
    return res.status(500).json({
      error: String(error),
      success: false
    });
  }
});

export default router;