"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, ShieldCheck, Key, Lock, User, ArrowLeft } from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function SettingsPage() {
  const router = useRouter();
  const { data: userRes } = useFetchData("/users/me", ["profile"]);
  const hasPin = !!userRes?.user?.has_withdrawal_pin;

  const menuItems = [
    {
      id: "profile",
      label: "My Profile",
      icon: User,
      iconBg: "bg-white/5",
      iconColor: "text-[#0073b6]",
      badge: null,
      href: "/dashboard/settings/profile"
    },

    {
      id: "login",
      label: "Login Settings",
      icon: Key,
      iconBg: "bg-white/5",
      iconColor: "text-[#0073b6]",
      badge: null,
      href: "/dashboard/settings/login"
    },

    {
      id: "payment",
      label: "Withdrawal Password",
      icon: Lock,
      iconBg: "bg-white/5",
      iconColor: "text-[#0073b6]",
      badge: hasPin 
        ? { text: "Set", bg: "bg-green-500/10 border border-green-500/20", color: "text-green-400" } 
        : { text: "Not Set", bg: "bg-amber-500/10 border border-amber-500/20", color: "text-amber-400" },
      href: "/dashboard/settings/payment"
    },

    {
      id: "wallets",
      label: "Linked Wallets",
      icon: ShieldCheck,
      iconBg: "bg-white/5",
      iconColor: "text-[#0073b6]",
      badge: null,
      href: "/dashboard/settings/wallets"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden ">
      {/* Header */}
      <div className="bg-[#111827] px-4 py-3.5 flex items-center sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button 
          onClick={() => router.push('/dashboard')}
          className="mr-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[15px] font-bold">Settings</h1>
      </div>

      <div className="px-4 py-4 max-w-[480px] mx-auto w-full space-y-3">

        {/* Main Settings Group */}
        <div className="bg-[#111827] rounded-[16px] border border-white/5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => item.href && router.push(item.href)}
              className={`w-full flex items-center justify-between px-3.5 py-3 hover:bg-white/5 transition-colors ${index !== menuItems.length - 1 ? 'border-b border-white/5' : ''
                }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${item.iconBg} ${item.iconColor}`}>
                  <item.icon size={16} />
                </div>
                <span className="text-white/90 text-[13px] font-medium">{item.label}</span>
              </div>

              <div className="flex items-center gap-2.5">
                {item.badge && (
                  <span className={`${item.badge.bg} ${item.badge.color} px-2.5 py-1 rounded-[6px] text-[10px] font-bold`}>
                    {item.badge.text}
                  </span>
                )}
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </button>
          ))}
        </div>

      </div>

    </div>
  );
}
