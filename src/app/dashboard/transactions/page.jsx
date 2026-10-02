"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart2,
  FileText,
  ListFilter,
  Download,
  Upload,
  Gift,
  Inbox,
  Loader2
} from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function TransactionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");

  const tabs = [
    { id: "All", label: "All", icon: ListFilter },
    { id: "Deposits", label: "Deposits", icon: Download },
    { id: "Withdrawals", label: "Withdrawals", icon: Upload },
    { id: "Commission", label: "Commission", icon: Gift },
    { id: "Rewards", label: "Rewards", icon: Gift },
    { id: "Investments", label: "Investments", icon: BarChart2 },
  ];

  const getTransactionMeta = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes('deposit')) return { category: 'Deposits', icon: Download, iconBg: "bg-amber-100", iconColor: "text-amber-500" };
    if (t.includes('withdraw')) return { category: 'Withdrawals', icon: Upload, iconBg: "bg-red-100", iconColor: "text-red-500" };
    if (t.includes('commission') || t.includes('referral')) return { category: 'Commission', icon: Gift, iconBg: "bg-amber-100", iconColor: "text-amber-500" };
    if (t.includes('reward') || t.includes('gift') || t.includes('bonus') || t.includes('spin') || t.includes('task') || t.includes('checkin') || t.includes('admin_credit')) return { category: 'Rewards', icon: Gift, iconBg: "bg-green-100", iconColor: "text-green-500" };
    if (t.includes('invest') || t.includes('plan')) return { category: 'Investments', icon: BarChart2, iconBg: "bg-amber-100", iconColor: "text-amber-500" };
    return { category: 'Others', icon: FileText, iconBg: "bg-gray-100", iconColor: "text-gray-500" };
  };

  const { data: txRes, isLoading } = useFetchData("/users/transactions", ["transactions"]);
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const rawTransactions = txRes?.transactions || [];

  const transactions = rawTransactions.map(tx => {
    const meta = getTransactionMeta(tx.type);
    
    const typeLower = (tx.type || "").toLowerCase();
    const descLower = (tx.description || "").toLowerCase();
    
    let isCredit = false;
    if (
      typeLower.includes('debit') || 
      typeLower.includes('cost') || 
      typeLower.includes('withdraw') || 
      typeLower.includes('invest') || 
      typeLower.includes('plan')
    ) {
      isCredit = false;
    } else if (
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
      isCredit = true;
    } else if (tx.balance_before !== undefined && tx.balance_after !== undefined && tx.balance_before !== null && tx.balance_after !== null) {
      const diff = parseFloat(tx.balance_after) - parseFloat(tx.balance_before);
      if (diff !== 0) {
        isCredit = diff > 0;
      }
    }

    const baseSymbol = settings.currency_symbol || "$";
    const amountVal = parseFloat(tx.amount) || 0;
    let amountStr = "";
    
    if (isCredit) {
      amountStr = `+${baseSymbol}${Math.abs(amountVal).toFixed(2)}`;
    } else {
      amountStr = `-${baseSymbol}${Math.abs(amountVal).toFixed(2)}`;
    }

    const rawStatus = (tx.status || "SUCCESS").toUpperCase();
    const displayStatus = (rawStatus === "APPROVED") ? "SUCCESS" : rawStatus;

    const rawType = (tx.type || "").toUpperCase();
    const rawDesc = (tx.description || "").toUpperCase();
    
    let displayTitle = (tx.description || tx.type || "").replace(/_/g, ' ');
    if (rawType.includes("CREDIT") || rawDesc.includes("CREDIT") || rawDesc.includes("MANUAL CREDIT") || rawDesc.includes("DEPOSIT SUCCESSFUL")) {
      displayTitle = "DEPOSIT SUCCESSFUL";
    } else if (rawType.includes("INVEST") || rawType.includes("PLAN") || rawDesc.includes("INVEST")) {
      displayTitle = "MINING POOL ACTIVATED";
    } else if (rawType === "DEPOSIT") {
      if (rawStatus === "APPROVED" || rawStatus === "COMPLETED" || rawStatus === "SUCCESS") {
        displayTitle = "DEPOSIT CREDITED";
      } else {
        displayTitle = "DEPOSIT INITIATED";
      }
    } else if (rawType.includes("PROFIT") || rawDesc.includes("PROFIT")) {
      displayTitle = "DAILY PROFITS";
    } else {
      displayTitle = displayTitle.toUpperCase();
    }

    return {
      id: tx.id,
      title: displayTitle,
      date: new Date(tx.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }),
      amount: amountStr,
      status: displayStatus,
      type: meta.category,
      iconBg: meta.iconBg,
      iconColor: meta.iconColor,
      icon: meta.icon,
      wallet_address: tx.wallet_address || ""
    };
  });

  const filteredTransactions = activeTab === "All"
    ? transactions
    : transactions.filter(t => t.type === activeTab);

  const totalInflow = rawTransactions.reduce((acc, tx) => {
    const status = (tx.status || "SUCCESS").toUpperCase();
    if (status !== "SUCCESS" && status !== "APPROVED" && status !== "COMPLETED") {
      return acc;
    }

    const typeLower = (tx.type || "").toLowerCase();
    const descLower = (tx.description || "").toLowerCase();
    
    let isCredit = false;
    if (
      typeLower.includes('debit') || 
      typeLower.includes('cost') || 
      typeLower.includes('withdraw') || 
      typeLower.includes('invest') || 
      typeLower.includes('plan')
    ) {
      isCredit = false;
    } else if (
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
      isCredit = true;
    } else if (tx.balance_before !== undefined && tx.balance_after !== undefined && tx.balance_before !== null && tx.balance_after !== null) {
      const diff = parseFloat(tx.balance_after) - parseFloat(tx.balance_before);
      if (diff !== 0) {
        isCredit = diff > 0;
      }
    }

    if (!isCredit) {
      return acc;
    }

    const diff = parseFloat(tx.balance_after) - parseFloat(tx.balance_before);
    const amountVal = parseFloat(tx.amount) || 0;
    const addedAmount = diff > 0 ? diff : amountVal;

    return acc + addedAmount;
  }, 0);

  const totalCount = rawTransactions.length;

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden pb-10">

      {/* Header */}
      <div className="bg-[#111827] px-4 py-3.5 flex items-center sticky top-0 z-20 shadow-sm border-b border-white/5">
        <h1 className="text-white/90 text-[15px] font-bold">All Transactions</h1>
      </div>

      <div className="px-4 py-4 max-w-[480px] mx-auto w-full space-y-4">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#111827] rounded-[16px] p-4 border border-white/5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col">
            <div className="w-8 h-8 bg-amber-900/20 rounded-[8px] flex items-center justify-center text-[#0073b6] mb-3">
              <BarChart2 size={16} />
            </div>
            <div className="text-white/90 font-bold text-[18px] mb-0.5">
              {settings.currency_symbol || "$"}{totalInflow.toFixed(2)}
            </div>
            <div className="text-gray-400 text-[11px]">Total Inflow</div>
          </div>

          <div className="bg-[#111827] rounded-[16px] p-4 border border-white/5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col">
            <div className="w-8 h-8 bg-amber-900/20 rounded-[8px] flex items-center justify-center text-[#0073b6] mb-3">
              <FileText size={16} />
            </div>
            <div className="text-white/90 font-bold text-[18px] mb-0.5">{totalCount}</div>
            <div className="text-gray-400 text-[11px]">Transaction Count</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1 [&::-webkit-scrollbar]:hidden -mx-4 px-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-2 rounded-full whitespace-nowrap text-[12px] font-bold transition-all ${isActive
                    ? 'bg-[#0073b6] text-white shadow-[0_4px_10px_rgba(37,99,235,0.25)]'
                    : 'bg-[#111827] text-gray-400 border border-white/5 hover:bg-white/5'
                  }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-gray-400"} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Transaction List */}
        <div className="mt-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-[#0073b6] mb-2" />
              <span className="text-[12px] text-gray-500">Loading transactions...</span>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="space-y-2.5">
              {filteredTransactions.map(tx => (
                <div
                  key={tx.id}
                  onClick={() => {
                    const params = new URLSearchParams({
                      id: tx.id.toString(),
                      title: tx.title,
                      date: tx.date,
                      amount: tx.amount,
                      status: tx.status,
                      type: tx.type
                    });
                    if (tx.wallet_address) {
                      params.set("wallet_address", tx.wallet_address);
                    }
                    router.push(`/dashboard/transactions/receipt?${params.toString()}`);
                  }}
                  className="bg-[#111827] rounded-[14px] p-3 border border-white/5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex items-center justify-between cursor-pointer hover:bg-white/5 active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${tx.iconBg.replace('bg-', 'bg-').replace('100', '900/20')} ${tx.iconColor.replace('500', '400')}`}>
                      <tx.icon size={18} />
                    </div>
                    <div>
                      <div className="text-white/90 font-bold text-[13px] mb-0.5 max-w-[150px] truncate" title={tx.title}>{tx.title}</div>
                      <div className="text-gray-400 text-[10px]">{tx.date}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`font-bold text-[13px] ${tx.amount.startsWith('+') ? 'text-green-500' : (tx.amount.startsWith('-') ? 'text-red-500' : 'text-gray-400')}`}>
                      {tx.amount}
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-widest ${
                      tx.status?.toUpperCase() === 'PENDING' ? 'bg-orange-900/20 text-orange-400' :
                      (tx.status?.toUpperCase() === 'REJECTED' || tx.status?.toUpperCase() === 'FAILED') ? 'bg-red-900/20 text-red-400' :
                      'bg-emerald-900/20 text-emerald-400'
                    }`}>
                      {tx.status?.toUpperCase() || 'SUCCESS'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#111827] rounded-[16px] border-2 border-dashed border-white/5 p-8 flex flex-col items-center justify-center text-center mt-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 mb-3">
                <Inbox size={24} />
              </div>
              <h3 className="text-white/90 font-bold text-[14px] mb-1">No Transactions Yet</h3>
              <p className="text-gray-400 text-[11px]">Your transaction history will appear here</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
