
import { useLocation } from "wouter";
import { Bell } from "lucide-react";

export default function Header() {
  const [, setLocation] = useLocation();

  return (
    <header className="bg-primary text-white p-3 flex justify-between items-center shadow-md z-10 rounded-t-md">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-black">AI Store</h1>
        <span className="text-sm italic text-orange-500">by Aething</span>
      </div>
      <button className="text-2xl text-white">
        <Bell size={24} />
      </button>
    </header>
  );
}
