import { useLocation } from "wouter";

export default function Header() {
  const [, setLocation] = useLocation();

  return (
    <header className="bg-primary text-white p-4 flex justify-between items-center shadow-md z-10">
      <h1 className="text-xl font-medium">AI Store by Aething</h1>
      <button className="material-icons">notifications</button>
    </header>
  );
}
