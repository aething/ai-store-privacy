# Руководство по конвертации PWA в APK для Google Play

В этом руководстве описывается процесс преобразования Progressive Web App (PWA) в формат APK для публикации в Google Play Store. Мы будем использовать подход Trusted Web Activity (TWA), который является рекомендуемым способом для публикации PWA в Google Play Store.

## Содержание

1. [Предварительные требования](#предварительные-требования)
2. [Подготовка PWA](#подготовка-pwa)
3. [Проверка работоспособности PWA](#проверка-работоспособности-pwa)
4. [Настройка Digital Asset Links](#настройка-digital-asset-links)
5. [Создание проекта Android](#создание-проекта-android)
6. [Настройка TWA](#настройка-twa)
7. [Сборка APK](#сборка-apk)
8. [Тестирование APK](#тестирование-apk)
9. [Публикация в Google Play](#публикация-в-google-play)
10. [Обновление приложения](#обновление-приложения)
11. [Решение проблем](#решение-проблем)

## Предварительные требования

Для успешной конвертации PWA в APK и публикации в Google Play вам потребуется:

- Работающее PWA, размещенное по HTTPS
- Android Studio (последняя версия)
- JDK 11 или новее
- Аккаунт разработчика Google Play ($25 одноразовая оплата)
- Доступ к DNS-настройкам домена для настройки Digital Asset Links

## Подготовка PWA

Перед конвертацией убедитесь, что ваше PWA соответствует всем требованиям:

1. PWA размещено на HTTPS
2. Имеет действительный Web App Manifest (`manifest.json`)
3. Имеет Service Worker для оффлайн-функциональности
4. Проходит проверку через Lighthouse PWA с высоким процентом соответствия
5. Имеет иконки всех необходимых размеров (особенно 512x512 и 192x192)

### Необходимые настройки в manifest.json

Убедитесь, что ваш manifest.json содержит следующие параметры:

```json
{
  "name": "AI Store by Aething",
  "short_name": "AI Store",
  "description": "Browse and purchase AI-powered solutions with automatic tax calculation for your region",
  "theme_color": "#6200ee",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "id": "ai-store-pwa",
  "offline_enabled": true,
  "icons": [
    // обязательно включить иконки 192x192 и 512x512
  ]
}
```

## Проверка работоспособности PWA

Перед созданием APK необходимо убедиться, что ваше PWA полностью функционально:

1. Откройте Chrome DevTools (F12)
2. Перейдите на вкладку Lighthouse
3. Выберите категорию PWA
4. Запустите проверку
5. Убедитесь, что ваше PWA соответствует всем критериям

Используйте встроенный инструмент тестирования оффлайн-режима `/offline-test` для детальной проверки оффлайн-функциональности.

## Настройка Digital Asset Links

Digital Asset Links связывает ваше веб-приложение с приложением Android, обеспечивая безопасность:

1. Создайте временный ключ для подписи APK:
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Извлеките SHA-256 отпечаток ключа:
   ```bash
   keytool -list -v -keystore my-release-key.keystore -alias alias_name
   ```

3. Создайте файл `/.well-known/assetlinks.json` на вашем веб-сервере:
   ```json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "android_app",
       "package_name": "com.aething.aistore",
       "sha256_cert_fingerprints": ["SHA-256-отпечаток-из-шага-2"]
     }
   }]
   ```

4. Убедитесь, что файл доступен по адресу `https://[ваш-домен]/.well-known/assetlinks.json`

## Создание проекта Android

1. Откройте Android Studio
2. Создайте новый проект: File > New > New Project
3. Выберите "Empty Activity"
4. Заполните информацию о проекте:
   - Имя приложения: AI Store
   - Имя пакета: com.aething.aistore
   - Минимальный API Level: 23 (Android 6.0)
5. Нажмите "Finish"

## Настройка TWA

Для использования TWA добавим зависимости и настроим проект:

1. Откройте `app/build.gradle` и добавьте зависимость:
   ```gradle
   dependencies {
     implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.4.0'
   }
   ```

2. В файле `AndroidManifest.xml` добавьте необходимые разрешения:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   ```

3. Создайте папку `res/raw` и добавьте файл `twa_manifest.json`:
   ```json
   {
     "packageId": "com.aething.aistore",
     "host": "aistore.aething.com",
     "name": "AI Store",
     "launchUrl": "/",
     "themeColor": "#6200EE",
     "navigationColor": "#000000",
     "navigationColorDark": "#000000",
     "navigationDividerColor": "#000000",
     "navigationDividerColorDark": "#000000",
     "backgroundColor": "#FFFFFF",
     "enableNotifications": true,
     "startUrl": "/",
     "iconUrl": "https://aistore.aething.com/icons/icon-512x512.png",
     "maskableIconUrl": "https://aistore.aething.com/icons/maskable-icon.png",
     "splashScreenFadeOutDuration": 300,
     "signingKey": {
       "path": "./app/my-release-key.keystore",
       "alias": "alias_name"
     },
     "appVersionName": "1.0.0",
     "appVersionCode": 1,
     "shortcuts": [],
     "generatorApp": "AI Store PWA",
     "webManifestUrl": "https://aistore.aething.com/manifest.json",
     "fallbackType": "customtabs",
     "enableSiteSettingsShortcut": true,
     "orientation": "portrait"
   }
   ```

4. Создайте LauncherActivity, которая будет запускать TWA:

```java
package com.aething.aistore;

import android.app.Activity;
import android.os.Bundle;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.util.Log;

import com.google.androidbrowserhelper.trusted.LauncherActivity;
import com.google.androidbrowserhelper.trusted.TwaLauncher;

public class MainActivity extends LauncherActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Дополнительная проверка соединения для оффлайн-режима
        if (!isNetworkAvailable() && isOfflinePageCached()) {
            // Загрузить кэшированную страницу
            loadOfflinePage();
        }
    }
    
    // Определить доступность сети
    private boolean isNetworkAvailable() {
        // Реализация проверки соединения
        return true; // Заглушка
    }
    
    // Проверить наличие кэшированной оффлайн-страницы
    private boolean isOfflinePageCached() {
        // Реализация проверки кэша
        return false; // Заглушка
    }
    
    // Загрузить оффлайн-страницу
    private void loadOfflinePage() {
        // Реализация загрузки оффлайн-страницы
    }
}
```

## Сборка APK

1. Поместите файл ключа `my-release-key.keystore` в директорию `app/`
2. Настройте подписывание APK в `app/build.gradle`:
   ```gradle
   android {
     // Существующие настройки...
     
     signingConfigs {
       release {
         storeFile file('my-release-key.keystore')
         storePassword 'ваш-пароль'
         keyAlias 'alias_name'
         keyPassword 'ваш-пароль'
       }
     }
     
     buildTypes {
       release {
         signingConfig signingConfigs.release
         minifyEnabled true
         shrinkResources true
         proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
       }
     }
   }
   ```

3. Запустите сборку APK-файла:
   - Build > Generate Signed Bundle/APK
   - Выберите "APK"
   - Заполните информацию о ключе
   - Выберите "release" build type
   - Finish

## Тестирование APK

Перед публикацией необходимо тщательно протестировать APK:

1. Установите APK на устройство Android
2. Проверьте запуск и основную функциональность
3. Переведите устройство в режим "Самолёт" для проверки оффлайн-функциональности
4. Убедитесь, что оффлайн-страница отображается корректно
5. Проверьте, что после восстановления соединения приложение работает нормально

## Публикация в Google Play

1. Войдите в [Google Play Console](https://play.google.com/console/)
2. Нажмите "Create app"
3. Заполните всю необходимую информацию:
   - Название приложения
   - Краткое и полное описание
   - Графические материалы (иконка, баннер, скриншоты)
   - Категории и теги
   - Политика конфиденциальности
4. Загрузите подписанный APK или Bundle
5. Установите цену (бесплатно или платно)
6. Заполните опросник о контенте для возрастного рейтинга
7. Нажмите "Start roll-out to Production"

Обработка заявки на публикацию обычно занимает от нескольких часов до нескольких дней.

## Обновление приложения

Главное преимущество TWA в том, что большинство обновлений контента и функциональности происходят автоматически через веб-сайт. Однако вам может потребоваться обновить APK в следующих случаях:

1. Изменение иконок или цветов темы
2. Изменение настроек TWA
3. Обновление версии библиотеки AndroidBrowserHelper
4. Изменение доменного имени

Для обновления APK:
1. Увеличьте `versionCode` и `versionName` в `build.gradle`
2. Соберите новый подписанный APK
3. Загрузите в Google Play Console

## Решение проблем

### Не работает оффлайн-режим

**Причина:** Возможно, Service Worker не настроен правильно или не кэшируются необходимые ресурсы.

**Решение:** 
- Проверьте работу Service Worker в браузере
- Убедитесь, что оффлайн-страница кэшируется
- Используйте Lighthouse для диагностики PWA

### Не активируется TWA (открывается в обычном Chrome)

**Причина:** Неверно настроены Digital Asset Links или проблема с цифровой подписью.

**Решение:**
- Проверьте правильность SHA-256 отпечатка в assetlinks.json
- Убедитесь, что URL в LauncherActivity совпадает с URL в assetlinks.json
- Проверьте, что assetlinks.json доступен по HTTPS

### Приложение отклонено Google Play

**Причина:** Несоответствие политикам Google Play.

**Решение:**
- Внимательно прочитайте причину отклонения
- Убедитесь, что у вас есть политика конфиденциальности
- Проверьте, что пользователи могут использовать основную функциональность без входа
- Если используете оплаты, убедитесь, что они реализованы через Google Play Billing API