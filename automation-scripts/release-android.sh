#!/bin/bash

# Скрипт для автоматизации релизной сборки Android-приложения
# Использование: ./release-android.sh [название_keystore] [пароль_keystore] [alias] [пароль_alias]

# Переменные для цветного вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}==== Запуск процесса релизной сборки Android приложения ====${NC}"

# Проверка аргументов
if [ $# -ne 4 ]; then
  echo -e "${RED}Ошибка: неверное количество аргументов${NC}"
  echo -e "Использование: ./release-android.sh [название_keystore] [пароль_keystore] [alias] [пароль_alias]"
  echo -e "Пример: ./release-android.sh aistore.keystore myStorePassword aistore myAliasPassword"
  exit 1
fi

KEYSTORE_NAME=$1
KEYSTORE_PASSWORD=$2
KEY_ALIAS=$3
KEY_PASSWORD=$4

# Проверка keystore файла
if [ ! -f "$KEYSTORE_NAME" ]; then
  echo -e "${RED}Ошибка: keystore файл $KEYSTORE_NAME не найден${NC}"
  
  # Предлагаем создать keystore
  echo -e "${YELLOW}Хотите создать новый keystore файл? (y/n)${NC}"
  read -p "Введите y/n: " CREATE_KEYSTORE
  
  if [[ "$CREATE_KEYSTORE" == "y" || "$CREATE_KEYSTORE" == "Y" ]]; then
    echo -e "${BLUE}Создание нового keystore файла...${NC}"
    keytool -genkey -v -keystore $KEYSTORE_NAME -alias $KEY_ALIAS -keyalg RSA -keysize 2048 -validity 10000 -storepass $KEYSTORE_PASSWORD -keypass $KEY_PASSWORD
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Ошибка при создании keystore файла${NC}"
      exit 1
    fi
    
    echo -e "${GREEN}Keystore файл успешно создан${NC}"
  else
    echo -e "${RED}Сборка прервана${NC}"
    exit 1
  fi
fi

# Шаг 1: Сборка веб-приложения
echo -e "${YELLOW}Шаг 1: Сборка веб-приложения в производственном режиме${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Ошибка при сборке веб-приложения${NC}"
  exit 1
fi

echo -e "${GREEN}Веб-приложение успешно собрано${NC}"

# Шаг 2: Проверка наличия директории android
if [ ! -d "android" ]; then
  echo -e "${RED}Ошибка: директория android не найдена${NC}"
  echo -e "${YELLOW}Запустите сначала ./build-android.sh для создания Android проекта${NC}"
  exit 1
fi

# Шаг 3: Копирование и оптимизация index.html для релизной версии
echo -e "${YELLOW}Шаг 3: Оптимизация index.html для релизной версии${NC}"
INDEX_FILE="client/dist/index.html"

if [ -f "$INDEX_FILE" ]; then
  # Создаем резервную копию оригинального файла
  cp "$INDEX_FILE" "${INDEX_FILE}.bak"
  
  # Удаление отладочных скриптов и комментариев
  sed -i '/scroll-test.js/d' "$INDEX_FILE"
  sed -i '/scroll-debug.js/d' "$INDEX_FILE"
  sed -i '/console.log(/d' "$INDEX_FILE"
  
  # Минимизация HTML для производительности
  if command -v html-minifier &> /dev/null; then
    echo -e "${BLUE}Минимизация HTML для лучшей производительности${NC}"
    html-minifier "$INDEX_FILE" --remove-comments --collapse-whitespace --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true -o "${INDEX_FILE}.min"
    mv "${INDEX_FILE}.min" "$INDEX_FILE"
  else
    echo -e "${YELLOW}html-minifier не найден, пропускаем минимизацию HTML${NC}"
  fi
  
  echo -e "${GREEN}index.html оптимизирован для релизной версии${NC}"
else
  echo -e "${RED}Ошибка: index.html не найден${NC}"
  exit 1
fi

# Шаг 4: Копирование изменений веб-приложения в Android проект
echo -e "${YELLOW}Шаг 4: Копирование изменений веб-приложения в Android проект${NC}"
npx cap copy android

if [ $? -ne 0 ]; then
  echo -e "${RED}Ошибка при копировании изменений в Android проект${NC}"
  exit 1
fi

echo -e "${GREEN}Изменения успешно скопированы в Android проект${NC}"

# Шаг 5: Обновление build.gradle для добавления информации о keystore
echo -e "${YELLOW}Шаг 5: Обновление build.gradle для подписи релизной версии${NC}"
BUILD_GRADLE="android/app/build.gradle"

if [ -f "$BUILD_GRADLE" ]; then
  # Создаем резервную копию
  cp "$BUILD_GRADLE" "${BUILD_GRADLE}.bak"
  
  # Проверяем наличие блока signingConfigs
  if ! grep -q "signingConfigs" "$BUILD_GRADLE"; then
    # Не нашли блок signingConfigs, добавляем его
    SIGNING_CONFIG=$(cat << EOF

    signingConfigs {
        release {
            storeFile file('../${KEYSTORE_NAME}')
            storePassword '${KEYSTORE_PASSWORD}'
            keyAlias '${KEY_ALIAS}'
            keyPassword '${KEY_PASSWORD}'
        }
    }
EOF
    )
    
    # Вставляем после buildTypes
    sed -i "/buildTypes {/i\\${SIGNING_CONFIG}" "$BUILD_GRADLE"
    
    # Обновляем buildTypes для использования signingConfig
    sed -i "/release {/a\\            signingConfig signingConfigs.release" "$BUILD_GRADLE"
    
    echo -e "${GREEN}Конфигурация подписи успешно добавлена в build.gradle${NC}"
  else
    echo -e "${BLUE}Блок signingConfigs уже существует в build.gradle${NC}"
  fi
  
  # Копируем keystore файл в директорию android
  cp "$KEYSTORE_NAME" "android/"
  echo -e "${GREEN}Keystore файл скопирован в директорию Android проекта${NC}"
else
  echo -e "${RED}Ошибка: build.gradle не найден${NC}"
  exit 1
fi

# Шаг 6: Сборка релизной версии AAB
echo -e "${YELLOW}Шаг 6: Сборка релизной версии AAB (Android App Bundle)${NC}"
cd android && ./gradlew bundleRelease

if [ $? -ne 0 ]; then
  echo -e "${RED}Ошибка при сборке AAB файла${NC}"
  exit 1
fi

echo -e "${GREEN}AAB файл успешно собран${NC}"

# Шаг 7: Сборка релизной версии APK (для тестирования)
echo -e "${YELLOW}Шаг 7: Сборка релизной версии APK (для тестирования)${NC}"
./gradlew assembleRelease

if [ $? -ne 0 ]; then
  echo -e "${RED}Ошибка при сборке APK файла${NC}"
  cd ..
  exit 1
fi

echo -e "${GREEN}APK файл успешно собран${NC}"

# Создание директории для хранения релизных файлов
mkdir -p ../apk-build/release

# Копирование собранных файлов
cp app/build/outputs/bundle/release/app-release.aab ../apk-build/release/ai-store-release.aab
cp app/build/outputs/apk/release/app-release.apk ../apk-build/release/ai-store-release.apk

cd ..

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}Релизная сборка Android приложения завершена успешно!${NC}"
echo -e "${GREEN}AAB файл доступен по пути: ${NC}apk-build/release/ai-store-release.aab"
echo -e "${GREEN}APK файл доступен по пути: ${NC}apk-build/release/ai-store-release.apk"
echo -e "${GREEN}===========================================${NC}"

echo -e "${YELLOW}Следующие шаги для публикации в Google Play:${NC}"
echo -e "1. ${BLUE}Войдите в Google Play Console${NC}"
echo -e "2. ${BLUE}Создайте новое приложение или выберите существующее${NC}"
echo -e "3. ${BLUE}Загрузите AAB файл в разделе 'Production'${NC}"
echo -e "4. ${BLUE}Заполните информацию о релизе${NC}"
echo -e "5. ${BLUE}Пройдите проверку и опубликуйте приложение${NC}"