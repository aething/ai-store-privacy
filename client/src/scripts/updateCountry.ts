/**
 * Скрипт для обновления страны пользователя через веб-интерфейс.
 * 
 * Этот скрипт можно запустить в консоли браузера для быстрого изменения 
 * страны текущего пользователя без необходимости открывать страницу профиля.
 * 
 * Использование:
 * 1. Войдите на сайт как тестовый пользователь (testuser / Test123!)
 * 2. Откройте консоль браузера (F12)
 * 3. Скопируйте и вставьте этот код
 * 4. Вызовите функцию updateCountry("US") для США или updateCountry("DE") для Германии
 */

async function updateCountry(countryCode) {
  // Получаем данные пользователя из localStorage
  const userString = localStorage.getItem('user');
  if (!userString) {
    console.error('Пользователь не авторизован. Сначала войдите в систему.');
    return;
  }

  const user = JSON.parse(userString);
  console.log('Текущий пользователь:', user);
  console.log(`Обновляем страну с ${user.country || 'не указана'} на ${countryCode}...`);

  try {
    // Получаем токен из localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Токен авторизации не найден. Войдите в систему заново.');
      return;
    }

    // Выполняем запрос на обновление пользователя
    const response = await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        country: countryCode
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при обновлении страны');
    }

    const updatedUser = await response.json();
    console.log('Пользователь успешно обновлен:', updatedUser);

    // Обновляем данные пользователя в localStorage
    const newUser = { ...user, country: countryCode };
    localStorage.setItem('user', JSON.stringify(newUser));
    console.log('Данные в localStorage обновлены');

    // Сообщаем пользователю, что страна успешно обновлена
    console.log('✅ Страна успешно обновлена на ' + countryCode);
    
    // Информация о валюте
    console.log('💰 Информация о валюте:');
    if (countryCode === 'DE' || europeanCountryCodes.includes(countryCode.toLowerCase())) {
      console.log('Страна относится к ЕС, будет использоваться валюта EUR (€)');
    } else {
      console.log('Страна не относится к ЕС, будет использоваться валюта USD ($)');
    }

    // Предлагаем обновить страницу для применения изменений
    console.log('Обновите страницу для применения изменений');
    
    return updatedUser;
  } catch (error) {
    console.error('Ошибка при обновлении страны:', error);
    return null;
  }
}

// Список кодов стран Европейского Союза
const europeanCountryCodes = [
  'at', 'be', 'bg', 'hr', 'cy', 'cz', 'dk', 'ee', 'fi', 'fr', 'de', 'gr', 
  'hu', 'ie', 'it', 'lv', 'lt', 'lu', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 
  'si', 'es', 'se'
];

// Примеры вызова:
// updateCountry("US"); // для цен в USD
// updateCountry("DE"); // для цен в EUR

console.log('Скрипт обновления страны загружен!');
console.log('Используйте функцию updateCountry("US") для США (USD) или updateCountry("DE") для Германии (EUR)');