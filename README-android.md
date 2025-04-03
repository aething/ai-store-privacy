# Руководство по сборке и публикации Android приложения в Google Play

Это руководство содержит инструкции по сборке PWA (Progressive Web App) в полноценное Android-приложение с использованием Capacitor и его публикации в Google Play Market.

## Требования

- Node.js и npm
- Android Studio (для финальных настроек и подписывания приложения)
- JDK 11 или выше
- Аккаунт разработчика Google Play (для публикации)

## Подготовка

1. **Установлены необходимые пакеты Capacitor**:
   - @capacitor/core@4.8.1
   - @capacitor/cli@4.8.1
   - @capacitor/android@4.8.1

2. **Созданы конфигурационные файлы**:
   - `capacitor.config.ts` - основной файл конфигурации
   - `android-resources.md` - информация о требуемых ресурсах 
   - `play-market-metadata.md` - метаданные для публикации

## Процесс сборки

### Шаг 1: Сборка веб-приложения

```bash
npm run build
```

Этот шаг создаст оптимизированную версию приложения в директории `client/dist`.

### Шаг 2: Инициализация проекта Capacitor

```bash
npx cap init "AI Store" "com.aething.aistore" --web-dir "client/dist"
```

### Шаг 3: Добавление Android платформы

```bash
npx cap add android
```

Эта команда создаст стандартную структуру Android-проекта в директории `android`.

### Шаг 4: Копирование веб-приложения в Android проект

```bash
npx cap copy android
```

### Шаг 5: Синхронизация плагинов

```bash
npx cap sync android
```

### Шаг 6: Подготовка иконок и ресурсов

```bash
./prepare-icons.sh
```

Этот скрипт создаст и оптимизирует иконки для Android-приложения.

### Шаг 7: Сборка отладочной версии APK

```bash
cd android && ./gradlew assembleDebug
```

Собранный APK будет доступен по пути `android/app/build/outputs/apk/debug/app-debug.apk`.

## Оптимизация WebView для Android

Наш скрипт сборки включает следующие оптимизации:

1. **Настройка viewport для мобильных устройств**:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no">
   ```

2. **Предзагрузка критических ресурсов**:
   ```html
   <link rel="preload" href="/fonts/roboto.woff2" as="font" type="font/woff2" crossorigin>
   <link rel="preload" href="/styles/main.css" as="style">
   ```

3. **CSS-стили для лучшего отображения в WebView**:
   ```css
   .capacitor-webview-fix {
     overscroll-behavior-y: none;
     -webkit-tap-highlight-color: transparent;
   }
   body {
     overscroll-behavior-y: none;
     -webkit-tap-highlight-color: transparent;
     -webkit-touch-callout: none;
   }
   ```

4. **Настройки WebView в MainActivity.java**:
   ```java
   WebView webView = (WebView) findViewById(R.id.webview);
   WebSettings webSettings = webView.getSettings();
   webSettings.setDomStorageEnabled(true);
   webSettings.setAllowFileAccess(true);
   webSettings.setAllowContentAccess(true);
   webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
   webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
   ```

## Подготовка релизной сборки для Google Play

### Шаг 1: Создание keystore для подписи приложения

```bash
keytool -genkey -v -keystore aistore.keystore -alias aistore -keyalg RSA -keysize 2048 -validity 10000
```

### Шаг 2: Настройка подписи в Android Studio

1. Откройте проект в Android Studio:
   ```bash
   npx cap open android
   ```

2. Перейдите в Build → Generate Signed Bundle / APK → Android App Bundle

3. Укажите путь к keystore файлу, пароль и алиас

4. Выберите "release" в качестве build варианта

### Шаг 3: Создание AAB (Android App Bundle)

```bash
cd android && ./gradlew bundleRelease
```

Итоговый AAB файл будет доступен по пути `android/app/build/outputs/bundle/release/app-release.aab`.

## Публикация в Google Play Console

1. Войдите в [Google Play Console](https://play.google.com/console)

2. Создайте новое приложение

3. Заполните информацию о приложении, используя `play-market-metadata.md`

4. Загрузите AAB файл в раздел "Production"

5. Заполните информацию о релизе

6. Пройдите проверку политик Google Play

7. Опубликуйте приложение

## Рекомендации для улучшения UX

1. **Splash Screen**: используйте плагин `@capacitor/splash-screen` для создания красивого экрана загрузки

2. **Улучшение производительности**:
   - Минимизируйте запросы к сети
   - Используйте локальное хранилище для кэширования данных
   - Оптимизируйте размер изображений

3. **Обработка оффлайн-режима**:
   - Реализуйте оффлайн-индикатор
   - Сохраняйте критические данные локально
   - Используйте IndexedDB для хранения больших объемов данных

## Устранение проблем

1. **Белый экран в приложении**:
   - Убедитесь, что путь к веб-директории в `capacitor.config.ts` правильный
   - Проверьте наличие ошибок в консоли WebView
   - Проверьте права доступа к сети в AndroidManifest.xml

2. **Проблемы с WebView**:
   - Включите отладку WebView в режиме разработчика на устройстве
   - Используйте chrome://inspect для просмотра содержимого WebView

3. **Проблемы с подписью**:
   - Убедитесь, что keystore файл правильно настроен
   - Проверьте, что build.gradle содержит правильную информацию о подписи

## Дополнительные ресурсы

- [Официальная документация Capacitor](https://capacitorjs.com/docs)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Требования к качеству приложений в Google Play](https://developer.android.com/docs/quality-guidelines)