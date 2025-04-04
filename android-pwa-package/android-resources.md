# Ресурсы для Android-приложения AI Store

## Требования к иконкам

### Адаптивные иконки для Android 8.0 и выше
- foreground.png - 432x432 пикселей (передний план иконки)
- background.png - 432x432 пикселей (фон иконки)

### Стандартные иконки для устаревших версий Android
- hdpi: 72x72 пикселей
- mdpi: 48x48 пикселей
- xhdpi: 96x96 пикселей
- xxhdpi: 144x144 пикселей
- xxxhdpi: 192x192 пикселей

## Требования к скриншотам для Google Play Market

### Телефоны
- Минимум 2 скриншота
- JPEG или 24-bit PNG (без альфа-канала)
- Минимальное разрешение: 320px
- Максимальное разрешение: 3840px
- Соотношение сторон: длина скриншота не более, чем в 2 раза больше ширины

### Планшеты (опционально)
- Минимум 2 скриншота
- JPEG или 24-bit PNG (без альфа-канала)
- Минимальное разрешение: 320px
- Максимальное разрешение: 3840px
- Соотношение сторон: длина скриншота не более, чем в 2 раза больше ширины

## Дополнительные требования

### Графика в Google Play Market
- Значок приложения: 512x512 пикселей
- Баннер в Play Market: 1024x500 пикселей
- Графика для функций приложения: 1024x500 пикселей

### Элементы брендинга
- Цветовая схема бренда для Android приложения:
  - Основной цвет: `#6200ee`
  - Акцентный цвет: `#03dac4`
  - Фоновый цвет: `#ffffff`

## Подготовка скриншотов для публикации

1. Запустите приложение на эмуляторе Android или физическом устройстве
2. Сделайте скриншоты основных экранов:
   - Главный экран
   - Страница продукта
   - Корзина/Оформление заказа
   - Профиль пользователя
   - Страница оплаты
   - Страница успешной оплаты

3. Обработайте скриншоты:
   - Удалите лишние элементы интерфейса системы
   - Убедитесь, что разрешение соответствует требованиям
   - При необходимости добавьте подписи или пояснения

## Пример перемещения иконок в Android проект

После инициализации Android проекта иконки нужно разместить в следующих директориях:

```bash
# Адаптивные иконки
cp foreground.png android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_foreground.png
cp background.png android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_background.png

# Стандартные иконки
cp icon-48.png android/app/src/main/res/mipmap-mdpi/ic_launcher.png
cp icon-72.png android/app/src/main/res/mipmap-hdpi/ic_launcher.png
cp icon-96.png android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
cp icon-144.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
cp icon-192.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
```

## Подготовка релизной сборки

Для релизной сборки необходимо создать keystore файл. Это можно сделать с помощью keytool:

```bash
keytool -genkey -v -keystore aistore.keystore -alias aistore -keyalg RSA -keysize 2048 -validity 10000
```

После этого обновите файл `android/app/build.gradle`, добавив информацию о keystore.