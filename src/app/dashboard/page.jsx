"use client";

import { useState, useEffect } from "react";
import { Globe, MessageCircle, Eye, EyeOff, Wallet, CreditCard, Volume2, HelpCircle, CheckSquare, Users, Loader, Loader2, Download, Gift, Calendar, Activity, ArrowDown, DollarSign, BadgeCheck, BarChart2, ChevronRight, X, Lock, Coins, Search, CheckCircle2, Menu, Bell, ChevronDown, Cpu, TrendingUp, User, Home, LogOut, Clock, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFetchData } from "@/hooks/useApi";
import { fetchData } from "@/config/apiHelpers";
import { usePWA } from "@/components/PWAProvider";
import { toast } from "sonner";
import WhatsAppModal from "@/components/WhatsAppModal";
import { useSharedSettings } from "@/hooks/useSharedSettings";
import axiosInstance, { clearAuthToken } from "@/config/axiosInstance";
const activities = [
  { type: "deposit", name: "", text: "deposited", amount: "+$1,910", iconBg: "bg-green-100", iconCol: "text-green-600", Icon: ArrowDown },
  { type: "profit", name: "henry***", text: "earned profit", amount: "+$138", iconBg: "bg-emerald-100", iconCol: "text-emerald-600", Icon: DollarSign },
  { type: "bonus", name: "nancy***", text: "claimed bonus", amount: "+$87", iconBg: "bg-orange-100", iconCol: "text-orange-500", Icon: Gift },
  { type: "deposit", name: "alex***", text: "deposited", amount: "+$500", iconBg: "bg-green-100", iconCol: "text-green-600", Icon: ArrowDown },
  { type: "profit", name: "mike***", text: "earned profit", amount: "+$42", iconBg: "bg-emerald-100", iconCol: "text-emerald-600", Icon: DollarSign },
];
const doubledActivities = [...activities, ...activities];
const marketTabsData = {
  Hot: [
    "AAVE/USDT", "SHIB/USDT", "LINK/USDT", "APT/USDT", "ETH/USDT",
    "TIA/USDT", "GMX/USDT", "SNX/USDT", "SOL/USDT", "YFI/USDT"
  ],
  Gainers: [
    "DOGE/USDT", "SOL/USDT", "AVAX/USDT", "ADA/USDT", "XRP/USDT",
    "AAVE/USDT", "MATIC/USDT"
  ],
  Losers: [
    "LUNA/USDT", "FTM/USDT", "FIL/USDT", "ATOM/USDT", "NEAR/USDT",
    "SAND/USDT", "MANA/USDT"
  ],
  Turnover: [
    "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT",
    "ADA/USDT", "DOGE/USDT"
  ]
};

const initialMarketPrices = {
  // Hot
  "AAVE/USDT": { amount: 100.48, change: 8.93 },
  "SHIB/USDT": { amount: 0.00, change: 6.39 },
  "LINK/USDT": { amount: 8.78, change: 4.49 },
  "APT/USDT": { amount: 0.63, change: 3.60 },
  "ETH/USDT": { amount: 1941.60, change: 3.32 },
  "TIA/USDT": { amount: 0.35, change: 2.97 },
  "GMX/USDT": { amount: 6.87, change: 2.59 },
  "SNX/USDT": { amount: 0.22, change: 2.45 },
  "SOL/USDT": { amount: 76.23, change: 2.05 },
  "YFI/USDT": { amount: 2121.00, change: 1.87 },
  
  // Gainers
  "DOGE/USDT": { amount: 0.084, change: 24.81 },
  "AVAX/USDT": { amount: 28.45, change: 15.30 },
  "ADA/USDT": { amount: 0.44, change: 12.15 },
  "XRP/USDT": { amount: 0.61, change: 9.88 },
  "MATIC/USDT": { amount: 0.82, change: 7.45 },
  
  // Losers
  "LUNA/USDT": { amount: 0.55, change: -18.93 },
  "FTM/USDT": { amount: 0.38, change: -12.45 },
  "FIL/USDT": { amount: 4.20, change: -9.80 },
  "ATOM/USDT": { amount: 8.90, change: -7.32 },
  "NEAR/USDT": { amount: 2.15, change: -6.15 },
  "SAND/USDT": { amount: 0.41, change: -5.80 },
  "MANA/USDT": { amount: 0.39, change: -4.95 },
  
  // Turnover
  "BTC/USDT": { amount: 42150.00, change: 1.20 },
  "BNB/USDT": { amount: 305.40, change: 0.95 }
};
export default function DashboardPage() {
  const router = useRouter();
  const { isInstallable, installPWA } = usePWA();
  const { currency, setCurrency, showBalance, setShowBalance } = useSharedSettings();
  const [showToast, setShowToast] = useState(false);

  const { data: partnersResponse, isLoading: isLoadingPartners } = useFetchData("/partners", ["partners"]);
  const partnersData = partnersResponse?.partners || [];

  const { data: userProfileResponse, isLoading: isLoadingProfile } = useFetchData("/users/me", ["user-profile"]);
  const userProfile = userProfileResponse?.user;

  const { data: marketResponse, isLoading: isLoadingMarket } = useFetchData("/live-market", ["live-market"]);
  const marketData = marketResponse?.assets || [];
  const isMarketVisible = marketResponse?.isVisible ?? true;

  const { data: languagesResponse } = useFetchData("/auth/languages", ["languages"]);
  const dynamicLanguages = languagesResponse?.data || [];

  const { data: settingsResponse } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsResponse?.settings || {};
  const siteName = settings.site_name || "TradeFluxBot";
  const siteLogo = settings.platform_logo || "/logo.jpeg";
  const referralDomain = typeof window !== "undefined" ? window.location.origin : "https://tradefluxbot.com";

  const [liveMarketData, setLiveMarketData] = useState([]);
  const [activeMarketTab, setActiveMarketTab] = useState("Hot");
  const [marketPrices, setMarketPrices] = useState(initialMarketPrices);
  const [prevPrices, setPrevPrices] = useState({});
  const [priceFlash, setPriceFlash] = useState({});
  const { data: txResponse, isLoading: isLoadingTx } = useFetchData("/users/transactions", ["transactions"]);
  const rawTransactions = txResponse?.transactions || [];

  const [showEventsModal, setShowEventsModal] = useState(false);
  const [txFilter, setTxFilter] = useState("All");
  const [txPage, setTxPage] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketPrices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          if (key === "SHIB/USDT") return;
          const item = next[key];
          const pct = (Math.random() - 0.5) * 0.0015; // +/- 0.075% fluctuation
          const newAmount = item.amount * (1 + pct);
          const newChange = item.change + (Math.random() - 0.5) * 0.06;
          next[key] = {
            amount: parseFloat(newAmount.toFixed(4)),
            change: parseFloat(newChange.toFixed(2))
          };
        });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (marketData && marketData.length > 0) {
      setLiveMarketData(marketData);
      
      const fetchLivePrices = async () => {
        try {
          const promises = marketData.map(async (asset) => {
            if (!asset.symbol) return null;
            
            try {
              const data = await fetchData(`/live-market/proxy?symbol=${asset.symbol.toUpperCase()}`);
              if (!data || data.error || !data.lastPrice) return null;
              
              return {
                symbol: asset.symbol,
                current_price: parseFloat(data.lastPrice),
                price_change_24h: parseFloat(data.priceChangePercent) * 100 // MEXC returns decimal, so multiply by 100
              };
            } catch (err) {
              return null;
            }
          });
          
          const results = await Promise.all(promises);
          const validResults = results.filter(Boolean);
          
          if (validResults.length > 0) {
            setLiveMarketData(prev => {
              return prev.map(asset => {
                const live = validResults.find(r => r.symbol === asset.symbol);
                if (live) {
                  return {
                    ...asset,
                    current_price: live.current_price,
                    price_change_24h: live.price_change_24h
                  };
                }
                return asset;
              });
            });
          }
        } catch (error) {
          console.error("Error fetching live prices:", error);
        }
      };
      
      fetchLivePrices();
      const interval = setInterval(fetchLivePrices, 15000);
      return () => clearInterval(interval);
    }
  }, [marketData]);

  // Real-time price fluctuations on screen (every 2.5s) to look "alive and twerking"
  useEffect(() => {
    if (liveMarketData && liveMarketData.length > 0) {
      const interval = setInterval(() => {
        setLiveMarketData(prev => {
          return prev.map(asset => {
            const current = parseFloat(asset.current_price || 0);
            if (current <= 0) return asset;
            const pct = (Math.random() - 0.5) * 0.0008; // +/- 0.04% fluctuation
            const newPrice = current * (1 + pct);
            const change = parseFloat(asset.price_change_24h || 0);
            const newChange = change + (Math.random() - 0.5) * 0.02;
            return {
              ...asset,
              current_price: parseFloat(newPrice.toFixed(4)),
              price_change_24h: parseFloat(newChange.toFixed(2))
            };
          });
        });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [liveMarketData.length > 0]);

  // Flash green/red on price fluctuations
  useEffect(() => {
    const flashTimeout = {};
    
    // Check liveMarketData
    liveMarketData.forEach(asset => {
      const symbol = asset.symbol;
      const current = parseFloat(asset.current_price || 0);
      const prev = prevPrices[symbol];
      if (prev !== undefined && prev !== current) {
        const direction = current > prev ? 'up' : 'down';
        setPriceFlash(prevFlash => ({ ...prevFlash, [symbol]: direction }));
        if (flashTimeout[symbol]) clearTimeout(flashTimeout[symbol]);
        flashTimeout[symbol] = setTimeout(() => {
          setPriceFlash(prevFlash => ({ ...prevFlash, [symbol]: null }));
        }, 800);
      }
      if (prev !== current) {
        setPrevPrices(prevMap => ({ ...prevMap, [symbol]: current }));
      }
    });
    
    // Check fallback marketPrices
    Object.keys(marketPrices).forEach(pair => {
      const symbol = pair.split("/")[0];
      const current = marketPrices[pair]?.amount || 0;
      const prev = prevPrices[symbol];
      if (prev !== undefined && prev !== current) {
        const direction = current > prev ? 'up' : 'down';
        setPriceFlash(prevFlash => ({ ...prevFlash, [symbol]: direction }));
        if (flashTimeout[symbol]) clearTimeout(flashTimeout[symbol]);
        flashTimeout[symbol] = setTimeout(() => {
          setPriceFlash(prevFlash => ({ ...prevFlash, [symbol]: null }));
        }, 800);
      }
      if (prev !== current) {
        setPrevPrices(prevMap => ({ ...prevMap, [symbol]: current }));
      }
    });

    return () => {
      Object.values(flashTimeout).forEach(clearTimeout);
    };
  }, [liveMarketData, marketPrices]);

  const toggleCurrency = () => {
    if (!userProfile?.country) return;
    const localCurrency = userProfile.country.currency_code?.trim() ? userProfile.country.currency_code : "NGN";
    const baseCurrency = settings.currency_name || "USDT";
    setCurrency(prev => (prev === "USDT" || prev === baseCurrency) ? localCurrency : baseCurrency);
  };



  // Convert balance based on selected currency
  const getDisplayBalance = () => {
    const baseSymbol = settings.currency_symbol || "$";
    if (!userProfile) return `${baseSymbol}0.00`;
    
    const balanceUSD = parseFloat(userProfile.balance || 0) + parseFloat(userProfile.withdrawable_balance || 0);
    const baseCurrency = settings.currency_name || "USDT";
    
    if (currency === "USDT" || currency === baseCurrency) {
      return `${baseSymbol}${balanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      const exchangeRate = parseFloat(userProfile.country?.exchange_rate || 1);
      const localBalance = balanceUSD * exchangeRate;
      const symbol = userProfile.country?.currency_symbol || "";
      return `${symbol}${localBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const getFormattedStat = (val) => {
    const numericVal = parseFloat(val || 0);
    const baseSymbol = settings.currency_symbol || "$";
    const baseCurrency = settings.currency_name || "USDT";
    
    if (currency === "USDT" || currency === baseCurrency) {
      return `${baseSymbol}${numericVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${baseCurrency}`;
    } else {
      const exchangeRate = parseFloat(userProfile?.country?.exchange_rate || 1);
      const localVal = numericVal * exchangeRate;
      const symbol = userProfile?.country?.currency_symbol || "";
      const code = userProfile?.country?.currency_code || "NGN";
      return `${symbol}${localVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${code}`;
    }
  };

  const getTabAssets = () => {
    if (!liveMarketData || liveMarketData.length === 0) {
      return marketTabsData[activeMarketTab].map(pair => {
        const symbol = pair.split("/")[0];
        const item = marketPrices[pair] || { amount: 0, change: 0 };
        return {
          symbol: symbol,
          current_price: item.amount,
          price_change_24h: item.change,
        };
      });
    }

    if (activeMarketTab === "Hot") {
      return liveMarketData.slice(0, 10);
    } else if (activeMarketTab === "Gainers") {
      return [...liveMarketData]
        .sort((a, b) => parseFloat(b.price_change_24h || 0) - parseFloat(a.price_change_24h || 0))
        .slice(0, 10);
    } else if (activeMarketTab === "Losers") {
      return [...liveMarketData]
        .sort((a, b) => parseFloat(a.price_change_24h || 0) - parseFloat(b.price_change_24h || 0))
        .slice(0, 10);
    } else if (activeMarketTab === "Turnover") {
      return [...liveMarketData]
        .sort((a, b) => parseFloat(b.current_price || 0) - parseFloat(a.current_price || 0))
        .slice(0, 10);
    }
    return liveMarketData;
  };

  const currentBalanceTotal = getDisplayBalance();

  const isTxCredit = (tx) => {
    const typeLower = (tx.type || "").toLowerCase();
    const descLower = (tx.description || "").toLowerCase();
    if (
      typeLower.includes('debit') || 
      typeLower.includes('cost') || 
      typeLower.includes('withdraw') || 
      typeLower.includes('invest') || 
      typeLower.includes('plan')
    ) {
      return false;
    }
    return true; // default to credit
  };

  const getFilteredTxList = () => {
    if (txFilter === "All") return rawTransactions;
    if (txFilter === "Deposit") {
      return rawTransactions.filter(tx => (tx.type || "").toLowerCase().includes("deposit"));
    }
    if (txFilter === "Withdrawal") {
      return rawTransactions.filter(tx => (tx.type || "").toLowerCase().includes("withdraw"));
    }
    if (txFilter === "Bonus") {
      return rawTransactions.filter(tx => 
        (tx.type || "").toLowerCase().includes("bonus") || 
        (tx.type || "").toLowerCase().includes("reward") || 
        (tx.type || "").toLowerCase().includes("checkin")
      );
    }
    return rawTransactions;
  };

  const filteredTxList = getFilteredTxList();
  const totalTxPages = Math.ceil(filteredTxList.length / 5) || 1;
  const getPaginatedTx = () => {
    return filteredTxList.slice((txPage - 1) * 5, txPage * 5);
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden relative">
      <div className="px-4 pt-4 pb-4 space-y-3">
        
        {/* Balance Card (Portfolio Overview) */}
        <div className="bg-gradient-to-br from-[#00629b]/20 via-[#111827]/90 to-[#0b0f19] rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden border border-amber-500/20 flex flex-col items-center text-center">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#0073b6]/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="flex items-center justify-center gap-1.5 mb-1.5 relative z-10 w-full">
            <span className="text-gray-400 text-[11px] font-bold tracking-wider uppercase">Portfolio Overview</span>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              {showBalance ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-1.5 mb-5 relative z-10">
            <h2 className="text-[26px] font-bold text-white tracking-tight leading-none">
              {showBalance ? currentBalanceTotal : "****"}
            </h2>
            <button 
              onClick={toggleCurrency}
              className="bg-white/5 hover:bg-white/10 text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 transition-colors"
            >
              {(currency === "USDT" || currency === (settings.currency_name || "USDT")) ? (settings.currency_name || "USDT") : (userProfile?.country?.currency_code || "NGN")}
            </button>
          </div>

          <div className="relative z-10 w-full flex justify-center">
            <Link 
              href="/dashboard/wallet/deposit" 
              className="bg-[#0073b6] hover:bg-[#00629b] text-[#111827] text-[12px] font-bold px-8 py-2 rounded-lg transition-all shadow-md active:scale-[0.98]"
            >
              Top up
            </Link>
          </div>
        </div>

        {/* Statistics Card (Deposits, Withdrawals, Earnings) */}
        <div className="bg-gradient-to-br from-[#00629b]/20 via-[#111827]/90 to-[#0b0f19] rounded-[24px] p-5 text-white shadow-xl relative overflow-hidden border border-amber-500/20 flex flex-col gap-4">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#0073b6]/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="flex items-center justify-center gap-1.5 relative z-10 w-full mb-1">
            <span className="text-gray-400 text-[11px] font-bold tracking-wider uppercase">Account Statistics</span>
          </div>

          <div className="flex flex-col gap-3.5 relative z-10 w-full">
            {/* Total Deposits */}
            <div className="flex items-center justify-between w-full">
              <div className="bg-white/5 text-gray-300 text-[11.5px] font-bold px-3 py-2 skew-x-[-12deg] rounded-[6px] w-[140px] text-center border border-white/5">
                <span className="inline-block skew-x-[12deg] uppercase tracking-wider text-[10px]">Total Deposits</span>
              </div>
              <div className="bg-[#a3e635] text-[#111827] text-[12px] font-extrabold px-3 py-2 skew-x-[-12deg] rounded-[6px] flex-1 max-w-[190px] text-center shadow-md">
                <span className="inline-block skew-x-[12deg] tracking-tight">
                  {showBalance ? getFormattedStat(userProfile?.statistics?.total_deposit) : "****"}
                </span>
              </div>
            </div>

            {/* Total Withdrawals */}
            <div className="flex items-center justify-between w-full">
              <div className="bg-white/5 text-gray-300 text-[11.5px] font-bold px-3 py-2 skew-x-[-12deg] rounded-[6px] w-[140px] text-center border border-white/5">
                <span className="inline-block skew-x-[12deg] uppercase tracking-wider text-[10px]">Total Withdrawals</span>
              </div>
              <div className="bg-[#a3e635] text-[#111827] text-[12px] font-extrabold px-3 py-2 skew-x-[-12deg] rounded-[6px] flex-1 max-w-[190px] text-center shadow-md">
                <span className="inline-block skew-x-[12deg] tracking-tight">
                  {showBalance ? getFormattedStat(userProfile?.statistics?.total_withdrawal) : "****"}
                </span>
              </div>
            </div>

            {/* Total Earnings */}
            <div className="flex items-center justify-between w-full">
              <div className="bg-white/5 text-gray-300 text-[11.5px] font-bold px-3 py-2 skew-x-[-12deg] rounded-[6px] w-[140px] text-center border border-white/5">
                <span className="inline-block skew-x-[12deg] uppercase tracking-wider text-[10px]">Total Earnings</span>
              </div>
              <div className="bg-[#a3e635] text-[#111827] text-[12px] font-extrabold px-3 py-2 skew-x-[-12deg] rounded-[6px] flex-1 max-w-[190px] text-center shadow-md">
                <span className="inline-block skew-x-[12deg] tracking-tight">
                  {showBalance ? getFormattedStat(userProfile?.statistics?.total_income) : "****"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="bg-[#111827] rounded-[24px] p-4 shadow-sm border border-white/5">
          <div className="grid grid-cols-4 gap-y-5 gap-x-2">
            {[
              { label: "Deposit", emoji: "💰", action: () => router.push('/dashboard/wallet/deposit') },
              { label: "Withdraw", emoji: "↩", action: () => router.push('/dashboard/wallet/withdraw') },
              { label: "Mine", emoji: "⛏️", action: () => router.push('/dashboard/mining') },
              { label: "Active Mining", emoji: "⚡", action: () => router.push('/dashboard/investments') },
              { label: "Daily Check-in", emoji: "📅", action: () => window.dispatchEvent(new Event('open-daily-checkin')) },
              { label: "Transaction Log", emoji: "📋", action: () => router.push('/dashboard/transactions') },
              { label: "Bonus Code", emoji: "🎁", action: () => router.push('/dashboard/treasure') },
              { 
                label: "Download App", 
                emoji: "⬇️", 
                action: () => {
                  if (isInstallable) {
                    installPWA();
                  } else {
                    window.dispatchEvent(new Event('open-install-guide'));
                  }
                } 
              },
              { label: "Referrals", emoji: "👥", action: () => router.push('/dashboard/invite') },
              { label: "Settings", emoji: "⚙️", action: () => router.push('/dashboard/settings') },
              { 
                label: "WhatsApp Group", 
                emoji: "💬", 
                action: () => {
                  window.dispatchEvent(new Event('open-whatsapp-modal'));
                } 
              },
            ].map((item, idx) => (
              <div 
                key={idx} 
                onClick={item.action} 
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div className="text-[24px] select-none group-hover:scale-115 transition-transform duration-200 py-1">
                  {item.emoji}
                </div>
                <span className="text-[10px] text-white/80 font-medium text-center leading-tight">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>




        {/* Live Performance */}
        {isMarketVisible && (
          <div className="mt-5">
            <h3 className="font-semibold text-white/95 text-[15px] mb-3 px-1">Live Performance</h3>
            
            {/* Tabs */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              {["Hot", "Gainers", "Losers", "Turnover"].map((tab) => {
                const isActive = activeMarketTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveMarketTab(tab)}
                    className={`px-4 py-1.5 rounded-[8px] text-[12px] font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? "border-[#0073b6] text-[#0073b6] bg-amber-500/5 shadow-sm shadow-amber-500/5" 
                        : "border-white/5 text-gray-400 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Market Table Card */}
            <div className="bg-[#111827] rounded-[18px] p-4 shadow-sm border border-white/5">
              {/* Header */}
              <div className="grid grid-cols-3 text-[10px] font-bold text-gray-500 tracking-wider uppercase pb-2 border-b border-white/5 mb-1.5">
                <div>Pair</div>
                <div className="text-center">Amount</div>
                <div className="text-right">Change</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/5">
                {getTabAssets().map((asset, index) => {
                  const symbol = asset.symbol || "USDT";
                  const displaySymbol = symbol.toUpperCase().includes("USDT")
                    ? symbol.toUpperCase()
                    : `${symbol.toUpperCase()}/USDT`;

                  const amount = parseFloat(asset.current_price || 0);
                  const change = parseFloat(asset.price_change_24h || 0);
                  const isPositive = change >= 0;

                  // Format amount appropriately
                  const formattedAmount = symbol.toUpperCase() === "SHIB"
                    ? "$0.00"
                    : amount >= 1000
                      ? `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : amount >= 1
                        ? `$${amount.toFixed(2)}`
                        : `$${amount.toFixed(4)}`;

                  // Check flash direction
                  const flash = priceFlash[symbol];
                  const flashClass = flash === "up"
                    ? "text-green-400 font-bold scale-105"
                    : flash === "down"
                      ? "text-red-400 font-bold scale-105"
                      : "text-white/80";

                  return (
                    <div key={`${asset.id || index}-${symbol}`} className="grid grid-cols-3 items-center py-2.5 text-[13px]">
                      {/* Pair name */}
                      <div className="font-semibold text-white/95">{displaySymbol}</div>
                      
                      {/* Amount / Price */}
                      <div className={`text-center font-medium transition-all duration-300 ${flashClass}`}>
                        {formattedAmount}
                      </div>
                      
                      {/* Percentage Change */}
                      <div className={`text-right font-semibold flex items-center justify-end gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        <span>{isPositive ? '↑' : '↓'}</span>
                        <span>{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}


        {/* Referral / Mentor Network */}
        <div className="mt-5">
          <h3 className="font-semibold text-white/95 text-[15px] mb-3 px-1">Referral / Mentor Network</h3>
          <div className="bg-[#111827] rounded-[18px] p-5 shadow-sm border border-amber-500/10">
            {/* Network Graph Graphic */}
            <div className="relative mb-5 flex justify-center items-center bg-[#0e1320] rounded-[14px] py-4 border border-white/5">
              <svg className="w-full max-w-[280px] h-[110px]" viewBox="0 0 280 110" fill="none">
                <defs>
                  <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Lines radiating from the central bright node (140, 60) */}
                <line x1="140" y1="60" x2="140" y2="30" stroke="#0073b6" strokeWidth="1" opacity="0.3" />
                <line x1="140" y1="60" x2="60" y2="35" stroke="#0073b6" strokeWidth="1" opacity="0.15" />
                <line x1="140" y1="60" x2="45" y2="65" stroke="#0073b6" strokeWidth="1" opacity="0.15" />
                <line x1="140" y1="60" x2="75" y2="85" stroke="#0073b6" strokeWidth="1" opacity="0.15" />
                <line x1="140" y1="60" x2="220" y2="35" stroke="#0073b6" strokeWidth="1" opacity="0.15" />
                <line x1="140" y1="60" x2="240" y2="70" stroke="#0073b6" strokeWidth="1" opacity="0.15" />
                <line x1="140" y1="60" x2="225" y2="90" stroke="#0073b6" strokeWidth="1" opacity="0.15" />

                {/* Left Group Nodes */}
                <circle cx="60" cy="35" r="7" fill="#00629b" opacity="0.8" filter="url(#glow-gold)" />
                <circle cx="45" cy="65" r="7" fill="#00629b" opacity="0.8" filter="url(#glow-gold)" />
                <circle cx="75" cy="85" r="7" fill="#00629b" opacity="0.8" filter="url(#glow-gold)" />

                {/* Middle Group Nodes */}
                <circle cx="140" cy="30" r="7" fill="#00629b" opacity="0.8" filter="url(#glow-gold)" />
                <circle cx="140" cy="60" r="9" fill="#0073b6" filter="url(#glow-gold)" />

                {/* Right Group Nodes */}
                <circle cx="220" cy="35" r="7" fill="#00629b" opacity="0.8" filter="url(#glow-gold)" />
                <circle cx="240" cy="70" r="7" fill="#00629b" opacity="0.8" filter="url(#glow-gold)" />
                <circle cx="225" cy="90" r="7" fill="#00629b" opacity="0.8" filter="url(#glow-gold)" />
              </svg>
            </div>

            <p className="text-gray-400 text-[12px] mb-4 leading-relaxed">
              {siteName} offers a 4-level referral system. Invite friends and earn free spins to spin the wheel and win big!
            </p>
            
            <div className="space-y-1.5">
              <label className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Your referral link</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={userProfile?.referral_code ? `${referralDomain}/auth/register?ref=${userProfile.referral_code}` : "Loading..."}
                  className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-[12px] text-white/90 outline-none focus:border-amber-500/50"
                />
                <button 
                  onClick={() => {
                    if (userProfile?.referral_code) {
                      navigator.clipboard.writeText(`${referralDomain}/auth/register?ref=${userProfile.referral_code}`);
                      toast.success("Referral link copied!");
                    }
                  }}
                  className="bg-[#0073b6] hover:bg-[#00629b] text-[#111827] text-[12px] font-bold px-4 py-2 rounded-lg transition-all active:scale-95 cursor-pointer"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transaction */}
        <div className="mt-5">
          <h3 className="font-semibold text-white/95 text-[15px] mb-3 px-1">Recent Transaction</h3>
          <div className="bg-[#111827] rounded-[18px] p-5 shadow-sm border border-amber-500/10">
          
          {/* Filters */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden px-1">
            {["All", "Deposit", "Withdrawal", "Bonus"].map((filter) => {
              const isActive = txFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => {
                    setTxFilter(filter);
                    setTxPage(1);
                  }}
                  className={`px-3 py-1 rounded-[6px] text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? "border-[#0073b6] text-[#0073b6] bg-amber-500/5" 
                      : "border-white/5 text-gray-400 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-left border-collapse min-w-[420px]">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="pb-2.5">Type</th>
                  <th className="pb-2.5 text-center">Amount</th>
                  <th className="pb-2.5 text-center">Date</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[12px]">
                {isLoadingTx ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500 mx-auto" />
                    </td>
                  </tr>
                ) : getPaginatedTx().length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-center">
                        <svg className="w-12 h-12 text-white/10 mb-3 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <line x1="10" y1="9" x2="8" y2="9" />
                        </svg>
                        <p className="text-[12px] text-gray-500 max-w-[240px] leading-relaxed mx-auto">
                          No transactions found yet. Your logs will appear here once you perform actions on the platform.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  getPaginatedTx().map((tx) => {
                    const isCredit = isTxCredit(tx);
                    const sign = isCredit ? "+" : "-";
                    const amountColor = isCredit ? "text-green-500" : "text-red-500";
                    const amountStr = `${sign}${settings.currency_symbol || '$'}${parseFloat(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    const dateObj = new Date(tx.created_at || Date.now());
                    const formattedDate = `${dateObj.getDate()}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getFullYear()).slice(-2)}`;
                    const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                    
                    const statusStr = (tx.status || "pending").toLowerCase();
                    const statusDisplayStr = (statusStr === "approved" || statusStr === "completed" || statusStr === "success") ? "success" : statusStr;
                    const statusBadgeClass = statusStr === "completed" || statusStr === "success" || statusStr === "approved"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : statusStr === "failed" || statusStr === "declined"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20";

                    const rawType = (tx.type || "").toUpperCase();
                    const rawDesc = (tx.description || "").toUpperCase();
                    const rawStatus = (tx.status || "").toUpperCase();
                    
                    let displayType = rawType.replace(/_/g, ' ');
                    if (rawType.includes("CREDIT") || rawDesc.includes("CREDIT") || rawDesc.includes("MANUAL CREDIT") || rawDesc.includes("DEPOSIT SUCCESSFUL")) {
                      displayType = "DEPOSIT SUCCESSFUL";
                    } else if (rawType.includes("INVEST") || rawType.includes("PLAN") || rawDesc.includes("INVEST")) {
                      displayType = "MINING POOL ACTIVATED";
                    } else if (rawType === "DEPOSIT") {
                      if (rawStatus === "APPROVED" || rawStatus === "COMPLETED" || rawStatus === "SUCCESS") {
                        displayType = "DEPOSIT CREDITED";
                      } else {
                        displayType = "DEPOSIT INITIATED";
                      }
                    } else if (rawType.includes("PROFIT") || rawDesc.includes("PROFIT")) {
                      displayType = "DAILY PROFITS";
                    } else {
                      displayType = displayType.toUpperCase();
                    }

                    return (
                      <tr key={tx.id}>
                        <td className="py-3 font-semibold text-white/90">{displayType}</td>
                        <td className={`py-3 text-center font-bold ${amountColor}`}>{amountStr}</td>
                        <td className="py-3 text-center text-gray-400">
                          <div>{formattedDate}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{formattedTime}</div>
                        </td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold ${statusBadgeClass}`}>
                            {statusDisplayStr}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoadingTx && filteredTxList.length > 5 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 px-1 text-[12px]">
              <button
                onClick={() => setTxPage(prev => Math.max(1, prev - 1))}
                disabled={txPage === 1}
                className="w-8 h-8 rounded-lg border border-white/5 bg-white/5 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors cursor-pointer"
              >
                ‹
              </button>
              <span className="text-gray-400">
                Page {txPage} of {totalTxPages}
              </span>
              <button
                onClick={() => setTxPage(prev => Math.min(totalTxPages, prev + 1))}
                disabled={txPage === totalTxPages}
                className="w-8 h-8 rounded-lg border border-white/5 bg-white/5 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors cursor-pointer"
              >
                ›
              </button>
            </div>
          )}
          </div>
        </div>

      </div>

      {/* Events Modal */}
      {showEventsModal && (
        <div 
          onClick={() => setShowEventsModal(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111827] border border-white/10 rounded-[20px] w-full max-w-[340px] p-5 shadow-xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-[#0073b6] mb-4">
                <Gift size={24} />
              </div>
              <h3 className="text-white/90 text-[16px] font-bold mb-2">Events & Rewards</h3>
              <p className="text-gray-400 text-[13px] leading-relaxed mb-6">
                Nothing on the calendar yet — we're cooking up something special. Stay tuned for exclusive events, bonus campaigns, and surprises. We'll notify you here as soon as the next one drops.
              </p>
              <button
                onClick={() => setShowEventsModal(false)}
                className="w-full py-2.5 rounded-[12px] bg-[#0073b6] hover:bg-[#00629b] text-[#111827] font-bold text-[13px] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1e293b] text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-5 duration-300">
          <span className="text-[13px] font-medium">Coming Soon!</span>
        </div>
      )}

      <WhatsAppModal />
    </div>
  );
}
