/**
 * Утилиты для управления страной пользователя
 * Решает проблему с кэшированием и обеспечивает согласованное обновление
 */

import { apiRequest } from "@/lib/queryClient";
import { User } from "@/types";

/**
 * Обновляет страну пользователя на сервере и в localStorage
 * Возвращает обновленные данные пользователя в случае успеха
 */
export async function updateUserCountry(
  userId: number, 
  country: string, 
  currentUserData: Partial<User>
): Promise<User | null> {
  try {
    console.log(`[userCountryUtils] Updating user country from ${currentUserData.country} to ${country}`);
    
    // Создаем объект с данными для обновления, сохраняя все остальные данные
    const updateData = {
      name: currentUserData.name || "",
      phone: currentUserData.phone || "",
      country: country,
      street: currentUserData.street || "",
      house: currentUserData.house || "",
      apartment: currentUserData.apartment || ""
    };
    
    // Отправляем запрос на сервер
    const response = await apiRequest("PUT", `/api/users/${userId}`, updateData);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[userCountryUtils] Error updating country: ${response.status} ${errorText}`);
      throw new Error(`Failed to update user country: ${response.status}`);
    }
    
    // Получаем обновленные данные пользователя
    const updatedUser = await response.json();
    console.log("[userCountryUtils] User updated successfully:", updatedUser);
    
    // Обновляем данные в localStorage
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        const newUserData = { ...parsedUserData, ...updatedUser };
        localStorage.setItem("user", JSON.stringify(newUserData));
        console.log("[userCountryUtils] localStorage updated with new country");
      } catch (error) {
        console.error("[userCountryUtils] Error updating localStorage:", error);
      }
    }
    
    return updatedUser;
  } catch (error) {
    console.error("[userCountryUtils] Error in updateUserCountry:", error);
    return null;
  }
}

/**
 * Очищает кэш, связанный с налоговой информацией и сессией,
 * чтобы обеспечить корректное отображение после смены страны
 */
import { clearTaxCache as clearTaxCacheUtil, clearSessionCache } from "./clearCache";

export function clearTaxCache() {
  console.log("[userCountryUtils] Clearing tax and session cache");
  
  // Используем утилиту для очистки кэша, связанного с налогами
  clearTaxCacheUtil([
    "tax_info", 
    "price_cache", 
    "checkout_data", 
    "currency_data",
    "product_prices"
  ]);
  
  // Также очищаем кэш, связанный с сессией
  clearSessionCache();
  
  // Добавляем метку времени для предотвращения кэширования
  localStorage.setItem("cache_buster", Date.now().toString());
}

/**
 * Обновляет страну пользователя и перезагружает страницу для применения изменений
 */
export async function updateCountryAndReload(
  userId: number, 
  country: string, 
  currentUserData: Partial<User>,
  reloadDelay = 1000
): Promise<void> {
  try {
    // Обновляем страну пользователя
    const updatedUser = await updateUserCountry(userId, country, currentUserData);
    
    if (updatedUser) {
      // Очищаем кэш перед перезагрузкой
      clearTaxCache();
      
      console.log(`[userCountryUtils] Country updated to ${country}, reloading page in ${reloadDelay}ms...`);
      
      // Перезагружаем страницу после короткой задержки
      setTimeout(() => {
        window.location.reload();
      }, reloadDelay);
    }
  } catch (error) {
    console.error("[userCountryUtils] Error updating country and reloading:", error);
    throw error;
  }
}