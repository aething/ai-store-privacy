
// Скрипт для обновления данных пользователя в браузере
// Запустите этот код в консоли разработчика на странице сайта

// Очистим существующую сессию
console.log('1. Очистка данных сессии...');
localStorage.removeItem('user');
sessionStorage.clear();

// Установим нового пользователя с правильной страной
console.log('2. Установка обновленных данных пользователя...');
const userData = {
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "isVerified": false,
  "name": null,
  "phone": null,
  "country": "DE",
  "street": null,
  "house": null,
  "apartment": null
};
localStorage.setItem('user', JSON.stringify(userData));

console.log('3. Перезагрузка страницы для применения изменений...');
setTimeout(() => {
  window.location.reload();
}, 500);

console.log('Готово! Страна пользователя обновлена на: DE');
