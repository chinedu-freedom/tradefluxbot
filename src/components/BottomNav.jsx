"use client";

import { Home, BarChart2, Wallet, FileText, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Mining Plans", href: "/dashboard/mining", icon: BarChart2 },
    { name: "Wallet", href: "/dashboard/wallet", icon: Wallet, isCenter: true },
    { name: "News", href: "/dashboard/news", icon: FileText },
    { name: "Account", href: "/dashboard/account", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[65px] bg-[#111827] border-t border-[#1F2937] hidden md:flex justify-center z-50">
      <div className="w-full max-w-[480px] flex justify-around items-center px-2 h-full relative">
      {navItems.map((item, index) => {
        const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard');

        if (item.isCenter) {
          return (
            <div key={index} className="relative -top-5 flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-[#0b0f19] rounded-full scale-[1.3] -z-10"></div>
              <Link
                href={item.href}
                className="w-[48px] h-[48px] bg-[#0073b6] rounded-full flex items-center justify-center shadow-md text-white hover:bg-[#00629b] transition-colors cursor-pointer"
              >
                <item.icon size={20} fill="currentColor" strokeWidth={1.5} className="text-white" />
              </Link>
            </div>
          );
        }

        return (
          <Link
            key={index}
            href={item.href}
            className={`flex flex-col items-center justify-center w-[60px] gap-1 cursor-pointer ${
              isActive ? "text-[#0073b6]" : "text-gray-400"
            }`}
           >
            <item.icon 
              size={20} 
              strokeWidth={isActive ? 2 : 1.5}
              className={isActive ? "text-[#0073b6]" : "text-gray-400"} 
              fill={isActive && item.name !== "Mining Plans" ? "currentColor" : "none"}
            />
            <span className="text-[9px] font-medium tracking-tight">{item.name}</span>
          </Link>
        );
      })}
      </div>
    </div>
  );
}
