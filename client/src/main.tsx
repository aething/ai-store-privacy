import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Импортируем стили 
import "./styles/material-icons.css";
import "./styles/animations.css";

createRoot(document.getElementById("root")!).render(<App />);
