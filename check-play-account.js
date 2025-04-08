import { google } from 'googleapis';

async function checkPlayAccount() {
  try {
    // Читаем JSON из переменной окружения
    const credentials = JSON.parse(process.env.PLAY_SERVICE_ACCOUNT_JSON);
    
    // Создаем JWT клиент
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/androidpublisher']
    );

    // Авторизуемся
    await auth.authorize();
    
    // Создаем клиент для Android Publisher API
    const androidPublisher = google.androidpublisher({
      version: 'v3',
      auth: auth
    });

    // Пробуем получить список релизов
    const response = await androidPublisher.edits.insert({
      packageName: 'com.aething.aistore'
    });

    console.log('✅ JSON ключ валиден!');
    console.log('ID редактирования:', response.data.id);
  } catch (error) {
    console.error('❌ Ошибка при проверке JSON ключа:');
    console.error(error.message);
  }
}

checkPlayAccount(); 