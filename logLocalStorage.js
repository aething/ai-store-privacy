/**
 * Скрипт для отображения данных, хранящихся в localStorage браузера.
 * 
 * Этот скрипт можно выполнить в консоли браузера, чтобы увидеть все данные,
 * сохраненные приложением в localStorage, включая информацию о пользователе,
 * корзине, настройках и т.д.
 */

// Функция для форматированного вывода всех ключей и значений из localStorage
(function logLocalStorage() {
  console.log('=== СОДЕРЖИМОЕ LOCALSTORAGE ===');
  if (localStorage.length === 0) {
    console.log('localStorage пуст');
    return;
  }

  // Получаем все ключи localStorage
  const keys = Object.keys(localStorage);
  keys.sort(); // Сортируем ключи для удобства просмотра
  
  // Выводим каждый ключ и его значение
  keys.forEach(key => {
    try {
      // Пробуем распарсить JSON, если это возможно
      const value = localStorage.getItem(key);
      let parsedValue;
      try {
        parsedValue = JSON.parse(value);
        console.log(`${key}:`, parsedValue);
      } catch (e) {
        // Если не JSON, выводим как есть
        console.log(`${key}:`, value);
      }
    } catch (error) {
      console.error(`Ошибка при чтении ключа ${key}:`, error);
    }
  });
  
  // Детальный анализ данных пользователя, если они есть
  if (localStorage.getItem('user')) {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log('\n=== ДАННЫЕ ПОЛЬЗОВАТЕЛЯ ===');
      console.log('ID:', user.id);
      console.log('Username:', user.username);
      console.log('Email:', user.email);
      console.log('Country:', user.country);
      console.log('Language:', user.language);
      
      // Проверяем, связан ли пользователь со Stripe
      if (user.stripeCustomerId) {
        console.log('Stripe Customer ID:', user.stripeCustomerId);
      }
      
      // Проверяем наличие подписок
      if (user.subscriptions && user.subscriptions.length > 0) {
        console.log('\nАктивные подписки:');
        user.subscriptions.forEach((sub, index) => {
          console.log(`Подписка ${index + 1}:`, sub);
        });
      }
    } catch (error) {
      console.error('Ошибка при анализе данных пользователя:', error);
    }
  }
  
  // Информация о корзине, если она есть
  if (localStorage.getItem('cart')) {
    try {
      const cart = JSON.parse(localStorage.getItem('cart'));
      console.log('\n=== КОРЗИНА ===');
      console.log('Количество товаров:', cart.items ? cart.items.length : 0);
      if (cart.items && cart.items.length > 0) {
        cart.items.forEach((item, index) => {
          console.log(`Товар ${index + 1}:`, item);
        });
      }
      if (cart.total) {
        console.log('Общая сумма:', cart.total);
      }
    } catch (error) {
      console.error('Ошибка при анализе данных корзины:', error);
    }
  }
})();

// Функция для очистки localStorage (раскомментируйте, если нужно сбросить все данные)
/*
function clearLocalStorage() {
  console.log('Очистка всех данных из localStorage...');
  localStorage.clear();
  console.log('Данные очищены!');
}
// clearLocalStorage();
*/