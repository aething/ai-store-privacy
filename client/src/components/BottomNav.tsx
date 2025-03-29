import { useLocation, useRoute } from "wouter";

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const [isShopActive] = useRoute("/");
  const [isAccountActive] = useRoute("/account");

  return (
    <nav className="fixed bottom-0 left-0 w-full h-16 bg-white shadow-md flex items-center justify-around z-50">
      <button 
        className="flex flex-col items-center justify-center w-1/2 transition-colors"
        onClick={() => setLocation("/")}
      >
        <span className={`material-icons ${isShopActive ? "text-primary" : "text-text-secondary"}`}>
          shopping_bag
        </span>
        <span className={`text-xs mt-1 ${isShopActive ? "text-primary font-medium" : "text-text-secondary"}`}>
          Shop
        </span>
      </button>
      <button 
        className="flex flex-col items-center justify-center w-1/2 transition-colors"
        onClick={() => setLocation("/account")}
      >
        <span className={`material-icons ${isAccountActive ? "text-primary" : "text-text-secondary"}`}>
          person
        </span>
        <span className={`text-xs mt-1 ${isAccountActive ? "text-primary font-medium" : "text-text-secondary"}`}>
          Account
        </span>
      </button>
    </nav>
  );
}
