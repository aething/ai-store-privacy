#!/bin/bash

# Скрипт для сборки Android приложения с использованием Capacitor
# Выполняет:
# 1. Сборку фронтенда
# 2. Копирование и настройку Capacitor для Android
# 3. Сборку APK файла

# Проверка наличия установленных зависимостей
if ! command -v npx &> /dev/null; then
    echo "Ошибка: npx не найден. Пожалуйста, установите Node.js и npm."
    exit 1
fi

# Функция отображения сообщений
log_msg() {
    echo -e "\n\033[1;34m>> $1\033[0m"
}

# Функция проверки успешности последней команды
check_result() {
    if [ $? -eq 0 ]; then
        echo -e "\033[1;32m✓ $1\033[0m"
    else
        echo -e "\033[1;31m✗ $1\033[0m"
        exit 1
    fi
}

# Создаем директорию для сборки, если она отсутствует
mkdir -p apk-build
check_result "Создана директория для сборки"

# Сборка фронтенда
log_msg "Сборка фронтенда..."
npm run build
check_result "Сборка фронтенда завершена"

# Копирование иконок для Android
log_msg "Копирование ресурсов для Android..."
mkdir -p android/app/src/main/res/drawable
mkdir -p android/app/src/main/res/mipmap-hdpi
mkdir -p android/app/src/main/res/mipmap-mdpi
mkdir -p android/app/src/main/res/mipmap-xhdpi
mkdir -p android/app/src/main/res/mipmap-xxhdpi
mkdir -p android/app/src/main/res/mipmap-xxxhdpi

check_result "Созданы директории для Android ресурсов"

# Синхронизация с Android проектом
log_msg "Синхронизация проекта с Android..."
npx cap sync android
check_result "Синхронизация с Android завершена"

# Сборка APK
log_msg "Сборка APK файла..."
cd android && ./gradlew assembleDebug
check_result "Сборка APK завершена"

# Копирование APK в директорию сборки
log_msg "Копирование APK в директорию сборки..."
cp android/app/build/outputs/apk/debug/app-debug.apk apk-build/aistore.apk
check_result "APK скопирован в директорию сборки"

# Успешное завершение
log_msg "Сборка Android приложения успешно завершена!"
echo -e "APK файл доступен в: \033[1;32mapk-build/aistore.apk\033[0m"