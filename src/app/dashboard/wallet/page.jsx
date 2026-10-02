"use client";

import { useState, useEffect } from "react";
import { Wallet, Eye, EyeOff, ChevronDown, ChevronUp, Download, Upload, Clock, ArrowRight, Receipt, Loader2, ArrowUpRight, ArrowDownLeft, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFetchData } from "@/hooks/useApi";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSharedSettings } from "@/hooks/useSharedSettings";

export default function WalletPage() {
  const router = useRouter();
  const { currency, setCurrency, showBalance, setShowBalance } = useSharedSettings();

  const { data: userRes, isLoading: loadingUser } = useFetchData("/users/me", ["user"]);
  const { data: txRes, isLoading: loadingTx } = useFetchData("/users/transactions", ["transactions"]);

  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};

  const user = userRes?.user || {};
  const transactions = txRes?.transactions || [];

  const depositBalance = Number(user.balance || 0);
  const mainBalance = Number(user.withdrawable_balance || 0);
  const totalBalance = depositBalance + mainBalance;

  const toggleCurrency = () => {
    if (!user?.country) return;
    const localCurrency = user.country.currency_code?.trim() ? user.country.currency_code : "NGN";
    const baseCurrency = settings.currency_name || "USDT";
    setCurrency(prev => (prev === "USDT" || prev === baseCurrency) ? localCurrency : baseCurrency);
  };

  const formatMoney = (amountUSD) => {
    const usd = parseFloat(amountUSD || 0);
    const baseCurrency = settings.currency_name || "USDT";
    const baseSymbol = settings.currency_symbol || "$";
    if (currency === "USDT" || currency === baseCurrency) {
      return `${baseSymbol}${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      const exchangeRate = parseFloat(user?.country?.exchange_rate || 1);
      const localBalance = usd * exchangeRate;
      const symbol = user?.country?.currency_symbol || "";
      return `${symbol}${localBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const currentBalance = {
    total: formatMoney(totalBalance),
    deposit: formatMoney(depositBalance),
    main: formatMoney(mainBalance)
  };

  const handleAction = (actionPath) => {
    router.push(actionPath);
  };

  const getIsCredit = (tx) => {
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
    if (
      typeLower.includes('deposit') || 
      typeLower.includes('reward') || 
      typeLower.includes('bonus') || 
      typeLower.includes('gift') || 
      typeLower.includes('checkin') || 
      typeLower.includes('check-in') || 
      typeLower.includes('credit') || 
      typeLower.includes('commission') || 
      typeLower.includes('referral') || 
      typeLower.includes('migration') ||
      typeLower.includes('profit') ||
      typeLower.includes('payout') ||
      typeLower.includes('refund') ||
      descLower.includes('refund') ||
      descLower.includes('payout') ||
      descLower.includes('profit')
    ) {
      return true;
    }
    if (tx.balance_before !== undefined && tx.balance_after !== undefined && tx.balance_before !== null && tx.balance_after !== null) {
      const diff = parseFloat(tx.balance_after) - parseFloat(tx.balance_before);
      if (diff !== 0) {
        return diff > 0;
      }
    }
    return false;
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto  [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="bg-[#111827] px-4 pt-4 pb-3 flex justify-between items-center shadow-sm z-10 sticky top-0 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.back()}
            className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors text-gray-300 cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-white/90 text-[15px] font-bold">Wallet</h1>
        </div>
        <Link href="/dashboard/wallet" className="w-8 h-8 bg-[#0073b6] rounded-xl flex items-center justify-center text-white hover:bg-amber-600 transition-colors shadow-sm cursor-pointer">
          <Wallet size={14} />
        </Link>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-3 max-w-[480px] mx-auto w-full">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#00629b] to-[#0f172a] rounded-[16px] p-[16px] text-white shadow-lg relative overflow-hidden border border-white/10">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>

          {/* Top section */}
          <div className="flex justify-between items-start mb-1 relative z-10">
            <span className="text-[10px] text-white/90">Total Balance</span>
            <button
              onClick={toggleCurrency}
              className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-[9px] font-bold hover:bg-white/20 transition-colors cursor-pointer border border-white/10 backdrop-blur-sm"
            >
              {(currency === "USDT" || currency === (settings.currency_name || "USDT")) ? (settings.currency_name || "USDT") : (user?.country?.currency_code || "NGN")} {(currency === "USDT" || currency === (settings.currency_name || "USDT")) ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
            </button>
          </div>

          {/* Main Balance */}
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <span className="text-[24px] font-bold tracking-tight">
              {loadingUser ? <Loader2 className="w-5 h-5 animate-spin" /> : showBalance ? currentBalance.total : "****"}
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </div>

          {/* Sub Balances */}
          <div className="flex gap-2 mb-3.5 relative z-10">
            <div className="bg-white/10 rounded-lg p-2 flex-1 border border-white/10 backdrop-blur-sm">
              <div className="text-[7px] font-bold text-white/80 uppercase tracking-wide mb-1">Deposit</div>
              <div className="text-[10px] font-bold">{loadingUser ? "..." : showBalance ? currentBalance.deposit : "****"}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 flex-1 border border-white/10 backdrop-blur-sm">
              <div className="text-[7px] font-bold text-white/80 uppercase tracking-wide mb-1">Earning</div>
              <div className="text-[10px] font-bold">{loadingUser ? "..." : showBalance ? currentBalance.main : "****"}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 relative z-10">
            <button 
              onClick={() => handleAction("/dashboard/wallet/deposit")}
              className="cursor-pointer flex-1 bg-[#0073b6] text-white flex items-center justify-center gap-1.5 py-2 rounded-[8px] text-[11px] font-bold hover:bg-amber-600 transition-colors shadow-sm"
            >
              <Download size={12} /> Deposit
            </button>
            <button 
              onClick={() => handleAction("/dashboard/wallet/withdraw")}
              className="cursor-pointer flex-1 bg-white/10 text-white flex items-center justify-center gap-1.5 py-2 rounded-[8px] text-[11px] font-bold hover:bg-white/20 transition-colors border border-white/15 backdrop-blur-sm"
            >
              <Upload size={12} /> Withdraw
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-[#111827] rounded-[16px] p-[16px] border border-white/5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] min-h-[180px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#0073b6]" />
              <h2 className="text-white/90 font-bold text-[13px]">Recent Transactions</h2>
            </div>
            <Link href="/dashboard/transactions" className="flex items-center gap-1 text-[#0073b6] text-[10px] font-medium hover:text-amber-400 transition-colors cursor-pointer">
              View All <ArrowRight size={10} />
            </Link>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-2 min-h-[100px]">
            {loadingTx ? (
               <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            ) : transactions.length > 0 ? (
               <div className="w-full space-y-3">
                 {transactions.slice(0, 10).map((tx) => (
                   <div key={tx.id} className="flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/5">
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-green-900/20 text-green-400' : tx.type === 'WITHDRAWAL' ? 'bg-red-900/20 text-red-400' : 'bg-amber-900/20 text-amber-400'}`}>
                          {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={14} /> : tx.type === 'WITHDRAWAL' ? <ArrowUpRight size={14} /> : <Receipt size={14} />}
                        </div>
                        <div>
                          <div className="text-[12px] font-bold text-white/90">
                            {((tx.type || "").toUpperCase().includes("CREDIT") || (tx.description || "").toUpperCase().includes("MANUAL CREDIT"))
                              ? "DEPOSIT SUCCESSFUL"
                              : (tx.type || "").toUpperCase().includes("INVEST")
                                ? "MINING POOL ACTIVATED"
                                : (tx.type || "").toUpperCase() === "DEPOSIT"
                                  ? ((tx.status || "").toUpperCase() === "APPROVED" || (tx.status || "").toUpperCase() === "COMPLETED" || (tx.status || "").toUpperCase() === "SUCCESS")
                                    ? "DEPOSIT CREDITED"
                                    : "DEPOSIT INITIATED"
                                  : ((tx.type || "").toUpperCase().includes("PROFIT") || (tx.description || "").toUpperCase().includes("PROFIT"))
                                    ? "DAILY PROFITS"
                                    : (tx.type || "").toUpperCase().replace(/_/g, ' ')}
                          </div>
                          <div className="text-[9px] text-gray-400">{format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}</div>
                        </div>
                     </div>
                      <div className="text-right">
                         <div className={`text-[13px] font-bold ${
                           getIsCredit(tx) ? 'text-green-500' : 'text-red-500'
                         }`}>
                           {getIsCredit(tx) ? '+' : '-'}{settings.currency_symbol || "$"}{Number(tx.amount).toFixed(2)}
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
            ) : (
               <>
                 <div className="w-10 h-10 bg-[#111827] rounded-xl flex items-center justify-center border border-white/5 shadow-sm">
                   <Receipt size={18} className="text-gray-500" />
                 </div>
                 <span className="text-[11px] text-gray-400 font-medium">No transactions yet</span>
               </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
