import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-roboto pb-16">
      <Header />
      <main className="flex-1 px-4 pt-4 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
