import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "@/types";

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
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
  
  const login = (userData: User) => {
    console.log("[AppContext] Login user:", {
      id: userData.id,
      username: userData.username,
      country: userData.country
    });
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };
  
  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        login,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
