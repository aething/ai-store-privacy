/**
 * Серверный маршрут для демонстрации расчёта налогов
 * 
 * Этот файл реализует простую HTML-страницу для демонстрации как
 * работает расчёт налогов, без использования React
 */
const express = require('express');
const router = express.Router();

// Функция для получения информации о налоге по стране
function getTaxRate(country) {
  const euVatRates = {
    // Страны ЕС
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
    'US': { rate: 0.00, label: 'No Sales Tax' }, // США
  };
  
  return euVatRates[country] || { rate: 0, label: 'No VAT/Tax' };
}

// Функция для проверки, следует ли использовать евро
function shouldUseEUR(country) {
  const eurCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  
  return eurCountries.includes(country);
}

// Маршрут для страницы с демонстрацией налогов
router.get('/tax-demo', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tax Calculation Demo</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        .header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        .back-button {
          background: #f1f1f1;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          cursor: pointer;
        }
        .card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 20px;
          margin-bottom: 20px;
        }
        .country-selector {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 10px;
          margin-top: 15px;
        }
        .country-button {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        .country-button:hover {
          background: #f5f5f5;
        }
        .country-button.active {
          background: #4338ca;
          color: white;
          border-color: #3730a3;
        }
        .product-info {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        .product-image {
          width: 60px;
          height: 60px;
          background: #e5edff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          color: #4338ca;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        tr.highlight {
          background-color: #fffbeb;
        }
        tr.highlight-green {
          background-color: #ecfdf5;
        }
        td {
          padding: 8px 4px;
        }
        .note {
          background-color: #f3f4f6;
          border-radius: 6px;
          padding: 10px;
          font-size: 14px;
          color: #4b5563;
        }
        .tax-detail {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
          margin-top: 15px;
        }
        .tax-detail h4 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 14px;
          color: #374151;
        }
        .tax-detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .tax-detail-row span:last-child {
          font-weight: 500;
        }
        .debug-info {
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px dashed #ddd;
          font-size: 12px;
          color: #6b7280;
        }
        .country-tag {
          display: inline-block;
          background: #e0f2fe;
          color: #0369a1;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 6px;
        }
        .explanation {
          background: #eef2ff;
          font-style: italic;
          padding: 8px;
          font-size: 12px;
          color: #4f46e5;
          border-radius: 4px;
          margin: 4px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <button class="back-button" onclick="window.location.href='/'">←</button>
        <h1>Tax Calculation Demo</h1>
      </div>
      
      <div class="card">
        <h2>Select Country</h2>
        <div class="country-selector" id="countrySelector">
          <!-- Страны будут добавлены с помощью JavaScript -->
        </div>
      </div>
      
      <div class="card">
        <div class="product-info">
          <div class="product-image">AI</div>
          <div>
            <h3>AI-Driven Solutions</h3>
            <p>Advanced AI platform with multilingual capabilities</p>
            <span id="product-price" class="price"></span>
          </div>
        </div>
        
        <div style="border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 15px 0;">
          <table>
            <tr>
              <td>Subtotal</td>
              <td style="text-align: right;" id="base-price"></td>
            </tr>
            <tr class="highlight">
              <td>
                <span id="tax-label"></span>
                <span class="country-tag" id="country-code"></span>
              </td>
              <td style="text-align: right;" id="tax-amount"></td>
            </tr>
            <tr>
              <td colspan="2" class="explanation" id="tax-explanation"></td>
            </tr>
            <tr>
              <td>Shipping</td>
              <td style="text-align: right;">Free</td>
            </tr>
            <tr class="highlight-green" style="font-weight: bold; font-size: 1.1em;">
              <td style="border-top: 1px solid #ddd; padding-top: 10px;">Total</td>
              <td style="text-align: right; border-top: 1px solid #ddd; padding-top: 10px;" id="total-price"></td>
            </tr>
          </table>
          
          <div class="tax-detail">
            <h4>Tax Details</h4>
            <div class="tax-detail-row">
              <span>Country:</span>
              <span id="detail-country"></span>
            </div>
            <div class="tax-detail-row">
              <span>Tax Rate:</span>
              <span id="detail-rate"></span>
            </div>
            <div class="tax-detail-row">
              <span>Base Amount:</span>
              <span id="detail-base"></span>
            </div>
            <div class="tax-detail-row">
              <span>Tax Amount:</span>
              <span id="detail-tax"></span>
            </div>
            <div class="tax-detail-row">
              <span>Total:</span>
              <span id="detail-total"></span>
            </div>
            
            <div class="debug-info">
              <div>Country: <span id="debug-country"></span></div>
              <div>Tax Rate: <span id="debug-rate"></span></div>
              <div>Tax Label: <span id="debug-label"></span></div>
              <div>Currency: <span id="debug-currency"></span></div>
            </div>
          </div>
        </div>
        
        <div class="note" style="margin-top: 20px;">
          <p><strong>Note:</strong> This is a standalone demo page that shows accurate tax calculations without requiring authentication.</p>
          <p>It demonstrates the tax calculation logic for different countries and currencies.</p>
        </div>
      </div>
      
      <script>
        // Страны для выбора
        const countries = [
          { code: 'DE', name: 'Germany' },
          { code: 'FR', name: 'France' },
          { code: 'IT', name: 'Italy' },
          { code: 'ES', name: 'Spain' },
          { code: 'HU', name: 'Hungary' },
          { code: 'US', name: 'United States' },
          { code: 'GB', name: 'United Kingdom' }
        ];
        
        // Функция для получения информации о налогах
        function getTaxInfo(country) {
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
            'SE': { rate: 0.25, label: 'MOMS 25%' },
            'GB': { rate: 0.20, label: 'VAT 20%' },
            'US': { rate: 0.00, label: 'No Sales Tax' },
          };
          
          return euVatRates[country] || { rate: 0, label: 'No VAT/Tax' };
        }
        
        // Функция для проверки, в каких странах используется евро
        function shouldUseEUR(country) {
          const eurCountries = [
            'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
            'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
            'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
          ];
          
          return eurCountries.includes(country);
        }
        
        // Базовые цены для продукта
        const prices = {
          'eur': 276000, // 2760 EUR в центах
          'usd': 284500  // 2845 USD в центах
        };
        
        // Функция для обновления информации о налогах на странице
        function updateTaxInfo(country) {
          // Определяем валюту на основе страны
          const currency = shouldUseEUR(country) ? 'eur' : 'usd';
          
          // Получаем информацию о налоге для выбранной страны
          const { rate: taxRate, label: taxLabel } = getTaxInfo(country);
          
          // Получаем базовую цену в зависимости от валюты
          const basePrice = prices[currency];
          
          // Рассчитываем налог
          const taxAmount = Math.round(basePrice * taxRate);
          
          // Рассчитываем общую сумму
          const totalAmount = basePrice + taxAmount;
          
          // Определяем пояснительный текст для налогов
          let taxExplanation = '';
          if (country === 'DE') {
            taxExplanation = '* Prices exclude VAT (19%), which is added at checkout';
          } else if (country === 'US') {
            taxExplanation = '* No sales tax is applied (nexus thresholds not reached)';
          } else {
            taxExplanation = '* Tax rates are calculated based on your location';
          }
          
          // Обновляем текст объяснения
          document.getElementById('tax-explanation').textContent = taxExplanation;
          
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
          document.getElementById('debug-currency').textContent = currency.toUpperCase();
          
          // Заполняем детали
          document.getElementById('detail-country').textContent = country;
          document.getElementById('detail-rate').textContent = (taxRate * 100).toFixed(2) + '%';
          document.getElementById('detail-base').textContent = formatter.format(basePrice / 100);
          document.getElementById('detail-tax').textContent = formatter.format(taxAmount / 100);
          document.getElementById('detail-total').textContent = formatter.format(totalAmount / 100);
          
          // Обновляем цену продукта
          document.getElementById('product-price').textContent = formatter.format(basePrice / 100);
        }
        
        // Генерируем кнопки стран
        const countrySelectorDiv = document.getElementById('countrySelector');
        countries.forEach(country => {
          const button = document.createElement('button');
          button.className = 'country-button';
          button.textContent = country.name;
          button.setAttribute('data-country', country.code);
          
          // Устанавливаем обработчик
          button.addEventListener('click', function() {
            // Удаляем активный класс со всех кнопок
            document.querySelectorAll('.country-button').forEach(btn => {
              btn.classList.remove('active');
            });
            
            // Добавляем активный класс к выбранной кнопке
            this.classList.add('active');
            
            // Обновляем информацию о налогах
            updateTaxInfo(country.code);
          });
          
          countrySelectorDiv.appendChild(button);
        });
        
        // По умолчанию выбираем Германию
        document.querySelector('[data-country="DE"]').classList.add('active');
        updateTaxInfo('DE');
      </script>
    </body>
    </html>
  `);
});

module.exports = router;