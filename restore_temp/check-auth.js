/**
 * Скрипт для проверки аутентификации и тестовых операций с пользователем.
 * 
 * Запуск:
 * node check-auth.js
 */
import fetch from 'node-fetch';
import fs from 'fs';

// Файл для хранения кук сессии между запросами
const cookieFile = './cookie.txt';

// Функция для сохранения кук
function saveCookies(cookieString) {
  try {
    fs.writeFileSync(cookieFile, cookieString);
    console.log('Cookies сохранены в файл');
  } catch (error) {
    console.error('Ошибка при сохранении cookies:', error);
  }
}

// Функция для загрузки кук
function loadCookies() {
  try {
    if (fs.existsSync(cookieFile)) {
      return fs.readFileSync(cookieFile, 'utf8');
    }
  } catch (error) {
    console.error('Ошибка при загрузке cookies:', error);
  }
  return '';
}

// Функция для выполнения запросов с сохранением и использованием cookies
async function fetchWithCookies(url, options = {}) {
  const cookies = loadCookies();
  
  // Добавляем cookie в заголовки, если они есть
  const headers = {
    ...options.headers,
  };
  
  if (cookies) {
    headers['Cookie'] = cookies;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Сохраняем cookie из ответа, если они есть
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    saveCookies(setCookie);
  }
  
  return response;
}

// Функция для регистрации нового пользователя
async function registerUser(username, password, email) {
  try {
    const userData = {
      username,
      password,
      email,
      name: "Test User",
      country: "US",
      language: "en"
    };
    
    console.log(`Регистрируем пользователя ${username}...`);
    
    const response = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      console.log('Пользователь успешно зарегистрирован!');
      return await response.json();
    } else {
      const error = await response.text();
      console.error('Ошибка при регистрации:', error);
      return null;
    }
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    return null;
  }
}

// Функция для входа пользователя
async function loginUser(username, password) {
  try {
    console.log(`Входим как пользователь ${username}...`);
    
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      console.log('Вход выполнен успешно!');
      return await response.json();
    } else {
      const error = await response.text();
      console.error('Ошибка при входе:', error);
      return null;
    }
  } catch (error) {
    console.error('Ошибка при входе:', error);
    return null;
  }
}

// Функция для проверки текущего пользователя
async function checkCurrentUser() {
  try {
    console.log('Проверяем текущего пользователя...');
    
    const response = await fetch('http://localhost:5000/api/users/current', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('Текущий пользователь:', user);
      return user;
    } else {
      console.log('Пользователь не аутентифицирован');
      return null;
    }
  } catch (error) {
    console.error('Ошибка при проверке пользователя:', error);
    return null;
  }
}

// Функция для выхода пользователя
async function logoutUser() {
  try {
    console.log('Выходим из системы...');
    
    const response = await fetch('http://localhost:5000/api/users/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('Выход выполнен успешно!');
      return true;
    } else {
      const error = await response.text();
      console.error('Ошибка при выходе:', error);
      return false;
    }
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    return false;
  }
}

// Тестовая функция для проверки всего процесса аутентификации
async function runAuthTest() {
  // Регистрация нового пользователя (если не существует)
  const newUser = await registerUser('testuser2', 'Test123!', 'test2@example.com');
  
  // Вход в систему
  const loggedInUser = await loginUser('testuser2', 'Test123!');
  
  if (loggedInUser) {
    // Проверка текущего пользователя
    const currentUser = await checkCurrentUser();
    
    // Выход из системы
    await logoutUser();
    
    // Проверяем, что успешно вышли
    const afterLogout = await checkCurrentUser();
    if (!afterLogout) {
      console.log('Тест пройден успешно!');
    }
  }
}

// Функция для проверки существующего аккаунта
async function checkExistingAccount() {
  // Вход с тестовым пользователем
  const user = await loginUser('testuser', 'Test123!');
  
  if (user) {
    console.log('=== ИНФОРМАЦИЯ О ТЕСТОВОМ АККАУНТЕ ===');
    console.log('ID:', user.id);
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Country:', user.country);
    console.log('IsVerified:', user.isVerified);
    
    // Проверка текущего пользователя через сессию
    const currentUser = await checkCurrentUser();
    if (currentUser) {
      console.log('\nТекущий пользователь в сессии:');
      console.log('ID:', currentUser.id);
      console.log('Username:', currentUser.username);
    }
  } else {
    console.log('Не удалось войти в тестовый аккаунт');
  }
}

// Запуск основной функции
async function main() {
  // Выбираем, какую функцию запустить
  //await runAuthTest();
  await checkExistingAccount();
}

main().catch(console.error);