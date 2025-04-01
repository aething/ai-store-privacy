/**
 * Скрипт для проверки авторизации пользователя
 */

// Импортируем библиотеку для HTTP запросов
// Используем встроенный модуль node-fetch для совместимости
const fetch = require('node-fetch');

// URL API-эндпоинтов
const API_URL = 'http://localhost:5000/api';
const REGISTER_URL = `${API_URL}/users/register`;
const LOGIN_URL = `${API_URL}/users/login`;
const USER_URL = `${API_URL}/users/me`;
const LOGOUT_URL = `${API_URL}/users/logout`;

// Функция для выполнения HTTP-запросов с поддержкой cookies
async function fetchWithCookies(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        credentials: 'include' // Важно для сохранения cookies
    });

    return response;
}

// Функция для регистрации нового пользователя
async function registerUser(username, password, email) {
    console.log(`Регистрируем пользователя ${username}...`);
    const response = await fetchWithCookies(REGISTER_URL, {
        method: 'POST',
        body: JSON.stringify({
            username,
            password,
            email,
            country: 'DE', // Тестируем с европейской страной
            language: 'en'
        })
    });

    const data = await response.json();
    console.log('Ответ сервера на регистрацию:', data);
    return { response, data };
}

// Функция для авторизации пользователя
async function loginUser(username, password) {
    console.log(`Авторизуемся с пользователем ${username}...`);
    const response = await fetchWithCookies(LOGIN_URL, {
        method: 'POST',
        body: JSON.stringify({
            username,
            password
        })
    });

    const data = await response.json();
    console.log('Ответ сервера на авторизацию:', data);
    return { response, data };
}

// Функция для проверки авторизованного пользователя
async function checkCurrentUser() {
    console.log('Проверяем текущего пользователя...');
    const response = await fetchWithCookies(USER_URL);
    const data = await response.json();
    console.log('Текущий пользователь:', data);
    return { response, data };
}

// Функция для выхода из аккаунта
async function logoutUser() {
    console.log('Выходим из аккаунта...');
    const response = await fetchWithCookies(LOGOUT_URL, {
        method: 'POST'
    });
    const data = await response.json();
    console.log('Ответ сервера на выход:', data);
    return { response, data };
}

// Главная функция тестирования
async function runAuthTest() {
    // Тестовые данные
    const username = `testuser_${Date.now()}`;
    const password = 'Test123!';
    const email = `test_${Date.now()}@example.com`;

    // Регистрация пользователя
    const regResult = await registerUser(username, password, email);
    
    if (regResult.response.status !== 201) {
        console.error('Ошибка регистрации пользователя!');
        return;
    }

    // Авторизация пользователя
    const loginResult = await loginUser(username, password);
    
    if (loginResult.response.status !== 200) {
        console.error('Ошибка авторизации пользователя!');
        return;
    }

    // Проверка текущего пользователя
    const userResult = await checkCurrentUser();
    
    if (userResult.response.status !== 200) {
        console.error('Ошибка получения данных пользователя!');
        return;
    }

    // Выход из аккаунта
    const logoutResult = await logoutUser();
    
    if (logoutResult.response.status !== 200) {
        console.error('Ошибка выхода из аккаунта!');
        return;
    }

    // Проверка, что пользователь действительно вышел
    const afterLogoutResult = await checkCurrentUser();
    
    if (afterLogoutResult.response.status === 200 && afterLogoutResult.data.id) {
        console.error('Ошибка: пользователь всё ещё авторизован после выхода!');
        return;
    }

    console.log('Тест авторизации успешно завершён!');
}

// Проверка существующего тестового аккаунта
async function checkExistingAccount() {
    console.log('Проверяем существующий тестовый аккаунт...');
    const username = 'testuser';
    const password = 'Test123!';
    
    // Авторизация
    const loginResult = await loginUser(username, password);
    
    if (loginResult.response.status !== 200) {
        console.error('Ошибка авторизации существующего пользователя!');
        return;
    }
    
    // Проверка пользователя
    await checkCurrentUser();
    
    // Выход
    await logoutUser();
    
    console.log('Проверка существующего аккаунта завершена!');
}

// Запускаем тесты
async function main() {
    try {
        // Сначала проверяем существующий аккаунт
        await checkExistingAccount();
        
        // Затем запускаем полный тест авторизации
        await runAuthTest();
    } catch (error) {
        console.error('Ошибка выполнения тестов:', error);
    }
}

main();