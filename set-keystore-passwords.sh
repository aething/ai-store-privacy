#!/bin/bash

# Запрос паролей
read -sp "Введите пароль для keystore: " KEYSTORE_PASSWORD
echo
read -sp "Введите пароль для ключа: " KEY_PASSWORD
echo

# Экспорт переменных окружения
export KEYSTORE_PASSWORD
export KEY_PASSWORD

# Запуск сборки AAB
cd android && ./gradlew bundleRelease

echo "Сборка AAB завершена. Файл доступен в android/app/build/outputs/bundle/release/app-release.aab" 