import React from "react";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/currency";
import { ArrowLeft } from "lucide-react";

// Простая тестовая страница без сложных компонентов и хуков
export default function TaxTestPage() {
  // Тестовые данные
  const baseAmount = 276000; // 2760 EUR в минимальных единицах (центах)
  const currency = "eur";
  const countryCode = "DE"; // Фиксированная страна для теста
  
  // Расчет налога
  const taxRate = 0.19; // 19% для Германии
  const taxAmount = Math.round(baseAmount * taxRate);
  const totalAmount = baseAmount + taxAmount;
  
  // Форматирование валюты
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2
    }).format(amount / 100);
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center mb-4">
        <button 
          className="p-1 mr-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-medium">Tax Test Page</h2>
      </div>

      <Card className="p-6 mb-6 shadow-lg">
        <h1 className="text-xl font-bold mb-4">Тестовая страница для проверки отображения налогов</h1>
        
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <h2 className="font-medium mb-2">Тестовые данные:</h2>
          <div className="bg-gray-800 text-white p-2 rounded overflow-x-auto text-xs">
            <div>Страна: {countryCode}</div>
            <div>Валюта: {currency.toUpperCase()}</div>
            <div>Сумма без налога: {formatCurrency(baseAmount)}</div>
            <div>Ставка налога: {taxRate * 100}%</div>
            <div>Сумма налога: {formatCurrency(taxAmount)}</div>
            <div>Итоговая сумма: {formatCurrency(totalAmount)}</div>
          </div>
        </div>
        
        <div className="space-y-6">
          <section>
            <h2 className="font-bold text-lg mb-3">Таблица с налогами</h2>
            <table className="w-full">
              <tbody>
                <tr className="mb-2">
                  <td className="text-left pb-2">Subtotal</td>
                  <td className="text-right pb-2">{formatCurrency(baseAmount)}</td>
                </tr>
                
                <tr className="mb-2 bg-yellow-50">
                  <td className="text-left pb-2 pt-2 font-medium">
                    <span className="flex items-center">
                      MwSt. 19%
                      <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-1 py-0.5 rounded">{countryCode}</span>
                    </span>
                  </td>
                  <td className="text-right pb-2 pt-2 font-medium">
                    {formatCurrency(taxAmount)}
                  </td>
                </tr>
                
                <tr className="mb-2 bg-blue-50">
                  <td colSpan={2} className="text-left pb-2 pt-2 px-2 text-xs text-blue-600 italic rounded">
                    * Prices exclude VAT (19%), which is added at checkout
                  </td>
                </tr>
                
                <tr className="mb-2">
                  <td className="text-left pb-2">Shipping</td>
                  <td className="text-right pb-2">Free</td>
                </tr>
                
                <tr className="font-bold text-lg bg-green-50">
                  <td className="text-left pt-2 pb-2 border-t">Total</td>
                  <td className="text-right pt-2 pb-2 border-t">
                    {formatCurrency(totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={() => window.location.href = "/checkout/1"}
          >
            Перейти на страницу оформления заказа
          </button>
        </div>
      </Card>
    </div>
  );
}