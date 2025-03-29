import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 py-8 px-4">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-black" style={{ height: "90vh" }}>
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-7 bg-black rounded-b-xl z-10"></div>
        
        {/* Phone Content */}
        <div className="h-full flex flex-col pt-8 bg-background font-roboto">
          {/* Маркер для скролла вверх */}
          <div id="content-top"></div>
          <Header />
          <main className="flex-1 px-4 pt-2 pb-20 overflow-y-auto">
            {children}
          </main>
          <BottomNav />
        </div>
        
        {/* Phone Button */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1/4 h-1 bg-black rounded-full"></div>
      </div>
    </div>
  );
}
