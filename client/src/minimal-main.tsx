import { createRoot } from "react-dom/client";
import MinimalApp from "./MinimalApp";

// Простая инициализация React без дополнительных контекстов и хуков
console.log("Инициализация минимального приложения React...");

// Стандартный способ монтирования React 18+
const rootElement = document.getElementById("root");

if (rootElement) {
  console.log("Элемент root найден, создаём корневой компонент React");
  const root = createRoot(rootElement);
  
  console.log("Рендерим минимальное приложение");
  root.render(<MinimalApp />);
  
  console.log("Рендеринг завершён");
} else {
  console.error("Элемент root не найден в DOM");
}