/**
 * Скрипт для создания тестового аккаунта
 */
import fetch from 'node-fetch';

async function createTestAccount() {
  try {
    // Данные пользователя для регистрации
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "Test123!",
      name: "Test User",
      country: "DE", // Германия (для проверки цен в EUR)
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

// Запускаем создание тестового аккаунта
createTestAccount().then(user => {
  if (user) {
    console.log("=== ТЕСТОВЫЙ АККАУНТ ГОТОВ ===");
    console.log("Username:", "testuser");
    console.log("Email:", "test@example.com");
    console.log("Password:", "Test123!");
    console.log("Country:", "DE (Germany)");
    console.log("Используйте эти данные для входа в приложение.");
  } else {
    console.log("Не удалось создать тестовый аккаунт.");
  }
});