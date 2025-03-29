import { google, sheets_v4 } from 'googleapis';
import { User, Order } from '@shared/schema';

// Настройка Google Sheets API
let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';

// Если ключ не содержит переносы строк, но содержит '\n', заменяем их
if (!privateKey.includes('\n') && privateKey.includes('\\n')) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// ID Google таблицы из переменных окружения
const spreadsheetId = process.env.GOOGLE_SHEET_ID;

// Названия листов для разных типов данных
const SHEETS = {
  USERS: 'Users',
  ORDERS: 'Orders',
  VERIFICATION: 'Verification',
};

/**
 * Инициализация Google Sheets - создание необходимых листов, если они отсутствуют
 */
export async function initializeGoogleSheets(): Promise<void> {
  try {
    // Получаем информацию о существующих листах
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const existingSheets = spreadsheet.data.sheets?.map(
      (sheet) => sheet.properties?.title
    ) || [];

    // Создаем недостающие листы
    const sheetsToAdd = Object.values(SHEETS).filter(
      (sheetName) => !existingSheets.includes(sheetName)
    );

    if (sheetsToAdd.length > 0) {
      const requests = sheetsToAdd.map((sheetName) => {
        return {
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        };
      });

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests,
        },
      });

      // Инициализация заголовков для каждого листа
      await initializeHeaders();
    }

    console.log('Google Sheets initialized successfully');
  } catch (error) {
    console.error('Error initializing Google Sheets:', error);
    throw error;
  }
}

/**
 * Инициализация заголовков для каждого листа
 */
async function initializeHeaders(): Promise<void> {
  // Заголовки для листа пользователей
  const userHeaders = [
    'id',
    'username',
    'email',
    'isVerified',
    'name',
    'phone',
    'country',
    'street',
    'house',
    'apartment',
    'stripeCustomerId',
    'createdAt',
  ];

  // Заголовки для листа заказов
  const orderHeaders = [
    'id',
    'userId',
    'productId',
    'status',
    'amount',
    'currency',
    'stripePaymentId',
    'createdAt',
  ];

  // Заголовки для листа верификации
  const verificationHeaders = [
    'userId',
    'token',
    'createdAt',
    'expiresAt',
    'isUsed',
  ];

  try {
    // Устанавливаем заголовки для листа пользователей
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.USERS}!A1:L1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [userHeaders],
      },
    });

    // Устанавливаем заголовки для листа заказов
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.ORDERS}!A1:H1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [orderHeaders],
      },
    });

    // Устанавливаем заголовки для листа верификации
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.VERIFICATION}!A1:E1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [verificationHeaders],
      },
    });

    console.log('Headers initialized successfully');
  } catch (error) {
    console.error('Error initializing headers:', error);
    throw error;
  }
}

/**
 * Сохранение пользователя в Google Sheets
 */
export async function saveUser(user: User): Promise<void> {
  try {
    const values = [
      [
        user.id,
        user.username,
        user.email,
        user.isVerified,
        user.name || '',
        user.phone || '',
        user.country || '',
        user.street || '',
        user.house || '',
        user.apartment || '',
        '', // stripeCustomerId
        new Date().toISOString(),
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEETS.USERS}!A:L`,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    console.log(`User saved to Google Sheets: ${user.email}`);
  } catch (error) {
    console.error('Error saving user to Google Sheets:', error);
    throw error;
  }
}

/**
 * Обновление данных пользователя в Google Sheets
 */
export async function updateUser(user: User): Promise<void> {
  try {
    // Сначала находим строку с пользователем по ID
    const userRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.USERS}!A:A`,
    });

    const rows = userRows.data.values || [];
    let rowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] == user.id) {
        rowIndex = i + 1; // +1 потому что в Google Sheets индексация с 1
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`User with id ${user.id} not found in Google Sheets`);
    }

    // Обновляем данные пользователя
    const values = [
      [
        user.id,
        user.username,
        user.email,
        user.isVerified,
        user.name || '',
        user.phone || '',
        user.country || '',
        user.street || '',
        user.house || '',
        user.apartment || '',
        '', // stripeCustomerId
        new Date().toISOString(),
      ],
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.USERS}!A${rowIndex}:L${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    console.log(`User updated in Google Sheets: ${user.email}`);
  } catch (error) {
    console.error('Error updating user in Google Sheets:', error);
    throw error;
  }
}

/**
 * Удаление пользователя из Google Sheets
 */
export async function deleteUser(userId: number): Promise<void> {
  try {
    // Находим строку с пользователем по ID
    const userRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.USERS}!A:A`,
    });

    const rows = userRows.data.values || [];
    let rowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] == userId) {
        rowIndex = i + 1; // +1 потому что в Google Sheets индексация с 1
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`User with id ${userId} not found in Google Sheets`);
    }

    // Очищаем строку с пользователем
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${SHEETS.USERS}!A${rowIndex}:L${rowIndex}`,
    });

    console.log(`User deleted from Google Sheets: ID ${userId}`);
  } catch (error) {
    console.error('Error deleting user from Google Sheets:', error);
    throw error;
  }
}

/**
 * Сохранение токена верификации в Google Sheets
 */
export async function saveVerificationToken(
  userId: number, 
  token: string, 
  expiresInHours: number = 24
): Promise<void> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);

    const values = [
      [
        userId,
        token,
        now.toISOString(),
        expiresAt.toISOString(),
        false,
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEETS.VERIFICATION}!A:E`,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    console.log(`Verification token saved for user ID: ${userId}`);
  } catch (error) {
    console.error('Error saving verification token:', error);
    throw error;
  }
}

/**
 * Верификация токена в Google Sheets
 */
export async function verifyToken(token: string): Promise<number | null> {
  try {
    // Получаем все токены верификации
    const tokens = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.VERIFICATION}!A:E`,
    });

    const rows = tokens.data.values || [];
    let rowIndex = -1;
    let userId = null;

    // Пропускаем заголовок
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === token && rows[i][4] === 'false') {
        rowIndex = i + 1; // +1 потому что в Google Sheets индексация с 1
        userId = parseInt(rows[i][0], 10);
        break;
      }
    }

    if (rowIndex === -1 || userId === null) {
      return null;
    }

    // Проверяем, что токен не истек
    const expiresAt = new Date(rows[rowIndex - 1][3]);
    if (expiresAt < new Date()) {
      return null; // Токен истек
    }

    // Отмечаем токен как использованный
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.VERIFICATION}!E${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['true']],
      },
    });

    return userId;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Сохранение заказа в Google Sheets
 */
export async function saveOrder(order: Order): Promise<void> {
  try {
    const values = [
      [
        order.id,
        order.userId,
        order.productId,
        order.status,
        order.amount,
        order.currency,
        order.stripePaymentId || '',
        new Date().toISOString(),
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEETS.ORDERS}!A:H`,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    console.log(`Order saved to Google Sheets: ID ${order.id}`);
  } catch (error) {
    console.error('Error saving order to Google Sheets:', error);
    throw error;
  }
}

/**
 * Обновление статуса заказа в Google Sheets
 */
export async function updateOrderStatus(
  orderId: number, 
  status: string
): Promise<void> {
  try {
    // Находим строку с заказом по ID
    const orderRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.ORDERS}!A:A`,
    });

    const rows = orderRows.data.values || [];
    let rowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] == orderId) {
        rowIndex = i + 1; // +1 потому что в Google Sheets индексация с 1
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Order with id ${orderId} not found in Google Sheets`);
    }

    // Обновляем статус заказа
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.ORDERS}!D${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[status]],
      },
    });

    console.log(`Order status updated in Google Sheets: ID ${orderId}, status: ${status}`);
  } catch (error) {
    console.error('Error updating order status in Google Sheets:', error);
    throw error;
  }
}

/**
 * Получение списка заказов пользователя из Google Sheets
 */
export async function getUserOrders(userId: number): Promise<Order[]> {
  try {
    // Получаем все заказы
    const ordersData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.ORDERS}!A:H`,
    });

    const rows = ordersData.data.values || [];
    const orders: Order[] = [];

    // Пропускаем заголовок
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (parseInt(row[1], 10) === userId) {
        orders.push({
          id: parseInt(row[0], 10),
          userId: parseInt(row[1], 10),
          productId: parseInt(row[2], 10),
          status: row[3],
          amount: parseInt(row[4], 10),
          currency: row[5],
          stripePaymentId: row[6] || undefined,
          createdAt: new Date(row[7]),
        });
      }
    }

    return orders;
  } catch (error) {
    console.error('Error getting user orders from Google Sheets:', error);
    return [];
  }
}

/**
 * Обновление stripePaymentId заказа в Google Sheets
 */
export async function updateOrderPaymentId(
  orderId: number, 
  paymentId: string
): Promise<void> {
  try {
    // Находим строку с заказом по ID
    const orderRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.ORDERS}!A:A`,
    });

    const rows = orderRows.data.values || [];
    let rowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] == orderId) {
        rowIndex = i + 1; // +1 потому что в Google Sheets индексация с 1
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Order with id ${orderId} not found in Google Sheets`);
    }

    // Обновляем paymentId заказа
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.ORDERS}!G${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[paymentId]],
      },
    });

    console.log(`Order payment ID updated in Google Sheets: ID ${orderId}, paymentId: ${paymentId}`);
  } catch (error) {
    console.error('Error updating order payment ID in Google Sheets:', error);
    throw error;
  }
}