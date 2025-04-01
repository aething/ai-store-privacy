/**
 * Скрипт для быстрого обновления страны пользователя (для вставки в консоль)
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

  // Обновляем данные пользователя в localStorage
  const newUser = { ...user, country: countryCode };
  localStorage.setItem('user', JSON.stringify(newUser));
  console.log('Данные в localStorage обновлены');
  
  // Сообщаем пользователю, что страна успешно обновлена
  console.log('✅ Страна успешно обновлена на ' + countryCode);
  
  // Информация о валюте
  const euCountries = ['at', 'be', 'bg', 'hr', 'cy', 'cz', 'dk', 'ee', 'fi', 'fr', 'de', 'gr', 'hu', 'ie', 'it', 'lv', 'lt', 'lu', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 'si', 'es', 'se'];
  
  if (countryCode === 'DE' || euCountries.includes(countryCode.toLowerCase())) {
    console.log('Страна относится к ЕС, будет использоваться валюта EUR (€)');
  } else {
    console.log('Страна не относится к ЕС, будет использоваться валюта USD ($)');
  }

  // Предлагаем обновить страницу для применения изменений
  console.log('⚠️ Обновите страницу для применения изменений');
  
  // Предлагаем обновить страницу с помощью API
  console.log('Хотите обновить страницу автоматически? Нажмите Y/N');
  if (confirm('Обновить страницу для применения изменений?')) {
    location.reload();
  }
}

// Примеры использования
console.log('✅ Скрипт обновления страны загружен!');
console.log('👉 Используйте updateCountry("US") для цен в USD');
console.log('👉 Используйте updateCountry("DE") для цен в EUR');