/**
 * Скрипт для создания тестового аккаунта и управления страной пользователя
 * 
 * Использование:
 * node test-account.js         - создать/проверить аккаунт тестового пользователя
 * node test-account.js check   - проверить существующего тестового пользователя
 * node test-account.js update-us - сменить страну на США (цены в USD)
 * node test-account.js update-de - сменить страну на Германию (цены в EUR)
 */
import fetch from 'node-fetch';

/**
 * ВАЖНО: Для работы с обновлением страны пользователя необходимо:
 * 1. Войти на сайт как тестовый пользователь (testuser / Test123!)
 * 2. После успешного входа зайти в консоль браузера и найти токен в localStorage
 * 3. Вставить этот токен в переменную AUTH_TOKEN ниже 
 */
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3MTM3MjA3MjIsImV4cCI6MTcxNDMyNTUyMn0.B-ItMxwJO-blkDH3pMZXeJkJ3TW-NbXsZahGh7WwzXw';

async function updateUserCountry(userId, country) {
  try {
    console.log(`Обновляем страну пользователя с ID ${userId} на ${country}...`);
    
    const updateResponse = await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        country: country
      })
    });
    
    if (updateResponse.ok) {
      console.log(`Страна успешно обновлена на ${country}!`);
      const userData = await updateResponse.json();
      return userData;
    } else {
      console.error("Ошибка при обновлении страны:", await updateResponse.text());
      return null;
    }
  } catch (error) {
    console.error("Произошла ошибка при обновлении страны:", error);
    return null;
  }
}

async function createTestAccount() {
  try {
    // Данные пользователя для регистрации
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "Test123!",
      name: "Test User",
      country: "US", // США (для проверки цен в USD)
      language: "en"
    };

    console.log("Регистрируем тестового пользователя...");
    
    // Регистрация пользователя
    const registerResponse = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!registerResponse.ok) {
      const errorData = await registerResponse.json();
      if (errorData.message === "User with this email already exists") {
        console.log("Пользователь уже существует, пробуем войти...");

        // Если пользователь существует, пробуем авторизоваться
        const loginResponse = await fetch('http://localhost:5000/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: userData.username,
            password: userData.password
          })
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          console.log("Успешный вход в систему!");
          console.log("Данные пользователя:", loginData);
          return loginData;
        } else {
          console.error("Ошибка при входе:", await loginResponse.text());
          return null;
        }
      } else {
        console.error("Ошибка при регистрации:", errorData);
        return null;
      }
    }

    // Если регистрация прошла успешно
    const registerData = await registerResponse.json();
    console.log("Пользователь успешно зарегистрирован!");
    console.log("Данные пользователя:", registerData);
    
    // Проверка верификации (в реальной системе отправляется email)
    if (!registerData.isVerified && registerData.verificationToken) {
      console.log("Верифицируем аккаунт с токеном:", registerData.verificationToken);
      
      const verifyResponse = await fetch(`http://localhost:5000/api/users/${registerData.id}/verify?token=${registerData.verificationToken}`, {
        method: 'GET'
      });
      
      if (verifyResponse.ok) {
        console.log("Аккаунт успешно верифицирован!");
      } else {
        console.error("Ошибка при верификации:", await verifyResponse.text());
      }
    }
    
    return registerData;
  } catch (error) {
    console.error("Произошла ошибка:", error);
    return null;
  }
}

// Тестовый пользователь (всегда с ID=1)
const TEST_USER_ID = 1;

// Проверяем аргументы командной строки
const command = process.argv[2];

if (command === 'check') {
  // Просто проверяем аккаунт, если команда "check"
  createTestAccount().then(user => {
    if (user) {
      console.log("=== ТЕСТОВЫЙ АККАУНТ ГОТОВ ===");
      console.log("Username:", "testuser");
      console.log("Email:", "test@example.com");
      console.log("Password:", "Test123!");
      console.log("Country:", user.country || "Не указана");
      console.log("Используйте эти данные для входа в приложение.");
    } else {
      console.log("Не удалось создать тестовый аккаунт.");
    }
  });
} else if (command === 'update-us') {
  // Обновляем страну на США, если команда "update-us"
  console.log("Обновляем страну тестового пользователя на США (US)");
  updateUserCountry(TEST_USER_ID, "US").then(updatedUser => {
    if (updatedUser) {
      console.log("=== ТЕСТОВЫЙ АККАУНТ ОБНОВЛЕН ===");
      console.log("Username:", updatedUser.username);
      console.log("Email:", updatedUser.email);
      console.log("Password:", "Test123!");
      console.log("Country:", "US (United States)");
      console.log("Используйте эти данные для входа в приложение. Цены будут отображаться в USD.");
    }
  });
} else if (command === 'update-de') {
  // Обновляем страну на Германию, если команда "update-de"
  console.log("Обновляем страну тестового пользователя на Германию (DE)");
  updateUserCountry(TEST_USER_ID, "DE").then(updatedUser => {
    if (updatedUser) {
      console.log("=== ТЕСТОВЫЙ АККАУНТ ОБНОВЛЕН ===");
      console.log("Username:", updatedUser.username);
      console.log("Email:", updatedUser.email);
      console.log("Password:", "Test123!");
      console.log("Country:", "DE (Germany)");
      console.log("Используйте эти данные для входа в приложение. Цены будут отображаться в EUR.");
    }
  });
} else {
  // По умолчанию просто создаем/проверяем аккаунт
  createTestAccount().then(user => {
    if (user) {
      console.log("=== ТЕСТОВЫЙ АККАУНТ ГОТОВ ===");
      console.log("Username:", "testuser");
      console.log("Email:", "test@example.com");
      console.log("Password:", "Test123!");
      console.log("Country:", user.country || "Не указана");
      console.log("Используйте эти данные для входа в приложение.");
      console.log("\nДля изменения страны на США используйте: node test-account.js update-us");
      console.log("Для изменения страны на Германию используйте: node test-account.js update-de");
    } else {
      console.log("Не удалось создать тестовый аккаунт.");
    }
  });
}