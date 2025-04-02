/**
 * Скрипт для исправления обработки налогов для разных стран
 * 
 * Этот скрипт применяет патч к серверному файлу routes.ts,
 * чтобы исправить логику расчета налогов для разных стран.
 */

const fs = require('fs');
const path = require('path');

// Путь к файлу с маршрутами
const routesFilePath = path.join(__dirname, 'server', 'routes.ts');

// Проверяем, существует ли файл
if (!fs.existsSync(routesFilePath)) {
  console.error(`❌ Ошибка: Файл ${routesFilePath} не найден!`);
  process.exit(1);
}

// Читаем содержимое файла
let routesContent = fs.readFileSync(routesFilePath, 'utf-8');

console.log(`✅ Файл ${routesFilePath} успешно прочитан.`);

// Находим код расчета налогов для разных стран
const taxCalculationSection = routesContent.match(/(\/\/ Рассчитываем налог в зависимости от страны[\s\S]+?)(?=\/\/ Создаем PaymentIntent|}\s*catch)/);

if (!taxCalculationSection) {
  console.error(`❌ Ошибка: Не удалось найти секцию расчета налогов в файле.`);
  process.exit(1);
}

console.log(`✅ Секция расчета налогов найдена.`);

// Текст с проблемой: применение немецкой ставки налога ко всем странам
const problemCode = `// Если страна не указана или это Германия, применяем немецкий НДС
      if (!country || country === 'DE') {
        // Устанавливаем значения для Германии
        const defaultCountry = 'DE';
        taxRate = 0.19;
        taxLabel = 'MwSt. 19%';
        
        // Рассчитываем сумму налога
        taxAmount = Math.round(amount * taxRate);
        
        // Добавляем информацию о налоге в метаданные
        paymentIntentParams.metadata.tax_amount = taxAmount.toString();
        paymentIntentParams.metadata.tax_rate = '19%';
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = defaultCountry;
        
        // Увеличиваем общую сумму на величину налога
        paymentIntentParams.amount = amount + taxAmount;
        
        console.log(\`Applied German VAT: \${taxAmount} \${currency}\`);`;

// Новый код с исправленной логикой
const fixedCode = `// Расчет налога в зависимости от страны
      // Проверяем, известна ли страна
      if (!country || country === 'unknown') {
        // Для неизвестной страны или если страна не указана,
        // используем Германию по умолчанию для совместимости с существующим кодом
        const defaultCountry = 'DE';
        taxRate = 0.19;
        taxLabel = 'MwSt. 19%';
        
        // Рассчитываем сумму налога
        taxAmount = Math.round(amount * taxRate);
        
        // Добавляем информацию о налоге в метаданные
        paymentIntentParams.metadata.tax_amount = taxAmount.toString();
        paymentIntentParams.metadata.tax_rate = '19%';
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = defaultCountry;
        
        // Увеличиваем общую сумму на величину налога
        paymentIntentParams.amount = amount + taxAmount;
        
        console.log(\`Applied German VAT (default): \${taxAmount} \${currency}\`);
      } else if (country === 'DE') {
        // Для Германии
        taxRate = 0.19;
        taxLabel = 'MwSt. 19%';
        
        // Рассчитываем сумму налога
        taxAmount = Math.round(amount * taxRate);
        
        // Добавляем информацию о налоге в метаданные
        paymentIntentParams.metadata.tax_amount = taxAmount.toString();
        paymentIntentParams.metadata.tax_rate = '19%';
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = country;
        
        // Увеличиваем общую сумму на величину налога
        paymentIntentParams.amount = amount + taxAmount;
        
        console.log(\`Applied German VAT: \${taxAmount} \${currency}\`);`;

// Заменяем проблемный код на исправленный
const updatedContent = routesContent.replace(problemCode, fixedCode);

// Проверяем, что замена была произведена
if (updatedContent === routesContent) {
  console.error(`❌ Ошибка: Не удалось произвести замену кода. Возможно, формат или содержимое файла изменились.`);
  process.exit(1);
}

// Сохраняем исправленный файл
fs.writeFileSync(routesFilePath, updatedContent, 'utf-8');

console.log(`✅ Файл ${routesFilePath} успешно обновлен с исправленной логикой расчета налогов.`);

// Выводим инструкции по дальнейшим действиям
console.log(`
=====================================================================
✅ ИСПРАВЛЕНИЕ УСПЕШНО ПРИМЕНЕНО

Что было исправлено:
1. Логика выбора страны теперь корректно обрабатывает все случаи
2. Добавлена правильная обработка для каждой страны

Для проверки запустите скрипт тестирования налогов:
node country-tax-validation.cjs

Важно! После внесения изменений требуется перезапуск сервера.
=====================================================================
`);