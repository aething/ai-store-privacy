import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { formatPrice } from "@/lib/currency";
import { TaxDisplayBox } from "@/components/TaxDisplayBox";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function TaxTestPage() {
  const { user } = useAppContext();
  const [, setLocation] = useLocation();
  
  // Тестовые данные
  const baseAmount = 276000; // 2760 EUR в минимальных единицах (центах)
  const currency = "eur";
  
  // Расчет налога
  const taxRate = user?.country === "DE" ? 0.19 : 0;
  const taxAmount = Math.round(baseAmount * taxRate);
  const totalAmount = baseAmount + taxAmount;
  
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
          <h2 className="font-medium mb-2">Данные пользователя:</h2>
          <pre className="bg-gray-800 text-white p-2 rounded overflow-x-auto text-xs">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        <div className="space-y-6">
          <section>
            <h2 className="font-bold text-lg mb-3">1. Базовая таблица с налогами</h2>
            <table className="w-full">
              <tbody>
                <tr className="mb-2">
                  <td className="text-left pb-2">Subtotal</td>
                  <td className="text-right pb-2">{formatPrice(baseAmount, currency, false)}</td>
                </tr>
                
                <tr className="mb-2 bg-yellow-50">
                  <td className="text-left pb-2 pt-2 font-medium">
                    <span className="flex items-center">
                      {user?.country === "DE" ? "MwSt. 19%" : "No Tax"}
                      <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-1 py-0.5 rounded">{user?.country || "Unknown"}</span>
                    </span>
                  </td>
                  <td className="text-right pb-2 pt-2 font-medium">
                    {formatPrice(taxAmount, currency, false)}
                  </td>
                </tr>
                
                <tr className="mb-2 bg-blue-50">
                  <td colSpan={2} className="text-left pb-2 pt-2 px-2 text-xs text-blue-600 italic rounded">
                    {user?.country === "DE" 
                      ? "* Prices exclude VAT (19%), which is added at checkout" 
                      : "* Tax rates are calculated based on your location"}
                  </td>
                </tr>
                
                <tr className="mb-2">
                  <td className="text-left pb-2">Shipping</td>
                  <td className="text-right pb-2">Free</td>
                </tr>
                
                <tr className="font-bold text-lg bg-green-50">
                  <td className="text-left pt-2 pb-2 border-t">Total</td>
                  <td className="text-right pt-2 pb-2 border-t">
                    {formatPrice(totalAmount, currency, false)}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
          
          <div className="border-t pt-4">
            <h2 className="font-bold text-lg mb-3">2. Компонент TaxDisplayBox</h2>
            <TaxDisplayBox 
              country={user?.country || "DE"} 
              currency={currency} 
              amount={baseAmount}
              showDebugInfo={true} 
            />
          </div>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={() => setLocation("/checkout/1")}
          >
            Перейти на страницу оформления заказа
          </button>
        </div>
      </Card>
    </div>
  );
}