import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./material-icons.css"; // Импортируем Material Icons CSS

// Глобальная обработка ошибок для предотвращения падения приложения
window.addEventListener('error', (event) => {
  console.error('Глобальная ошибка:', event.error);
  
  // Предотвращаем дальнейшее распространение ошибки, если она связана со Stripe
  if (event.message && event.message.includes('Stripe')) {
    console.warn('Подавлена ошибка, связанная со Stripe');
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
