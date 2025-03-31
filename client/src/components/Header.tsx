
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
