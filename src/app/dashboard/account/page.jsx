"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Globe, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp,
  Eye, 
  EyeOff,
  Download, 
  Upload, 
  BarChart3,
  Wallet,
  CreditCard,
  BarChart2,
  Users,
  Info,
  Clock,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Search,
  X,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance, { clearAuthToken } from "@/config/axiosInstance";

// Dynamic languages are now fetched from backend

import { useFetchData } from "@/hooks/useApi";
import { usePWA } from "@/components/PWAProvider";
import { toast } from "sonner";
import { useSharedSettings } from "@/hooks/useSharedSettings";

export default function AccountPage() {
  const router = useRouter();
  const { isInstallable, installPWA } = usePWA();
  const { currency, setCurrency, showBalance, setShowBalance } = useSharedSettings();
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN");
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  const { data: userProfileResponse, isLoading: isLoadingProfile } = useFetchData("/users/me", ["user-profile"]);
  const userProfile = userProfileResponse?.user;

  const { data: languagesResponse } = useFetchData("/auth/languages", ["languages"]);
  const dynamicLanguages = languagesResponse?.data || [];

  useEffect(() => {
    if (userProfile?.language?.language_code) {
      setCurrentLang(userProfile.language.language_code);
    }
    if (userProfile?.profile_image) {
      setProfilePic(userProfile.profile_image);
    }
  }, [userProfile?.language, userProfile?.profile_image]);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        setProfilePic(base64Data);
        try {
          const loadingToast = toast.loading("Uploading profile picture...");
          await axiosInstance.put("/users/profile-image", { profile_image: base64Data });
          toast.success("Profile picture updated", { id: loadingToast });
        } catch (error) {
          toast.error("Failed to update profile picture");
          console.error(error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCurrency = () => {
    if (!userProfile?.country) return;
    const localCurrency = userProfile.country.currency_code?.trim() ? userProfile.country.currency_code : "NGN";
    const baseCurrency = settings.currency_name || "USDT";
    setCurrency(prev => (prev === "USDT" || prev === baseCurrency) ? localCurrency : baseCurrency);
  };

  // Convert balance based on selected currency
  const getDisplayValue = (amountUSD) => {
    const usd = parseFloat(amountUSD || 0);
    const baseCurrency = settings.currency_name || "USDT";
    const baseSymbol = settings.currency_symbol || "$";
    
    if (currency === "USDT" || currency === baseCurrency) {
      return `${baseSymbol}${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      const exchangeRate = parseFloat(userProfile?.country?.exchange_rate || 1);
      const localBalance = usd * exchangeRate;
      const symbol = userProfile?.country?.currency_symbol || "";
      return `${symbol}${localBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const balanceValues = {
    total: getDisplayValue(Number(userProfile?.balance || 0)),
    deposit: getDisplayValue(userProfile?.statistics?.total_deposit),
    withdraw: getDisplayValue(userProfile?.statistics?.total_withdrawal),
    income: getDisplayValue(userProfile?.statistics?.total_income)
  };

  const menuItems = [
    { icon: Info, label: "About Us", href: "/dashboard/about", color: "text-amber-400", bg: "bg-amber-900/20" },
    { icon: Users, label: "Invite", href: "/dashboard/invite", color: "text-amber-400", bg: "bg-amber-900/20" },
    { icon: Clock, label: "Transactions", href: "/dashboard/transactions", color: "text-amber-400", bg: "bg-amber-900/20" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", color: "text-amber-400", bg: "bg-amber-900/20" },
    { icon: Download, label: "Download App", href: "#", color: "text-amber-400", bg: "bg-amber-900/20" },
    { icon: HelpCircle, label: "Help Center", href: "/dashboard/help", color: "text-amber-400", bg: "bg-amber-900/20" },
    { icon: LogOut, label: "Logout", href: "#", color: "text-red-400", bg: "bg-red-900/20" },
  ];

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto  [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="bg-[#111827] px-4 pt-4 pb-3 flex justify-between items-center rounded-b-[20px] shadow-sm z-10 sticky top-0 border-b border-white/5">
        <div className="flex items-center gap-2">
          <label className="relative w-9 h-9 bg-gradient-to-br from-[#00629b] to-[#0f172a] rounded-full flex items-center justify-center text-white shadow-sm cursor-pointer overflow-hidden group shrink-0">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={20} fill="currentColor" className="opacity-80" />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload size={14} className="text-white" />
            </div>
            <input 
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={handleProfilePicChange} 
            />
          </label>
          <div>
            <h1 className="text-white/90 text-[15px] font-bold leading-tight">{userProfile?.full_name || "..."}</h1>
            <p className="text-gray-400 text-[10px] mt-0.5">{userProfile?.email || "..."}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowLanguageModal(true)}
            className="flex items-center gap-1 bg-white/5 border border-white/5 px-2.5 py-1 rounded-sm cursor-pointer text-[11px] font-bold text-white/90 shadow-sm hover:bg-white/10 transition-colors"
          >
            <Globe size={13} className="text-[#0073b6]" />
            {currentLang}
          </button>
          <Link 
            href="/dashboard/help"
            className="bg-white/5 p-1.5 rounded-full text-[#0073b6] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <MessageCircle size={16} />
          </Link>
        </div>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-4 max-w-[480px] mx-auto w-full">
        
        {/* Total Balance Card */}
        <div className="bg-gradient-to-br from-[#00629b] to-[#0f172a] rounded-2xl p-[18px] text-white shadow-lg relative overflow-hidden border border-white/10">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-white/80 text-[13px] font-medium">Deposit Balance</p>
            <button 
              onClick={toggleCurrency}
              className="bg-white/10 px-2 cursor-pointer py-1 rounded-md text-[11px] font-bold flex items-center gap-1 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10"
            >
              {(currency === "USDT" || currency === (settings.currency_name || "USDT")) ? (settings.currency_name || "USDT") : (userProfile?.country?.currency_code || "NGN")} <span className="text-[7px] opacity-70 cursor-pointer">▼</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 mb-5 relative z-10">
            <h2 className="text-[28px] font-bold tracking-wider leading-none">
              {showBalance ? balanceValues.total : "****"}
            </h2>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="text-white/60 hover:text-white transition-colors ml-1 cursor-pointer"
            >
              {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <div className="flex gap-2.5 relative z-10">
            <Link href="/dashboard/wallet/deposit" className="flex-1 bg-[#0073b6] text-white py-2 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-amber-600 transition-colors shadow-md cursor-pointer">
              <Wallet size={16} />
              Deposit
            </Link>
            <Link href="/dashboard/wallet/withdraw" className="flex-1 bg-white/10 text-white py-2 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-white/20 transition-colors border border-white/15 backdrop-blur-sm cursor-pointer">
              <CreditCard size={16} />
              Withdraw
            </Link>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="bg-[#111827] rounded-[24px] p-6 border border-white/5 shadow-xl relative overflow-hidden">
          {/* Subtle gold gradient accent on top border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0073b6]/40 to-transparent"></div>
          
          <h2 className="text-[#9ca3af] font-bold text-[12px] tracking-[0.2em] text-center uppercase mb-6">
            Account Statistics
          </h2>

          <div className="flex flex-col gap-3.5">
            {/* Total Deposits */}
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex-1 h-11 bg-white/5 border border-white/5 rounded-[8px] transform -skew-x-[18deg] flex items-center justify-center shadow-inner">
                <span className="transform skew-x-[18deg] text-[10px] font-extrabold text-gray-300 uppercase tracking-wider">
                  Total Deposits
                </span>
              </div>
              <div className="flex-[1.2] h-11 bg-[#c2ff29] rounded-[8px] transform -skew-x-[18deg] flex items-center justify-center shadow-md">
                <span className="transform skew-x-[18deg] text-[13px] font-black text-[#0b0f19] tracking-wide whitespace-nowrap">
                  {showBalance ? balanceValues.deposit : "****"} {currency === "USDT" ? "USD" : currency}
                </span>
              </div>
            </div>

            {/* Total Withdrawals */}
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex-1 h-11 bg-white/5 border border-white/5 rounded-[8px] transform -skew-x-[18deg] flex items-center justify-center shadow-inner">
                <span className="transform skew-x-[18deg] text-[10px] font-extrabold text-gray-300 uppercase tracking-wider">
                  Total Withdrawals
                </span>
              </div>
              <div className="flex-[1.2] h-11 bg-[#c2ff29] rounded-[8px] transform -skew-x-[18deg] flex items-center justify-center shadow-md">
                <span className="transform skew-x-[18deg] text-[13px] font-black text-[#0b0f19] tracking-wide whitespace-nowrap">
                  {showBalance ? balanceValues.withdraw : "****"} {currency === "USDT" ? "USD" : currency}
                </span>
              </div>
            </div>

            {/* Total Earnings */}
            {/* <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex-1 h-11 bg-white/5 border border-white/5 rounded-[8px] transform -skew-x-[18deg] flex items-center justify-center shadow-inner">
                <span className="transform skew-x-[18deg] text-[10px] font-extrabold text-gray-300 uppercase tracking-wider">
                  Total Earnings
                </span>
              </div>
              <div className="flex-[1.2] h-11 bg-[#c2ff29] rounded-[8px] transform -skew-x-[18deg] flex items-center justify-center shadow-md">
                <span className="transform skew-x-[18deg] text-[13px] font-black text-[#0b0f19] tracking-wide whitespace-nowrap">
                  {showBalance ? balanceValues.income : "****"} {currency === "USDT" ? "USD" : currency}
                </span>
              </div>
            </div> */}

            {/* Total Assets */}
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex-1 h-11 bg-white/5 border border-white/5 rounded-[8px] transform -skew-x-[18deg] flex items-center justify-center shadow-inner">
                <span className="transform skew-x-[18deg] text-[10px] font-extrabold text-gray-300 uppercase tracking-wider">
                  Total Assets
                </span>
              </div>
              <div className="flex-[1.2] h-11 bg-[#c2ff29] rounded-[8px] transform -skew-x-[18deg] flex items-center justify-center shadow-md">
                <span className="transform skew-x-[18deg] text-[13px] font-black text-[#0b0f19] tracking-wide whitespace-nowrap">
                  {showBalance ? balanceValues.income : "****"} {currency === "USDT" ? "USD" : currency}
                </span>
              </div>
            </div>

            {/* Team Member */}
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex-1 h-11 bg-white/5 border border-white/5 rounded-[8px] transform -skew-x-[18deg] flex items-center justify-center shadow-inner">
                <span className="transform skew-x-[18deg] text-[10px] font-extrabold text-gray-300 uppercase tracking-wider">
                  Team Member
                </span>
              </div>
              <div className="flex-[1.2] h-11 bg-[#c2ff29] rounded-[8px] transform -skew-x-[18deg] flex items-center justify-center shadow-md">
                <span className="transform skew-x-[18deg] text-[13px] font-black text-[#0b0f19] tracking-wide whitespace-nowrap">
                  {userProfile?.statistics?.team_members || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu List */}
        <div className="bg-[#111827] rounded-[16px] border border-white/5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          {menuItems.map((item, index) => {
            const isDownload = item.label === "Download App";
            return (
              <Link 
                key={index} 
                href={item.href}
                onClick={(e) => {
                  if (item.label === "Logout") {
                    e.preventDefault();
                    clearAuthToken();
                    router.push("/");
                    return;
                  }
                  if (isDownload) {
                    e.preventDefault();
                    if (isInstallable) {
                      installPWA();
                    } else {
                      window.dispatchEvent(new Event('open-install-guide'));
                    }
                  }
                }}
                className={`flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors ${
                  index !== menuItems.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${item.bg} ${item.color}`}>
                    <item.icon size={14} />
                  </div>
                  <span className={`text-[13px] font-medium ${item.label === 'Logout' ? 'text-red-400' : 'text-white/90'}`}>
                    {item.label}
                  </span>
                </div>
                <ChevronRight size={14} className="text-gray-400" />
              </Link>
            );
          })}
        </div>

      </div>

      {/* Language Modal (Bottom Sheet) */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer" 
            onClick={() => setShowLanguageModal(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-[#111827] w-full max-w-[480px] mx-auto rounded-t-[24px] overflow-hidden flex flex-col h-[75vh] animate-in slide-in-from-bottom-full duration-300">
            
            {/* Header */}
            <div className="bg-[#0073b6] p-5 flex justify-between items-center text-white">
              <h2 className="text-[16px] font-bold">Select Language</h2>
              <button 
                onClick={() => setShowLanguageModal(false)}
                className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-white/5 flex items-center gap-2">
              <Search size={16} className="text-gray-400 ml-2" />
              <input 
                type="text"
                placeholder="Search language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-2 text-[13px] outline-none placeholder:text-gray-400 bg-transparent text-white/90"
              />
            </div>

            {/* Language List */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {dynamicLanguages
                .filter(l => l.native_name.toLowerCase().includes(searchQuery.toLowerCase()) || l.language_name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((lang) => {
                const isSelected = currentLang === lang.language_code;
                return (
                  <button
                    key={lang.id}
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
                        ? 'border-[#0073b6] bg-white/5' 
                        : 'border-white/5 hover:border-[#0073b6] bg-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 bg-[#111827] border border-white/5 rounded-xl flex items-center justify-center text-[12px] font-bold text-gray-400 shadow-sm">
                        {lang.language_code.substring(0, 2).toUpperCase()}
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 bg-[#111827] rounded-full">
                            <CheckCircle2 size={14} className="text-[#10b981]" fill="#fff" />
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-[13px] font-bold text-white/90">{lang.native_name}</div>
                        <div className="text-[11px] text-gray-400">{lang.language_name}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className={isSelected ? 'text-[#0073b6]' : 'text-gray-300'} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Toast */}
      {showToast && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
          <div className="bg-[#111827] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-5 py-4 flex items-center gap-4 animate-in fade-in zoom-in-95 duration-300 pointer-events-auto max-w-[320px] w-full border border-white/5">
            <div className="w-12 h-12 bg-white/5 rounded-[14px] flex items-center justify-center shrink-0">
              <div className="w-6 h-6 bg-[#0073b6] rounded-full flex items-center justify-center text-white">
                <Info size={14} strokeWidth={3} />
              </div>
            </div>
            <span className="text-white/90 text-[18px] font-bold">Coming soon</span>
          </div>
        </div>
      )}
    </div>
  );
}
