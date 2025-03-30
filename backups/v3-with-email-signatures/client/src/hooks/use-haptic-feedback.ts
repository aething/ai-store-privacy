/**
 * Хук для тактильной обратной связи (вибрации)
 * Использует Vibration API для устройств, которые его поддерживают
 */

type HapticPatternType = 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy' | 'selection';

const patterns: Record<HapticPatternType, number[]> = {
  // Короткая вибрация для легких действий
  light: [15],
  
  // Средняя вибрация для обычных действий
  medium: [30],
  
  // Сильная вибрация для важных действий
  heavy: [50],
  
  // Двойная вибрация для успешных действий
  success: [20, 30, 60],
  
  // Три быстрых вибрации для предупреждений
  warning: [30, 20, 30, 20, 30],
  
  // Длинная вибрация для ошибок
  error: [100, 30, 100],
  
  // Очень короткая вибрация для выделения элементов
  selection: [10]
};

// Определяем, поддерживается ли Vibration API в браузере
const isVibrationSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

/**
 * Функция для проверки, включены ли тактильные эффекты в настройках устройства
 * К сожалению, нет прямого API для проверки, поэтому предполагаем, что доступно
 */
const isHapticFeedbackEnabled = (): boolean => {
  // Проверяем настройки в localStorage, если пользователь ранее их изменял
  const storedPreference = localStorage.getItem('hapticFeedbackEnabled');
  if (storedPreference !== null) {
    return storedPreference === 'true';
  }
  
  // По умолчанию, если Vibration API поддерживается, предполагаем, что
  // тактильная обратная связь включена
  return isVibrationSupported;
};

/**
 * Функция для включения/отключения тактильной обратной связи
 */
const setHapticFeedbackEnabled = (enabled: boolean): void => {
  localStorage.setItem('hapticFeedbackEnabled', enabled.toString());
};

/**
 * Функция для воспроизведения тактильной обратной связи
 * @param pattern Тип паттерна вибрации или пользовательский массив длительностей
 */
const triggerHapticFeedback = (pattern: HapticPatternType | number[] = 'medium'): boolean => {
  // Если тактильная обратная связь отключена или не поддерживается, ничего не делаем
  if (!isHapticFeedbackEnabled() || !isVibrationSupported) {
    return false;
  }
  
  try {
    // Определяем паттерн для вибрации
    const vibrationPattern = typeof pattern === 'string' ? patterns[pattern] : pattern;
    
    // Запускаем вибрацию
    navigator.vibrate(vibrationPattern);
    return true;
  } catch (error) {
    console.error('Failed to trigger haptic feedback:', error);
    return false;
  }
};

/**
 * Хук для использования тактильной обратной связи
 */
export function useHapticFeedback() {
  return {
    isVibrationSupported,
    isHapticFeedbackEnabled,
    setHapticFeedbackEnabled,
    triggerHapticFeedback,
    patterns
  };
}

// Экспортируем также утилиты для прямого использования
export {
  isVibrationSupported,
  isHapticFeedbackEnabled,
  setHapticFeedbackEnabled,
  triggerHapticFeedback,
  patterns
};