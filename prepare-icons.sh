#!/bin/bash

# Переменные для цветного вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}==== Подготовка иконок для Android приложения ====${NC}"

# Проверяем наличие директории android
if [ ! -d "android" ]; then
  echo -e "${RED}Ошибка: директория android не найдена. Сначала запустите ./build-android.sh${NC}"
  exit 1
fi

# Создаем папку для иконок, если она не существует
mkdir -p icons-temp

echo -e "${YELLOW}Копирование и изменение размера иконок...${NC}"

# Копирование иконок из attached_assets в папку icons-temp
cp attached_assets/AI\ Store\ Icon\ M.png icons-temp/icon-original.png
cp attached_assets/AI\ Store\ Icon\ M.png icons-temp/icon-512.png

# Проверяем наличие imagemagick
if ! command -v convert &> /dev/null; then
  echo -e "${RED}Ошибка: программа ImageMagick (convert) не найдена.${NC}"
  echo -e "${YELLOW}Предупреждение: иконки не будут изменены в размере.${NC}"
  echo -e "${YELLOW}Рекомендуется установить imagemagick или вручную подготовить иконки разных размеров.${NC}"
else
  # Создаем иконки разных размеров
  convert icons-temp/icon-original.png -resize 48x48 icons-temp/icon-48.png
  convert icons-temp/icon-original.png -resize 72x72 icons-temp/icon-72.png
  convert icons-temp/icon-original.png -resize 96x96 icons-temp/icon-96.png
  convert icons-temp/icon-original.png -resize 144x144 icons-temp/icon-144.png
  convert icons-temp/icon-original.png -resize 192x192 icons-temp/icon-192.png
  convert icons-temp/icon-original.png -resize 512x512 icons-temp/icon-512.png
  
  # Создаем адаптивные иконки (упрощенная версия)
  convert icons-temp/icon-original.png -resize 432x432 icons-temp/foreground.png
  convert -size 432x432 xc:#FFFFFF icons-temp/background.png
  
  echo -e "${GREEN}Иконки успешно созданы в разных размерах${NC}"
fi

echo -e "${YELLOW}Копирование иконок в Android проект...${NC}"

# Копирование иконок в Android проект (если иконки существуют)
if [ -f "icons-temp/icon-48.png" ]; then
  # Стандартные иконки
  mkdir -p android/app/src/main/res/mipmap-mdpi
  mkdir -p android/app/src/main/res/mipmap-hdpi
  mkdir -p android/app/src/main/res/mipmap-xhdpi
  mkdir -p android/app/src/main/res/mipmap-xxhdpi
  mkdir -p android/app/src/main/res/mipmap-xxxhdpi
  
  cp icons-temp/icon-48.png android/app/src/main/res/mipmap-mdpi/ic_launcher.png
  cp icons-temp/icon-72.png android/app/src/main/res/mipmap-hdpi/ic_launcher.png
  cp icons-temp/icon-96.png android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
  cp icons-temp/icon-144.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
  cp icons-temp/icon-192.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
  
  # Адаптивные иконки
  mkdir -p android/app/src/main/res/mipmap-anydpi-v26
  cp icons-temp/foreground.png android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_foreground.png
  cp icons-temp/background.png android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_background.png
  
  echo -e "${GREEN}Иконки успешно скопированы в Android проект${NC}"
else
  echo -e "${YELLOW}Внимание: иконки не были созданы, будут использованы стандартные иконки Capacitor${NC}"
fi

# Создание папки для скриншотов Google Play
mkdir -p play-store-assets

# Копирование скриншота в папку для Google Play
if [ -f "attached_assets/webapp.jpg" ]; then
  cp attached_assets/webapp.jpg play-store-assets/screenshot-1.jpg
  echo -e "${GREEN}Скриншот успешно скопирован в play-store-assets${NC}"
fi

# Копирование иконки в папку для Google Play
if [ -f "icons-temp/icon-512.png" ]; then
  cp icons-temp/icon-512.png play-store-assets/app-icon.png
  echo -e "${GREEN}Иконка приложения скопирована в play-store-assets${NC}"
fi

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}Подготовка ресурсов для Android завершена!${NC}"
echo -e "${GREEN}===========================================${NC}"
echo -e "${YELLOW}Примечание:${NC} Для публикации в Google Play требуется больше материалов."
echo -e "Просмотрите файл android-resources.md для получения дополнительной информации."