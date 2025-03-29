import { useLocation, useRoute } from "wouter";

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const [isShopActive] = useRoute("/");
  const [isAccountActive] = useRoute("/account");

  return (
    <nav className="sticky bottom-0 w-full h-16 bg-white shadow-md flex items-center justify-around z-50 rounded-b-md">
      <button 
        className="flex flex-col items-center justify-center w-1/2 transition-colors"
        onClick={() => setLocation("/")}
      >
        <span className={`material-icons ${isShopActive ? "text-primary" : "text-gray-500"}`}>
          shopping_bag
        </span>
        <span className={`text-xs mt-1 ${isShopActive ? "text-primary font-medium" : "text-gray-500"}`}>
          Shop
        </span>
      </button>
      <button 
        className="flex flex-col items-center justify-center w-1/2 transition-colors"
        onClick={() => setLocation("/account")}
      >
        <span className={`material-icons ${isAccountActive ? "text-primary" : "text-gray-500"}`}>
          person
        </span>
        <span className={`text-xs mt-1 ${isAccountActive ? "text-primary font-medium" : "text-gray-500"}`}>
          Account
        </span>
      </button>
    </nav>
  );
}
