#!/bin/bash

# Тестовый скрипт для проверки расчета налогов с корректными параметрами
# Использование: ./test-payment-with-tax.sh [country] [amount]

# Значения по умолчанию
COUNTRY=${1:-"FR"}
AMOUNT=${2:-10000}  # 100.00 евро в центах
USER_ID=1
PRODUCT_ID=1
CURRENCY="eur"

echo "Тестирование создания payment intent с налогом для страны: $COUNTRY"
echo "Сумма: $AMOUNT $CURRENCY"
echo "ID пользователя: $USER_ID"
echo "ID продукта: $PRODUCT_ID"
echo ""

# Вызов API для создания payment intent
curl -X POST http://localhost:5000/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": $AMOUNT,
    \"userId\": \"$USER_ID\",
    \"productId\": \"$PRODUCT_ID\",
    \"currency\": \"$CURRENCY\",
    \"country\": \"$COUNTRY\",
    \"force_country\": true
  }"

echo ""
echo "Проверка расчета налогов через отладочный API:"
echo ""

# Проверка через отладочный API
curl -s "http://localhost:5000/api/tax-debug/$COUNTRY"