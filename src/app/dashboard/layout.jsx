"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import BottomNav from "@/components/BottomNav";
import DailyCheckinModal from "@/components/DailyCheckinModal";
import InstallGuideModal from "@/components/InstallGuideModal";
import { useFetchData } from "@/hooks/useApi";
import { useRouter, usePathname } from "next/navigation";
import { Globe, X, Home, Wallet, CreditCard, Cpu, TrendingUp, Clock, MessageCircle, User, Users, Settings, LogOut, Menu, ChevronDown, CheckCircle2, Search, Download, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePWA } from "@/components/PWAProvider";
import { toast } from "sonner";
import axiosInstance, { clearAuthToken } from "@/config/axiosInstance";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isInstallable, installPWA } = usePWA();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN");
  const [searchQuery, setSearchQuery] = useState("");

  const { isLoading: isLoadingSettings, data: settingsResponse } = useFetchData("/settings", ["platform-settings"]);
  const { data: userRes, isLoading: isLoadingProfile } = useFetchData("/users/me", ["user-profile"]);
  const { data: languagesResponse } = useFetchData("/auth/languages", ["languages"]);

  const user = userRes?.user;
  const settings = settingsResponse?.settings || {};
  const siteName = settings.site_name || "TradeFluxBot";
  const siteLogo = settings.platform_logo || "/logo.jpeg";
  const dynamicLanguages = languagesResponse?.data || [];

  const isProtectedRoute = useMemo(() => {
    const protectedRoutes = [
      "/dashboard/mining",
      "/dashboard/wallet/deposit",
      "/dashboard/wallet/withdraw"
    ];
    return protectedRoutes.some(route => pathname.startsWith(route));
  }, [pathname]);

  useEffect(() => {
    if (user?.language?.language_code) {
      setCurrentLang(user.language.language_code);
    }
  }, [user?.language]);

  if (isLoadingSettings || isLoadingProfile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#0073b6] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0b0f19] flex justify-center overflow-hidden">
      <div className="w-full max-w-[480px] bg-[#0b0f19] h-screen relative shadow-2xl overflow-hidden pb-[80px] flex flex-col">
        
        {/* Sidebar Drawer Backdrop */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/60 z-[100] transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar Drawer Panel */}
        <div className={`absolute top-0 left-0 w-[280px] h-full bg-[#111827] z-[101] shadow-2xl transition-transform duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {siteLogo ? (
                <img src={siteLogo} alt="Logo" className="w-8 h-8 object-contain rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-amber-900/30 rounded-full flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">{siteName.substring(0, 4).toUpperCase()}</span>
                </div>
              )}
              <span className="text-white font-bold text-[16px] tracking-tight">
                {siteName.toLowerCase().includes('tradeflux') ? (
                  <>TradeFlux<span className="text-[#0073b6]">Bot</span></>
                ) : siteName.toLowerCase().includes('kryptex') ? (
                  <>Kryptex <span className="text-[#0073b6]">Mining</span></>
                ) : siteName.toLowerCase().includes('mykryptex') ? (
                  <>MyKryptex<span className="text-[#0073b6]">App</span></>
                ) : siteName.toLowerCase().includes('polychain') ? (
                  <>Polychain<span className="text-[#0073b6]">Mining</span></>
                ) : siteName.toLowerCase().includes('pallas') ? (
                  <>Pallas<span className="text-[#0073b6]">Trade</span></>
                ) : (
                  <>{siteName}</>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white p-1 cursor-pointer">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 [&::-webkit-scrollbar]:hidden">
            {[
              { name: "Dashboard", href: "/dashboard", icon: Home },
              { name: "Deposit", href: "/dashboard/wallet/deposit", icon: Wallet },
              { name: "Withdraw", href: "/dashboard/wallet/withdraw", icon: CreditCard },
              { name: "Mining Pool", href: "/dashboard/mining", icon: Cpu },
              { name: "Active Mining", href: "/dashboard/investments", icon: TrendingUp },
              { name: "Transactions Log", href: "/dashboard/transactions", icon: Clock },
              { name: "WhatsApp Support", href: settings.whatsapp_support || "#", icon: MessageCircle, isExternal: true },
              { name: "Account", href: "/dashboard/account", icon: User },
              { name: "Referrals", href: "/dashboard/invite", icon: Users },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                onClick={(e) => {
                  setIsSidebarOpen(false);
                  if (item.isExternal) {
                    e.preventDefault();
                    if (item.href && item.href !== "#") {
                      window.open(item.href, "_blank");
                    } else {
                      toast.info("Support link is not configured.");
                    }
                  }
                }}
                className="flex items-center gap-3 px-4 py-3 text-white/90 hover:bg-white/5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                <item.icon size={18} className="text-[#0073b6]" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Settings Section */}
            <div className="flex flex-col">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-xl text-white/90 text-sm font-medium transition-colors cursor-pointer w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <Settings size={18} className="text-[#0073b6]" />
                  <span>Settings</span>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isSettingsOpen && (
                <div className="pl-9 bg-black/10 border-l border-amber-500/20 flex flex-col py-1 space-y-1">
                  <Link
                    href="/dashboard/settings/login"
                    onClick={() => setIsSidebarOpen(false)}
                    className="px-4 py-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Security (Change Password)
                  </Link>
                  <Link
                    href="/dashboard/settings/wallets"
                    onClick={() => setIsSidebarOpen(false)}
                    className="px-4 py-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Linked Wallets
                  </Link>
                  <Link
                    href="/dashboard/settings/profile"
                    onClick={() => setIsSidebarOpen(false)}
                    className="px-4 py-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Profile
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Log Out Button */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={() => {
                clearAuthToken();
                router.push("/");
                setIsSidebarOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full bg-red-955/30 border border-red-500/20 text-red-400 hover:bg-red-900/20 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Global Persistent Header */}
        <div className="bg-[#111827] px-4 pt-4 pb-3 flex justify-between items-center shadow-sm z-10 relative shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center border border-white/5 text-white/90 cursor-pointer transition-colors"
            >
              <Menu size={20} />
            </button>
            
            <span className="text-white font-bold text-[17px] tracking-tight">
              {siteName.toLowerCase().includes('tradeflux') ? (
                <>TradeFlux<span className="text-[#0073b6]">Bot</span></>
              ) : siteName.toLowerCase().includes('kryptex') ? (
                <>Kryptex <span className="text-[#0073b6]">Mining</span></>
              ) : siteName.toLowerCase().includes('mykryptex') ? (
                <>MyKryptex<span className="text-[#0073b6]">App</span></>
              ) : siteName.toLowerCase().includes('polychain') ? (
                <>Polychain<span className="text-[#0073b6]">Mining</span></>
              ) : siteName.toLowerCase().includes('pallas') ? (
                <>Pallas<span className="text-[#0073b6]">Trade</span></>
              ) : (
                <>{siteName}</>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 relative">
            <button 
              onClick={() => setShowLanguageModal(true)}
              className="flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-sm cursor-pointer text-[11px] font-bold text-white/90 shadow-sm hover:bg-white/10 transition-colors"
            >
              <Globe size={12} className="text-[#0073b6]" />
              {currentLang}
            </button>

            <div 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} 
              className="flex items-center gap-1 bg-white/5 pl-1 pr-2 py-1 rounded-full cursor-pointer hover:bg-white/10 transition-colors border border-white/5"
            >
              <div className="w-7 h-7 bg-[#0073b6] text-[#111827] text-[10px] font-bold rounded-full flex items-center justify-center uppercase leading-none shadow-sm">
                {user?.username ? user.username[0] : "U"}
              </div>
              <ChevronDown size={11} className={`text-gray-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isProfileDropdownOpen && (
              <>
                {/* Click outside backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileDropdownOpen(false)}
                />
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-32 bg-[#111827] rounded-xl border border-white/5 shadow-2xl p-1 z-50 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                  <Link
                    href="/dashboard/account"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="px-3 py-2.5 hover:bg-white/5 rounded-lg text-white/90 text-[12px] font-semibold transition-colors text-left"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="px-3 py-2.5 hover:bg-white/5 rounded-lg text-white/90 text-[12px] font-semibold transition-colors text-left"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      clearAuthToken();
                      router.push("/");
                      setIsProfileDropdownOpen(false);
                    }}
                    className="px-3 py-2.5 hover:bg-red-500/10 rounded-lg text-red-400 text-[12px] font-semibold transition-colors text-left w-full cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Page Content area */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {children}
        </div>

        <DailyCheckinModal />
        <InstallGuideModal />

        {/* Language Modal */}
        {showLanguageModal && (
          <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4">
            <div className="bg-[#111827] rounded-[24px] border border-white/5 w-full max-w-[360px] max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/10">
                <h3 className="text-white font-bold text-[15px]">Select Language</h3>
                <button 
                  onClick={() => setShowLanguageModal(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Search */}
              <div className="p-3 border-b border-white/5 flex items-center gap-2 bg-[#111827]">
                <Search size={16} className="text-gray-400 ml-2" />
                <input 
                  type="text"
                  placeholder="Search language..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 px-2 text-[13px] outline-none bg-transparent text-white/90 placeholder:text-gray-500"
                />
              </div>

              {/* Language List */}
              <div className="p-4 space-y-3 overflow-y-auto flex-1 bg-transparent">
                {dynamicLanguages
                  .filter(l => l.native_name.toLowerCase().includes(searchQuery.toLowerCase()) || l.language_name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((lang) => {
                  const isSelected = currentLang === lang.language_code;
                  return (
                    <button
                      key={lang.language_code}
                      onClick={async () => {
                        setCurrentLang(lang.language_code);
                        const targetCode = lang.language_code.toLowerCase();
                        
                        // Set Google Translate cookies
                        document.cookie = `googtrans=/en/${targetCode}; path=/`;
                        document.cookie = `googtrans=/en/${targetCode}; path=/; domain=${window.location.hostname}`;
                        
                        if (targetCode === 'en') {
                          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
                        }

                        // Save to backend
                        try {
                          await axiosInstance.put("/users/me/language", { language_code: lang.language_code });
                        } catch (error) {
                          console.error('Failed to update language preference', error);
                        }

                        setTimeout(() => {
                          setShowLanguageModal(false);
                          window.location.reload();
                        }, 200);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-[12px] border transition-colors ${
                        isSelected 
                          ? 'border-[#0073b6] bg-amber-900/20' 
                          : 'border-white/5 hover:border-[#0073b6] bg-[#111827]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-[#0b0f19] border border-white/5 rounded-xl flex items-center justify-center text-[12px] font-bold text-gray-400 shadow-sm">
                          {lang.language_code.substring(0, 2).toUpperCase()}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-[#0b0f19] rounded-full">
                              <CheckCircle2 size={14} className="text-[#0073b6] fill-[#0073b6]/20" />
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-[13px] font-bold text-white/90 leading-tight">{lang.native_name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{lang.language_name}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className={isSelected ? 'text-[#0073b6]' : 'text-gray-600'} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  );
}
