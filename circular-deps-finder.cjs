/**
 * Инструмент для поиска циклических зависимостей в React-приложении
 * 
 * Запуск:
 * node circular-deps-finder.js client/src
 */

const fs = require('fs');
const path = require('path');

// Регулярное выражение для поиска импортов
const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+[^,]*|[^,{}\s*]+)\s+from\s+['"]([^'"]+)['"]/g;

// Карта модулей и их зависимостей
const moduleMap = new Map();
// Список файлов React-компонентов
const reactComponents = new Set();

// Функция для поиска всех файлов JavaScript/TypeScript в папке
function findFiles(dir, extensions) {
  if (!fs.existsSync(dir)) {
    console.error(`Директория не существует: ${dir}`);
    process.exit(1);
  }

  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, extensions));
    } else {
      const ext = path.extname(filePath);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Функция для определения абсолютного пути импорта
function resolvePath(importPath, currentFile) {
  // Игнорируем модули из node_modules
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return null;
  }
  
  // Получаем директорию текущего файла
  const currentDir = path.dirname(currentFile);
  let resolvedPath;
  
  if (importPath.startsWith('.')) {
    // Относительный путь
    resolvedPath = path.resolve(currentDir, importPath);
  } else {
    // Абсолютный путь
    resolvedPath = path.resolve(process.cwd(), importPath.slice(1));
  }
  
  // Проверяем, существует ли файл с указанным расширением
  const extensions = ['.js', '.jsx', '.ts', '.tsx'];
  
  for (const ext of extensions) {
    if (fs.existsSync(resolvedPath + ext)) {
      return resolvedPath + ext;
    }
  }
  
  // Проверяем, есть ли index файл в директории
  for (const ext of extensions) {
    const indexPath = path.join(resolvedPath, `index${ext}`);
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }
  }
  
  return null;
}

// Функция для анализа импортов файла
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  let match;
  
  // Проверка, является ли файл React-компонентом
  if (content.includes('React') || content.includes('react') || 
      content.includes('function ') && content.includes('return (') ||
      content.includes('export default') && content.includes('return (')) {
    reactComponents.add(filePath);
  }
  
  // Проверка, есть ли в файле использование хуков
  if (content.includes('use') && 
      (content.includes('useState') || content.includes('useEffect') || 
       content.includes('useContext') || content.includes('useRef') || 
       content.includes('useCallback') || content.includes('useMemo'))) {
    // Вероятно, файл использует хуки
    if (reactComponents.has(filePath) || filePath.includes('hooks')) {
      console.log(`\x1b[36m[Hook] ${filePath}\x1b[0m`);
    }
  }
  
  // Получаем все импорты
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const resolvedPath = resolvePath(importPath, filePath);
    
    if (resolvedPath) {
      imports.push(resolvedPath);
    }
  }
  
  // Добавляем файл и его импорты в карту модулей
  moduleMap.set(filePath, imports);
}

// Функция для поиска циклических зависимостей
function findCyclicDependencies(moduleMap) {
  const cyclicPaths = [];
  
  function dfs(currentModule, visited, path) {
    if (visited.has(currentModule)) {
      // Нашли цикл
      const cycleStart = path.indexOf(currentModule);
      if (cycleStart !== -1) {
        cyclicPaths.push([...path.slice(cycleStart), currentModule]);
      }
      return;
    }
    
    visited.add(currentModule);
    path.push(currentModule);
    
    const dependencies = moduleMap.get(currentModule) || [];
    
    for (const dependency of dependencies) {
      dfs(dependency, new Set(visited), [...path]);
    }
  }
  
  // Запускаем DFS для каждого модуля
  for (const [module] of moduleMap) {
    dfs(module, new Set(), []);
  }
  
  return cyclicPaths;
}

// Функция для анализа хуков в циклических зависимостях
function analyzeHooksInCycles(cyclicPaths) {
  const hookProblems = [];
  
  for (const cycle of cyclicPaths) {
    const hooksInCycle = cycle.filter(file => 
      file.includes('hooks') || file.includes('Hook') || file.includes('hook')
    );
    
    if (hooksInCycle.length > 0) {
      hookProblems.push({
        cycle,
        hooksInCycle
      });
    }
  }
  
  return hookProblems;
}

// Основная функция
function main() {
  const dir = process.argv[2] || 'client/src';
  const files = findFiles(dir, ['.js', '.jsx', '.ts', '.tsx']);
  
  console.log(`\nАнализируем ${files.length} файлов в директории ${dir}...\n`);
  
  // Анализируем каждый файл
  files.forEach(file => {
    try {
      analyzeFile(file);
    } catch (error) {
      console.error(`Ошибка при анализе файла ${file}:`, error);
    }
  });
  
  // Ищем циклические зависимости
  const cyclicPaths = findCyclicDependencies(moduleMap);
  
  if (cyclicPaths.length === 0) {
    console.log('✅ Циклических зависимостей не обнаружено!');
  } else {
    console.log(`\x1b[31m❌ Обнаружено ${cyclicPaths.length} циклических зависимостей!\x1b[0m\n`);
    
    cyclicPaths.forEach((cycle, i) => {
      console.log(`\x1b[33mЦикл #${i + 1}:\x1b[0m`);
      cycle.forEach((module, j) => {
        // Делаем относительным для удобства
        const relPath = path.relative(process.cwd(), module);
        if (j < cycle.length - 1) {
          console.log(`  ${relPath} ->`);
        } else {
          console.log(`  ${relPath} -> (цикл)`);
        }
      });
      console.log();
    });
    
    // Анализируем проблемы с хуками
    const hookProblems = analyzeHooksInCycles(cyclicPaths);
    
    if (hookProblems.length > 0) {
      console.log('\x1b[31m🚨 ВНИМАНИЕ! Обнаружены циклические зависимости с хуками!\x1b[0m');
      console.log('Это может вызывать ошибки "Invalid hook call" в React.\n');
      
      hookProblems.forEach((problem, i) => {
        console.log(`\x1b[33mПроблема с хуками #${i + 1}:\x1b[0m`);
        console.log('Хуки в цикле:');
        problem.hooksInCycle.forEach(hook => {
          const relPath = path.relative(process.cwd(), hook);
          console.log(`  - ${relPath}`);
        });
        console.log();
      });
      
      console.log('\x1b[32mРекомендации по исправлению:\x1b[0m');
      console.log('1. Вынесите хуки в отдельные файлы, которые не имеют импортов из компонентов');
      console.log('2. Используйте нисходящую архитектуру: компоненты более высокого уровня импортируют компоненты более низкого уровня, а не наоборот');
      console.log('3. Рассмотрите использование контекста React для передачи состояния между компонентами вместо прямых импортов');
      console.log('4. Объедините связанные компоненты в один файл, если это возможно\n');
    }
  }
  
  // Выводим статистику
  console.log(`\nСтатистика:`);
  console.log(`Всего файлов: ${files.length}`);
  console.log(`React-компонентов: ${reactComponents.size}`);
  console.log(`Обнаружено циклических зависимостей: ${cyclicPaths.length}`);
}

main();