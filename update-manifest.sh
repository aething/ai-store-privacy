#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

MANIFEST_FILE="android/app/src/main/AndroidManifest.xml"

if [ ! -f "$MANIFEST_FILE" ]; then
  echo -e "${RED}Ошибка: AndroidManifest.xml не найден${NC}"
  exit 1
fi

# Создаем резервную копию манифеста
cp "$MANIFEST_FILE" "${MANIFEST_FILE}.bak"
echo -e "${BLUE}Резервная копия AndroidManifest.xml создана${NC}"

# Добавляем необходимые разрешения
echo -e "${YELLOW}Добавление разрешений для PWA...${NC}"

# Проверяем, содержит ли файл уже разрешение на интернет
if ! grep -q '<uses-permission android:name="android.permission.INTERNET" />' "$MANIFEST_FILE"; then
  # Если нет, добавляем его
  sed -i '/<\/manifest>/i \    <uses-permission android:name="android.permission.INTERNET" \/>' "$MANIFEST_FILE"
fi

# Добавляем дополнительные разрешения перед закрывающим тегом manifest
sed -i '/<\/manifest>/i \    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" \/>\n    <uses-permission android:name="android.permission.WAKE_LOCK" \/>' "$MANIFEST_FILE"

# Добавляем атрибут networkSecurityConfig в тег application
if ! grep -q 'android:networkSecurityConfig' "$MANIFEST_FILE"; then
  sed -i '/<application/s/android:theme="@style\/AppTheme"/android:theme="@style\/AppTheme" android:networkSecurityConfig="@xml\/network_security_config"/' "$MANIFEST_FILE"
  
  # Создаем директорию для network_security_config.xml, если она не существует
  mkdir -p android/app/src/main/res/xml
  
  # Создаем файл network_security_config.xml
  cat > android/app/src/main/res/xml/network_security_config.xml << 'NETSEC'
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
NETSEC
  echo -e "${BLUE}Создан файл network_security_config.xml${NC}"
fi

# Обновляем activity, добавляя атрибуты для лучшей работы PWA
sed -i '/<activity/s/android:exported="true"/android:exported="true" android:screenOrientation="portrait" android:windowSoftInputMode="adjustResize"/' "$MANIFEST_FILE"

echo -e "${GREEN}AndroidManifest.xml успешно обновлен${NC}"
echo -e "${YELLOW}Внесенные изменения:${NC}"
echo -e "${BLUE}- Добавлены разрешения: ACCESS_NETWORK_STATE, WAKE_LOCK${NC}"
echo -e "${BLUE}- Добавлен network_security_config для поддержки HTTP${NC}"
echo -e "${BLUE}- Обновлены атрибуты activity для лучшей работы PWA${NC}"
