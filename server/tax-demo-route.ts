/**
 * Маршрутизатор для демонстрации расчета налогов
 * Отображает статическую HTML страницу с формой для выбора страны и продукта
 */
import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { storage } from "./storage";

const router = Router();

// Функция для определения НДС по стране
function getTaxRateForCountry(country: string) {
  // Для США - нет налога (пороги nexus не достигнуты)
  if (country === 'US') {
    return { rate: 0, label: 'No Sales Tax' };
  }
  
  // Ставки НДС для стран ЕС
  const euVatRates: Record<string, { rate: number; label: string }> = {
    'AT': { rate: 0.20, label: 'MwSt. 20%' }, // Австрия
    'BE': { rate: 0.21, label: 'BTW 21%' },   // Бельгия
    'BG': { rate: 0.20, label: 'ДДС 20%' },   // Болгария
    'HR': { rate: 0.25, label: 'PDV 25%' },   // Хорватия
    'CY': { rate: 0.19, label: 'ΦΠΑ 19%' },   // Кипр
    'CZ': { rate: 0.21, label: 'DPH 21%' },   // Чехия
    'DK': { rate: 0.25, label: 'MOMS 25%' },  // Дания
    'EE': { rate: 0.20, label: 'KM 20%' },    // Эстония
    'FI': { rate: 0.24, label: 'ALV 24%' },   // Финляндия
    'FR': { rate: 0.20, label: 'TVA 20%' },   // Франция
    'DE': { rate: 0.19, label: 'MwSt. 19%' }, // Германия
    'GR': { rate: 0.24, label: 'ΦΠΑ 24%' },   // Греция
    'HU': { rate: 0.27, label: 'ÁFA 27%' },   // Венгрия
    'IE': { rate: 0.23, label: 'VAT 23%' },   // Ирландия
    'IT': { rate: 0.22, label: 'IVA 22%' },   // Италия
    'LV': { rate: 0.21, label: 'PVN 21%' },   // Латвия
    'LT': { rate: 0.21, label: 'PVM 21%' },   // Литва
    'LU': { rate: 0.17, label: 'TVA 17%' },   // Люксембург
    'MT': { rate: 0.18, label: 'VAT 18%' },   // Мальта
    'NL': { rate: 0.21, label: 'BTW 21%' },   // Нидерланды
    'PL': { rate: 0.23, label: 'VAT 23%' },   // Польша
    'PT': { rate: 0.23, label: 'IVA 23%' },   // Португалия
    'RO': { rate: 0.19, label: 'TVA 19%' },   // Румыния
    'SK': { rate: 0.20, label: 'DPH 20%' },   // Словакия
    'SI': { rate: 0.22, label: 'DDV 22%' },   // Словения
    'ES': { rate: 0.21, label: 'IVA 21%' },   // Испания
    'SE': { rate: 0.25, label: 'MOMS 25%' },  // Швеция
    'GB': { rate: 0.20, label: 'VAT 20%' },   // Великобритания
  };
  
  return euVatRates[country] || { rate: 0, label: 'No VAT/Tax' };
}

// Функция для форматирования цены
function formatPrice(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  });
  
  return formatter.format(amount / 100);
}

// Страница демонстрации расчета налогов
router.get("/tax-demo", async (req: Request, res: Response) => {
  try {
    // Получаем все продукты из хранилища
    const products = await storage.getAllProducts();

    // Генерируем HTML-страницу с формой для выбора страны и продукта
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tax Calculation Demo</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        h1, h2, h3 {
          color: #2563eb;
        }
        .demo-box {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        select, input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
        }
        button {
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 15px;
          cursor: pointer;
          font-weight: 500;
        }
        button:hover {
          background-color: #1d4ed8;
        }
        .result {
          margin-top: 20px;
          padding: 15px;
          background-color: #f9fafb;
          border-radius: 4px;
          display: none;
        }
        .tax-line {
          background-color: #fff7ed;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
          border-left: 3px solid #f59e0b;
        }
        .total-line {
          background-color: #ecfdf5;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
          border-left: 3px solid #10b981;
          font-weight: 600;
        }
        .hidden {
          display: none;
        }
        .debug-info {
          margin-top: 20px;
          padding: 10px;
          background-color: #f1f5f9;
          border-radius: 4px;
          font-size: 0.85em;
          color: #64748b;
        }
        .country-badge {
          display: inline-block;
          padding: 2px 6px;
          background-color: #dbeafe;
          color: #2563eb;
          border-radius: 4px;
          margin-left: 5px;
          font-size: 0.85em;
          font-weight: 600;
        }
        .return-btn {
          background-color: #6b7280;
          margin-top: 20px;
        }
        .return-btn:hover {
          background-color: #4b5563;
        }
      </style>
    </head>
    <body>
      <h1>Демонстрация расчета налогов</h1>
      <p>На этой странице вы можете проверить, как работает расчет налогов в зависимости от продукта и страны покупателя.</p>
      
      <div class="demo-box">
        <h2>Калькулятор налогов</h2>
        
        <div class="form-group">
          <label for="product">Выберите продукт:</label>
          <select id="product">
            ${products.map(p => `<option value="${p.id}" data-price-usd="${p.price}" data-price-eur="${p.priceEUR || p.price}">${p.title} - USD: $${p.price/100}, EUR: €${(p.priceEUR || p.price)/100}</option>`).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label for="country">Выберите страну:</label>
          <select id="country">
            <optgroup label="Европейский Союз">
              <option value="AT">Австрия</option>
              <option value="BE">Бельгия</option>
              <option value="BG">Болгария</option>
              <option value="HR">Хорватия</option>
              <option value="CY">Кипр</option>
              <option value="CZ">Чехия</option>
              <option value="DK">Дания</option>
              <option value="EE">Эстония</option>
              <option value="FI">Финляндия</option>
              <option value="FR">Франция</option>
              <option value="DE" selected>Германия</option>
              <option value="GR">Греция</option>
              <option value="HU">Венгрия</option>
              <option value="IE">Ирландия</option>
              <option value="IT">Италия</option>
              <option value="LV">Латвия</option>
              <option value="LT">Литва</option>
              <option value="LU">Люксембург</option>
              <option value="MT">Мальта</option>
              <option value="NL">Нидерланды</option>
              <option value="PL">Польша</option>
              <option value="PT">Португалия</option>
              <option value="RO">Румыния</option>
              <option value="SK">Словакия</option>
              <option value="SI">Словения</option>
              <option value="ES">Испания</option>
              <option value="SE">Швеция</option>
            </optgroup>
            <optgroup label="Другие страны">
              <option value="GB">Великобритания</option>
              <option value="US">США</option>
              <option value="CA">Канада</option>
              <option value="JP">Япония</option>
            </optgroup>
          </select>
        </div>
        
        <button id="calculate-btn">Рассчитать налог</button>
        
        <div id="result" class="result">
          <h3>Результат расчета:</h3>
          <div id="price-line">Базовая цена: <span id="base-price"></span></div>
          <div id="tax-line" class="tax-line">
            <span id="tax-label"></span> <span class="country-badge" id="country-code"></span>: <span id="tax-amount"></span>
          </div>
          <div id="total-line" class="total-line">Итого с налогом: <span id="total-price"></span></div>
          
          <div class="debug-info">
            <div>Страна: <span id="debug-country"></span></div>
            <div>Ставка налога: <span id="debug-rate"></span></div>
            <div>Метка налога: <span id="debug-label"></span></div>
            <div>Базовая цена: <span id="debug-base"></span></div>
            <div>Сумма налога: <span id="debug-tax"></span></div>
            <div>Итоговая сумма: <span id="debug-total"></span></div>
          </div>
        </div>
      </div>
      
      <div class="demo-box">
        <h2>Детали работы системы налогообложения</h2>
        <p>Данная демонстрация показывает, как работает система расчета налогов в e-commerce приложении:</p>
        <ol>
          <li><strong>Определение страны покупателя</strong> - в реальном приложении происходит автоматически на основе IP или данных пользователя</li>
          <li><strong>Выбор валюты</strong> - EUR для стран ЕС, USD для остальных стран</li>
          <li><strong>Расчет ставки налога</strong> - зависит от страны покупателя:</li>
            <ul>
              <li>Для стран ЕС - местная ставка НДС (от 17% до 27%)</li>
              <li>Для США - нет налога, пока не достигнуты пороги nexus по штатам</li>
              <li>Для других стран - обычно нет налога</li>
            </ul>
          <li><strong>Отображение в интерфейсе</strong> - налог отображается отдельной строкой для прозрачности</li>
        </ol>
        
        <p>При выполнении реальной покупки информация о налогах передается в Stripe при создании PaymentIntent.</p>
      </div>
      
      <button class="return-btn" onclick="window.location.href='/'">Вернуться на главную</button>
      
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const calculateBtn = document.getElementById('calculate-btn');
          const resultDiv = document.getElementById('result');
          
          calculateBtn.addEventListener('click', function() {
            // Получаем выбранные значения
            const productSelect = document.getElementById('product');
            const countrySelect = document.getElementById('country');
            
            const productId = productSelect.value;
            const country = countrySelect.value;
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            
            // Определяем валюту на основе страны
            const isEuroCountry = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 
                                  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 
                                  'SI', 'ES', 'SE'].includes(country);
            
            const currency = isEuroCountry ? 'eur' : 'usd';
            
            // Получаем базовую цену из атрибутов data-
            let basePrice = currency === 'eur' 
                ? parseInt(selectedOption.getAttribute('data-price-eur')) 
                : parseInt(selectedOption.getAttribute('data-price-usd'));
            
            // Определяем ставку налога в зависимости от страны
            let taxRate = 0;
            let taxLabel = 'No Tax';
            
            // Для стран ЕС
            if (isEuroCountry) {
              const euVatRates = {
                'AT': { rate: 0.20, label: 'MwSt. 20%' },
                'BE': { rate: 0.21, label: 'BTW 21%' },
                'BG': { rate: 0.20, label: 'ДДС 20%' },
                'HR': { rate: 0.25, label: 'PDV 25%' },
                'CY': { rate: 0.19, label: 'ΦΠΑ 19%' },
                'CZ': { rate: 0.21, label: 'DPH 21%' },
                'DK': { rate: 0.25, label: 'MOMS 25%' },
                'EE': { rate: 0.20, label: 'KM 20%' },
                'FI': { rate: 0.24, label: 'ALV 24%' },
                'FR': { rate: 0.20, label: 'TVA 20%' },
                'DE': { rate: 0.19, label: 'MwSt. 19%' },
                'GR': { rate: 0.24, label: 'ΦΠΑ 24%' },
                'HU': { rate: 0.27, label: 'ÁFA 27%' },
                'IE': { rate: 0.23, label: 'VAT 23%' },
                'IT': { rate: 0.22, label: 'IVA 22%' },
                'LV': { rate: 0.21, label: 'PVN 21%' },
                'LT': { rate: 0.21, label: 'PVM 21%' },
                'LU': { rate: 0.17, label: 'TVA 17%' },
                'MT': { rate: 0.18, label: 'VAT 18%' },
                'NL': { rate: 0.21, label: 'BTW 21%' },
                'PL': { rate: 0.23, label: 'VAT 23%' },
                'PT': { rate: 0.23, label: 'IVA 23%' },
                'RO': { rate: 0.19, label: 'TVA 19%' },
                'SK': { rate: 0.20, label: 'DPH 20%' },
                'SI': { rate: 0.22, label: 'DDV 22%' },
                'ES': { rate: 0.21, label: 'IVA 21%' },
                'SE': { rate: 0.25, label: 'MOMS 25%' }
              };
              
              if (euVatRates[country]) {
                taxRate = euVatRates[country].rate;
                taxLabel = euVatRates[country].label;
              }
            } else if (country === 'GB') {
              // Великобритания больше не в ЕС, но у них свой VAT
              taxRate = 0.20;
              taxLabel = 'VAT 20%';
            } else if (country === 'US') {
              // Для США - нет налога (пороги nexus не достигнуты)
              taxRate = 0;
              taxLabel = 'No Sales Tax';
            }
            
            // Расчет налога
            const taxAmount = Math.round(basePrice * taxRate);
            const totalAmount = basePrice + taxAmount;
            
            // Форматирование для отображения
            const formatter = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency === 'eur' ? 'EUR' : 'USD',
              minimumFractionDigits: 2,
            });
            
            // Отображаем результаты
            document.getElementById('base-price').textContent = formatter.format(basePrice / 100);
            document.getElementById('tax-label').textContent = taxLabel;
            document.getElementById('country-code').textContent = country;
            document.getElementById('tax-amount').textContent = formatter.format(taxAmount / 100);
            document.getElementById('total-price').textContent = formatter.format(totalAmount / 100);
            
            // Заполняем отладочную информацию
            document.getElementById('debug-country').textContent = country;
            document.getElementById('debug-rate').textContent = (taxRate * 100).toFixed(2) + '%';
            document.getElementById('debug-label').textContent = taxLabel;
            document.getElementById('debug-base').textContent = formatter.format(basePrice / 100);
            document.getElementById('debug-tax').textContent = formatter.format(taxAmount / 100);
            document.getElementById('debug-total').textContent = formatter.format(totalAmount / 100);
            
            // Показываем результат
            resultDiv.style.display = 'block';
            
            // Скрываем строку с налогом, если его нет
            const taxLine = document.getElementById('tax-line');
            if (taxAmount === 0) {
              taxLine.style.display = 'none';
            } else {
              taxLine.style.display = 'block';
            }
          });
        });
      </script>
    </body>
    </html>
    `;

    res.send(html);
  } catch (error) {
    console.error("Error in tax-demo route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API для расчета налогов - проверка расчетов на сервере
router.post("/api/calculate-tax", async (req: Request, res: Response) => {
  try {
    const { country, amount, currency } = req.body;
    
    if (!country || !amount || !currency) {
      return res.status(400).json({ message: "Country, amount, and currency are required" });
    }
    
    // Расчет налога
    const { rate, label } = getTaxRateForCountry(country);
    const taxAmount = Math.round(amount * rate);
    const totalAmount = amount + taxAmount;
    
    // Возвращаем результаты
    res.json({
      baseAmount: amount,
      taxRate: rate,
      taxLabel: label,
      taxAmount,
      totalAmount,
      country,
      currency,
      formattedBase: formatPrice(amount, currency),
      formattedTax: formatPrice(taxAmount, currency),
      formattedTotal: formatPrice(totalAmount, currency)
    });
  } catch (error) {
    console.error("Error calculating tax:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API для создания тестового PaymentIntent - позволяет увидеть налоги в реальном PaymentIntent
router.post("/api/test-payment-intent", async (req: Request, res: Response) => {
  try {
    const { country, productId } = req.body;
    
    if (!country || !productId) {
      return res.status(400).json({ message: "Country and productId are required" });
    }
    
    // Получаем продукт
    const product = await storage.getProduct(parseInt(productId));
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Определяем валюту на основе страны
    const isEuroCountry = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 
                          'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 
                          'SI', 'ES', 'SE'].includes(country);
    
    const currency = isEuroCountry ? 'eur' : 'usd';
    
    // Берем соответствующую цену
    const amount = currency === 'eur' ? product.priceEUR || product.price : product.price;
    
    // Расчет налога
    const { rate, label } = getTaxRateForCountry(country);
    const taxAmount = Math.round(amount * rate);
    
    // Метаданные для Stripe
    const metadata: Record<string, string> = {
      productId: productId.toString(),
      currency,
      country,
      tax_rate: (rate * 100).toFixed(2) + '%',
      tax_label: label,
      base_amount: amount.toString(),
      tax_amount: taxAmount.toString()
    };
    
    // Инициализируем Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-02-24.acacia', // Используйте последнюю версию API
    });
    
    // Создаем PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount + taxAmount, // Общая сумма с налогом
      currency,
      payment_method_types: ['card'],
      metadata,
      description: `Test Payment Intent for ${product.title} from ${country}`
    });
    
    // Возвращаем информацию о PaymentIntent
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      baseAmount: amount,
      taxAmount,
      currency: paymentIntent.currency,
      taxRate: rate,
      taxLabel: label,
      country,
      product: {
        id: product.id,
        title: product.title,
        price: amount
      }
    });
  } catch (error) {
    console.error("Error creating test payment intent:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;