import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "@/types";
import { getLocaleFromCountry } from "./LocaleContext";

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUserCountry?: (userId: number, country: string) => Promise<User | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Initialize user from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log("[AppContext] Loading user from localStorage:", {
          id: userData.id,
          username: userData.username,
          country: userData.country,
          shouldUseEUR: userData.country ? [
            'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
            'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
            'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
          ].includes(userData.country) : false
        });
        setUser(userData);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    } else {
      console.log("[AppContext] No user found in localStorage");
    }
    
    // При монтировании компонента проверяем сессию на сервере
    const checkServerSession = async () => {
      try {
        console.log("[AppContext] Checking server session...");
        const response = await fetch('/api/users/me');
        console.log("[AppContext] Server session response status:", response.status);
        
        if (response.ok) {
          const serverUserData = await response.json();
          console.log("[AppContext] Server session data:", {
            id: serverUserData.id,
            username: serverUserData.username,
            country: serverUserData.country
          });
          
          // Если данные из API отличаются от localStorage, обновляем
          if (serverUserData.id) {
            const localUser = storedUser ? JSON.parse(storedUser) : null;
            
            if (!localUser || serverUserData.id !== localUser.id ||
                serverUserData.country !== localUser.country) {
              console.log("[AppContext] Sync mismatch between server and localStorage, updating...");
              setUser(serverUserData);
              localStorage.setItem("user", JSON.stringify(serverUserData));
            }
          }
        } else if (response.status === 401) {
          console.log("[AppContext] No active server session (401 Unauthorized)");
        } else {
          console.warn("[AppContext] Server session check failed:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("[AppContext] Error checking server session:", error);
      }
    };
    
    checkServerSession();
  }, []);
  
  const isAuthenticated = !!user;
  
  // Функция для обновления языка на основе страны пользователя
  const updateLocaleBasedOnCountry = (country: string | undefined | null) => {
    if (country) {
      // Проверяем, выбирал ли пользователь язык вручную
      const savedLocale = localStorage.getItem("locale");
      const isAutomaticLocale = !savedLocale || savedLocale === "en";
      
      // Если локаль установлена автоматически или это первый вход, обновляем на основе страны
      if (isAutomaticLocale) {
        const newLocale = getLocaleFromCountry(country);
        console.log(`[AppContext] Updating locale based on country ${country} to ${newLocale}`);
        localStorage.setItem("locale", newLocale);
        
        // Запускаем событие для LocaleContext
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'locale',
          newValue: newLocale,
          oldValue: savedLocale || null,
          storageArea: localStorage
        }));
      }
    }
  };

  const login = (userData: User) => {
    console.log("[AppContext] Login user:", {
      id: userData.id,
      username: userData.username,
      country: userData.country
    });
    
    // Обновляем язык на основе страны пользователя при входе
    updateLocaleBasedOnCountry(userData.country);
    
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };
  
  const logout = async () => {
    try {
      // Вызов серверного API для выхода и уничтожения сессии
      await fetch('/api/users/logout', { 
        method: 'POST',
        credentials: 'include' // Важно: отправляем сессионные cookie
      });
    } catch (error) {
      console.error("[AppContext] Error during logout:", error);
    } finally {
      // Локальная очистка состояния
      setUser(null);
      localStorage.removeItem("user");
    }
  };
  
  // Функция для обновления страны пользователя
  const updateUserCountry = async (userId: number, country: string): Promise<User | null> => {
    if (!user) return null;
    
    try {
      const response = await fetch(`/api/users/${userId}/country`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update country: ${response.status} ${response.statusText}`);
      }
      
      const updatedUser = await response.json();
      console.log("[AppContext] User country updated:", {
        id: updatedUser.id,
        username: updatedUser.username,
        country: updatedUser.country
      });
      
      // Обновляем пользователя в состоянии и localStorage
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Обновляем язык на основе новой страны
      updateLocaleBasedOnCountry(updatedUser.country);
      
      return updatedUser;
    } catch (error) {
      console.error("[AppContext] Error updating user country:", error);
      return null;
    }
  };
  
  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        login,
        logout,
        updateUserCountry
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
