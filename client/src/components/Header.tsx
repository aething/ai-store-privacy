
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useProductsSync } from '@/hooks/use-products-sync';

export function Header() {
  const { syncProducts, isSyncing } = useProductsSync();
  
  return (
    <header className="border-b py-4">
      <div className="container flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          AI Store
        </Link>
        <div className="flex gap-4">
          <Button 
            onClick={syncProducts} 
            disabled={isSyncing}
            variant="outline"
            size="sm"
          >
            {isSyncing ? 'Синхронизация...' : 'Синхронизировать с Stripe'}
          </Button>
          <Link to="/cart">
            <Button variant="ghost">Корзина</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

import { useLocation } from "wouter";
import { Bell } from "lucide-react";

export default function Header() {
  const [, setLocation] = useLocation();

  return (
    <header className="bg-primary text-white p-3 flex justify-between items-center shadow-md z-10 rounded-t-md">
      <h1 className="text-lg font-medium">
        <span className="text-black italic">AI Store by</span> <span className="text-orange-700 font-bold italic">Aething</span>
      </h1>
      <button className="text-2xl text-white">
        <Bell size={24} />
      </button>
    </header>
  );
}
