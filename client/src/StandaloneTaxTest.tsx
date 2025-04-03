import React from 'react';
import ReactDOM from 'react-dom/client';
import TaxTestPage from './pages/TaxTestPage';
import { Toaster } from "@/components/ui/toaster";
import './index.css';

// Простое автономное приложение без сложных контекстов
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="max-w-4xl mx-auto">
      <TaxTestPage />
      <Toaster />
    </div>
  </React.StrictMode>,
);