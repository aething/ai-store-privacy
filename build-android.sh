#!/bin/bash

# Переменные для цветного вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}==== Запуск процесса сборки Android приложения ====${NC}"

# Шаг 1: Сборка веб-приложения
echo -e "${YELLOW}Шаг 1: Сборка веб-приложения${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Ошибка при сборке веб-приложения${NC}"
  exit 1
fi

echo -e "${GREEN}Веб-приложение успешно собрано${NC}"

# Проверяем наличие директории android
if [ ! -d "android" ]; then
  # Шаг 2: Проверка файла конфигурации Capacitor
  echo -e "${YELLOW}Шаг 2: Проверка файла конфигурации Capacitor${NC}"
  
  if [ ! -f "capacitor.config.json" ]; then
    echo -e "${RED}Ошибка: Отсутствует файл capacitor.config.json${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Файл конфигурации Capacitor найден${NC}"
  
  # Шаг 3: Добавление Android платформы
  echo -e "${YELLOW}Шаг 3: Добавление Android платформы${NC}"
  npx cap add android
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при добавлении Android платформы${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Android платформа успешно добавлена${NC}"
else
  echo -e "${GREEN}Android проект уже инициализирован${NC}"
fi

# Шаг 4: Копирование и оптимизация index.html для Android
echo -e "${YELLOW}Шаг 4: Оптимизация index.html для Android${NC}"
INDEX_FILE="client/dist/index.html"

if [ -f "$INDEX_FILE" ]; then
  # Создаем резервную копию оригинального файла
  cp "$INDEX_FILE" "${INDEX_FILE}.bak"
  
  # Ищем и обновляем viewport мета-тег для лучшей работы в WebView
  if grep -q '<meta name="viewport"' "$INDEX_FILE"; then
    sed -i 's/<meta name="viewport"[^>]*>/<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no">/' "$INDEX_FILE"
  else
    sed -i '/<head>/a \  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no">' "$INDEX_FILE"
  fi
  
  # Добавляем preload для критических ресурсов
  if ! grep -q 'rel="preload"' "$INDEX_FILE"; then
    sed -i '/<head>/a \  <link rel="preload" href="/fonts/roboto.woff2" as="font" type="font/woff2" crossorigin>\n  <link rel="preload" href="/styles/main.css" as="style">' "$INDEX_FILE"
  fi
  
  # Добавляем CSS для лучшего отображения в WebView
  if ! grep -q '.capacitor-webview-fix' "$INDEX_FILE"; then
    sed -i '/<style>/a \    /* Дополнительные стили для Android WebView */\n    .capacitor-webview-fix {\n      overscroll-behavior-y: none;\n      -webkit-tap-highlight-color: transparent;\n    }\n    body {\n      overscroll-behavior-y: none;\n      -webkit-tap-highlight-color: transparent;\n      -webkit-touch-callout: none;\n    }' "$INDEX_FILE"
  fi
  
  # Добавляем класс к body для специальных стилей в WebView
  sed -i 's/<body>/<body class="capacitor-webview-fix">/' "$INDEX_FILE"
  
  echo -e "${GREEN}index.html оптимизирован для Android WebView${NC}"
else
  echo -e "${RED}Ошибка: index.html не найден${NC}"
fi

# Шаг 5: Копирование изменений веб-приложения в Android проект
echo -e "${YELLOW}Шаг 5: Копирование изменений веб-приложения в Android проект${NC}"
npx cap copy android

if [ $? -ne 0 ]; then
  echo -e "${RED}Ошибка при копировании изменений в Android проект${NC}"
  exit 1
fi

echo -e "${GREEN}Изменения успешно скопированы в Android проект${NC}"

# Шаг 6: Обновление нативных плагинов
echo -e "${YELLOW}Шаг 6: Обновление нативных плагинов${NC}"
npx cap sync android

if [ $? -ne 0 ]; then
  echo -e "${RED}Ошибка при обновлении нативных плагинов${NC}"
  exit 1
fi

echo -e "${GREEN}Нативные плагины успешно обновлены${NC}"

# Шаг 7: Настройка проекта Android для оптимальной работы WebView
echo -e "${YELLOW}Шаг 7: Оптимизация настроек Android WebView${NC}"

# Путь к MainActivity.java
MAIN_ACTIVITY="android/app/src/main/java/com/aething/aistore/MainActivity.java"

if [ -f "$MAIN_ACTIVITY" ]; then
  # Создаем резервную копию
  cp "$MAIN_ACTIVITY" "${MAIN_ACTIVITY}.bak"
  
  # Проверяем наличие метода onCreate и добавляем настройки WebView
  if grep -q "onCreate" "$MAIN_ACTIVITY"; then
    # Если метод уже содержит настройки WebView, не изменяем его
    if ! grep -q "WebSettings webSettings" "$MAIN_ACTIVITY"; then
      # Добавляем настройки WebView в методе onCreate
      sed -i '/super.onCreate/a \        WebView webView = (WebView) findViewById(R.id.webview);\n        WebSettings webSettings = webView.getSettings();\n        webSettings.setDomStorageEnabled(true);\n        webSettings.setAllowFileAccess(true);\n        webSettings.setAllowContentAccess(true);\n        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);\n        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);' "$MAIN_ACTIVITY"
      
      # Добавляем импорт для WebSettings, если его еще нет
      if ! grep -q "import android.webkit.WebSettings;" "$MAIN_ACTIVITY"; then
        sed -i '/package com.aething.aistore;/a \import android.webkit.WebSettings;\nimport android.webkit.WebView;' "$MAIN_ACTIVITY"
      fi
      
      echo -e "${GREEN}Настройки WebView добавлены в MainActivity.java${NC}"
    else
      echo -e "${BLUE}Настройки WebView уже присутствуют в MainActivity.java${NC}"
    fi
  else
    echo -e "${YELLOW}Предупреждение: метод onCreate не найден в MainActivity.java${NC}"
  fi
else
  echo -e "${YELLOW}Файл MainActivity.java не найден, пропускаем оптимизацию WebView${NC}"
fi

# Шаг 8: Сборка APK файла в режиме отладки
echo -e "${YELLOW}Шаг 8: Сборка APK файла (debug)${NC}"
cd android && ./gradlew assembleDebug

if [ $? -ne 0 ]; then
  echo -e "${RED}Ошибка при сборке APK файла${NC}"
  exit 1
fi

echo -e "${GREEN}APK файл успешно собран${NC}"

# Создание директории для хранения APK, если она не существует
mkdir -p ../apk-build

# Копирование собранного APK файла
cp app/build/outputs/apk/debug/app-debug.apk ../apk-build/ai-store-android-pwa.apk

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}Сборка Android приложения завершена успешно!${NC}"
echo -e "${GREEN}APK файл доступен по пути: ${NC}apk-build/ai-store-android-pwa.apk"
echo -e "${GREEN}===========================================${NC}"

# Рекомендации для создания релизной сборки
echo -e "${YELLOW}Следующие шаги для релизной сборки:${NC}"
echo -e "1. ${BLUE}Создайте keystore файл:${NC}"
echo -e "   keytool -genkey -v -keystore aistore.keystore -alias aistore -keyalg RSA -keysize 2048 -validity 10000"
echo -e "2. ${BLUE}Для создания AAB файла (рекомендуемый формат для Google Play):${NC}"
echo -e "   В Android Studio: Build → Generate Signed Bundle / APK → Android App Bundle"
echo -e "3. ${BLUE}Для запуска AAB сборки через командную строку:${NC}"
echo -e "   ./gradlew bundleRelease"
echo -e "4. ${BLUE}Итоговый AAB файл будет доступен по пути:${NC}"
echo -e "   app/build/outputs/bundle/release/app-release.aab"

cd ..
