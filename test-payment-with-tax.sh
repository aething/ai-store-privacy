#!/bin/bash

# Скрипт для тестирования создания платежа с налогами для разных стран
# Использование: ./test-payment-with-tax.sh [страна] [сумма] [валюта]

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Параметры по умолчанию
DEFAULT_COUNTRY="DE"
DEFAULT_AMOUNT=10000
DEFAULT_CURRENCY="eur"

# Получаем параметры из командной строки или используем значения по умолчанию
COUNTRY=${1:-$DEFAULT_COUNTRY}
AMOUNT=${2:-$DEFAULT_AMOUNT}
CURRENCY=${3:-$DEFAULT_CURRENCY}

# Вспомогательная функция для вывода информации
print_info() {
  echo -e "${BLUE}=== $1 ===${NC}"
}

# Вспомогательная функция для вывода успеха
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Вспомогательная функция для вывода ошибки
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Вспомогательная функция для вывода предупреждения
print_warning() {
  echo -e "${YELLOW}! $1${NC}"
}

# Выводим информацию о запросе
print_info "ТЕСТИРОВАНИЕ ПЛАТЕЖА С НАЛОГОМ"
echo "Страна: $COUNTRY"
echo "Сумма: $AMOUNT"
echo "Валюта: $CURRENCY"
echo ""

# Формируем данные для запроса
JSON_DATA="{
  \"amount\": $AMOUNT,
  \"userId\": 1,
  \"productId\": 1,
  \"currency\": \"$CURRENCY\",
  \"country\": \"$COUNTRY\",
  \"force_country\": true
}"

# Выполняем запрос к API
print_info "ВЫПОЛНЕНИЕ ЗАПРОСА К API"
echo "URL: http://localhost:5000/api/create-payment-intent"
echo "Данные: $JSON_DATA"
echo ""

# Выполняем запрос и сохраняем результат
RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$JSON_DATA" \
  http://localhost:5000/api/create-payment-intent)

# Проверяем, успешно ли выполнен запрос
if [ $? -ne 0 ]; then
  print_error "Ошибка при выполнении запроса"
  exit 1
fi

# Проверяем наличие clientSecret в ответе
if echo "$RESPONSE" | grep -q "clientSecret"; then
  print_success "Запрос успешно выполнен"
else
  print_error "Ошибка в ответе API: $RESPONSE"
  exit 1
fi

# Извлекаем информацию о налоге из ответа
TAX_RATE=$(echo "$RESPONSE" | grep -o '"rate":[0-9.]*' | cut -d ':' -f 2)
TAX_LABEL=$(echo "$RESPONSE" | grep -o '"label":"[^"]*"' | cut -d '"' -f 4)

# Используем jq для более надежного извлечения
if command -v jq &> /dev/null; then
  TAX_AMOUNT=$(echo "$RESPONSE" | jq -r '.tax.amount')
else
  # Резервный метод, если jq не установлен
  TAX_AMOUNT=$(echo "$RESPONSE" | grep -o '"amount":[0-9]*' | head -1 | cut -d ':' -f 2 | tr -d ' ,}')
fi

# Для извлечения общей суммы нам нужно добавить базовую сумму и налог
# Так как API не возвращает общую сумму напрямую
TOTAL_AMOUNT=$(($AMOUNT + $TAX_AMOUNT))

# Выводим результаты
print_info "РЕЗУЛЬТАТЫ"
echo "Налоговая ставка: $TAX_RATE"
echo "Метка налога: $TAX_LABEL"
echo "Сумма налога: $TAX_AMOUNT"
echo "Общая сумма с налогом: $TOTAL_AMOUNT"

# Ожидаемые налоговые ставки по странам (в процентах)
declare -A EXPECTED_RATES
EXPECTED_RATES["DE"]=19
EXPECTED_RATES["FR"]=20
EXPECTED_RATES["IT"]=22
EXPECTED_RATES["ES"]=21
EXPECTED_RATES["AT"]=20
EXPECTED_RATES["BE"]=21
EXPECTED_RATES["GB"]=20
EXPECTED_RATES["US"]=0
EXPECTED_RATES["unknown"]=0

# Проверяем соответствие ожидаемой ставке налога
EXPECTED_RATE=${EXPECTED_RATES[$COUNTRY]}
if [ -z "$EXPECTED_RATE" ]; then
  EXPECTED_RATE=0
  print_warning "Для страны $COUNTRY нет ожидаемой ставки налога. Используем 0%."
fi

# Вычисление без использования bc
EXPECTED_RATE_DECIMAL=$(awk "BEGIN {printf \"%.2f\", $EXPECTED_RATE/100}")
EXPECTED_TAX_AMOUNT=$(awk "BEGIN {printf \"%.0f\", $AMOUNT * $EXPECTED_RATE/100}")
EXPECTED_TOTAL=$(($AMOUNT + $EXPECTED_TAX_AMOUNT))

echo ""
print_info "ПРОВЕРКА"
echo "Ожидаемая ставка налога: ${EXPECTED_RATE}%"
echo "Ожидаемая сумма налога: $EXPECTED_TAX_AMOUNT"
echo "Ожидаемая общая сумма: $EXPECTED_TOTAL"

# Проверяем результаты
if [ $(echo "$TAX_RATE" | awk '{printf "%.2f", $1}') = $(echo "$EXPECTED_RATE_DECIMAL" | awk '{printf "%.2f", $1}') ]; then
  print_success "Налоговая ставка соответствует ожидаемой"
else
  print_error "Налоговая ставка не соответствует ожидаемой ($TAX_RATE вместо $EXPECTED_RATE_DECIMAL)"
fi

if [ "$TAX_AMOUNT" -eq "$EXPECTED_TAX_AMOUNT" ]; then
  print_success "Сумма налога соответствует ожидаемой"
else
  print_error "Сумма налога не соответствует ожидаемой"
fi

if [ "$TOTAL_AMOUNT" -eq "$EXPECTED_TOTAL" ]; then
  print_success "Общая сумма соответствует ожидаемой"
else
  print_error "Общая сумма не соответствует ожидаемой"
fi

echo ""
print_info "ИТОГ"
if [ $(echo "$TAX_RATE" | awk '{printf "%.2f", $1}') = $(echo "$EXPECTED_RATE_DECIMAL" | awk '{printf "%.2f", $1}') ] && 
   [ "$TAX_AMOUNT" -eq "$EXPECTED_TAX_AMOUNT" ] && 
   [ "$TOTAL_AMOUNT" -eq "$EXPECTED_TOTAL" ]; then
  print_success "Тест успешно пройден для страны $COUNTRY"
else
  print_error "Тест не пройден для страны $COUNTRY"
fi