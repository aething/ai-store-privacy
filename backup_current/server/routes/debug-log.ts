/**
 * Маршруты для отладки фронтенда
 */
import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

// Создаем экземпляр роутера
const router = Router();

// Директория для логов
const logDir = path.join(process.cwd(), 'logs');

// Убеждаемся, что директория существует
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Путь к файлу логов
const logFilePath = path.join(logDir, 'frontend-debug.log');

/**
 * Маршрут для записи логов с фронтенда
 */
router.post('/debug-log', (req: Request, res: Response) => {
  try {
    const logData = req.body;
    
    if (!logData) {
      return res.status(400).json({ error: 'No log data provided' });
    }
    
    // Добавляем пользовательский агент
    logData.userAgent = req.headers['user-agent'];
    
    // Форматируем сообщение лога
    const logMessage = `[${logData.timestamp}] [${logData.type.toUpperCase()}] ${logData.messages.join(' ')}\n`;
    
    // Записываем лог в файл
    fs.appendFileSync(logFilePath, logMessage);
    
    // Если это ошибка, выводим на консоль сервера
    if (logData.type === 'error' || logData.type === 'uncaught' || logData.type === 'unhandledrejection') {
      console.error(`Frontend Error: ${logMessage.trim()}`);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error logging debug data:', error);
    res.status(500).json({ error: 'Failed to log debug data' });
  }
});

/**
 * Маршрут для получения логов (только для режима разработки)
 */
router.get('/debug-logs', (req: Request, res: Response) => {
  try {
    // Проверяем, существует ли файл логов
    if (!fs.existsSync(logFilePath)) {
      return res.status(404).json({ message: 'No logs found' });
    }
    
    // Читаем последние 100 строк логов
    const logs = fs.readFileSync(logFilePath, 'utf8')
      .split('\n')
      .filter(Boolean)
      .slice(-100);
    
    res.json({ logs });
  } catch (error) {
    console.error('Error reading debug logs:', error);
    res.status(500).json({ error: 'Failed to read debug logs' });
  }
});

export default router;