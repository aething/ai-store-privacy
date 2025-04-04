/**
 * Модуль для обработки и хранения логов ошибок мобильного приложения
 */

import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';

// Папка для хранения логов
const LOGS_DIR = path.join(process.cwd(), 'logs');

// Максимальный размер файла логов (10MB)
const MAX_LOG_FILE_SIZE = 10 * 1024 * 1024;

// Проверяем наличие папки для логов
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Обработчик для сохранения логов, получаемых от клиентов
 */
export const saveClientLogs = async (req: Request, res: Response) => {
  try {
    const logs = req.body;
    
    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ message: 'Invalid logs data' });
    }
    
    // Группируем логи по типу
    const logsByType: Record<string, any[]> = {};
    
    logs.forEach(log => {
      const type = log.type || 'unknown';
      if (!logsByType[type]) {
        logsByType[type] = [];
      }
      
      // Добавляем IP адрес и User-Agent
      log.clientInfo = {
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      };
      
      logsByType[type].push(log);
    });
    
    // Сохраняем логи в соответствующие файлы
    for (const [type, typeLogs] of Object.entries(logsByType)) {
      const logFilePath = path.join(LOGS_DIR, `${type}.log`);
      
      // Проверяем размер файла и создаем новый если нужно
      let filePath = logFilePath;
      if (fs.existsSync(logFilePath)) {
        const stats = fs.statSync(logFilePath);
        if (stats.size > MAX_LOG_FILE_SIZE) {
          const timestamp = new Date().toISOString().replace(/:/g, '-');
          filePath = path.join(LOGS_DIR, `${type}-${timestamp}.log`);
        }
      }
      
      // Добавляем логи в файл
      const logData = typeLogs.map(log => JSON.stringify(log)).join('\n') + '\n';
      fs.appendFileSync(filePath, logData, 'utf8');
    }
    
    // Отправляем уведомление о критических ошибках
    const criticalLogs = logs.filter(log => 
      log.type === 'app_crash' || 
      log.type === 'payment_error' ||
      (log.type === 'error' && log.additionalData?.isCritical)
    );
    
    if (criticalLogs.length > 0) {
      // Здесь можно добавить логику для отправки уведомлений
      // например, через email или webhook
      console.warn(`[CRITICAL LOGS] Received ${criticalLogs.length} critical errors`);
    }
    
    return res.status(200).json({ success: true, count: logs.length });
  } catch (error) {
    console.error('Error saving logs:', error);
    return res.status(500).json({ message: 'Failed to save logs' });
  }
};

/**
 * Получение статистики по логам
 */
export const getLogsStats = async (req: Request, res: Response) => {
  try {
    // Проверяем права администратора
    if (!req.isAuthenticated() || !req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const stats: Record<string, { count: number, lastUpdated: Date | null }> = {};
    const files = fs.readdirSync(LOGS_DIR);
    
    for (const file of files) {
      if (!file.endsWith('.log')) continue;
      
      const filePath = path.join(LOGS_DIR, file);
      const stat = fs.statSync(filePath);
      
      // Определяем тип лога из имени файла
      const logType = file.split('-')[0].replace('.log', '');
      
      if (!stats[logType]) {
        stats[logType] = { count: 0, lastUpdated: null };
      }
      
      // Подсчитываем количество записей в файле
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      
      stats[logType].count += lines.length;
      
      // Обновляем дату последнего изменения
      if (!stats[logType].lastUpdated || stat.mtime > stats[logType].lastUpdated) {
        stats[logType].lastUpdated = stat.mtime;
      }
    }
    
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting logs stats:', error);
    return res.status(500).json({ message: 'Failed to get logs stats' });
  }
};

/**
 * Получение последних логов определенного типа
 */
export const getRecentLogs = async (req: Request, res: Response) => {
  try {
    // Проверяем права администратора
    if (!req.isAuthenticated() || !req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const { type } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    // Ищем файлы логов указанного типа
    const logFiles = fs.readdirSync(LOGS_DIR)
      .filter(file => file.startsWith(`${type}.`) || file.startsWith(`${type}-`))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(LOGS_DIR, a));
        const statB = fs.statSync(path.join(LOGS_DIR, b));
        return statB.mtime.getTime() - statA.mtime.getTime(); // Сортируем по дате изменения (новые первыми)
      });
    
    if (logFiles.length === 0) {
      return res.status(404).json({ message: `No logs found for type: ${type}` });
    }
    
    // Читаем последние записи из самого свежего файла
    const latestFile = logFiles[0];
    const filePath = path.join(LOGS_DIR, latestFile);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Разбиваем файл на отдельные JSON-записи
    const lines = content.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return { raw: line, parseError: true };
        }
      });
    
    // Возвращаем последние записи
    const recentLogs = lines.slice(-limit);
    
    return res.status(200).json({
      type,
      count: recentLogs.length,
      total: lines.length,
      logs: recentLogs
    });
  } catch (error) {
    console.error(`Error getting logs for type ${req.params.type}:`, error);
    return res.status(500).json({ message: 'Failed to get logs' });
  }
};

export default {
  saveClientLogs,
  getLogsStats,
  getRecentLogs
};