"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Wallet, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useFetchData } from "@/hooks/useApi";
import { formatCurrency } from "@/lib/utils";

export default function MyInvestmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active"); // "active" or "completed"
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const { data: invRes, isLoading } = useFetchData("/users/me/investments", ["my-investments"]);
  
  const investments = invRes?.data || { active: [], completed: [], stats: { total_invested: 0, active_count: 0, est_monthly: 0 } };
  
  const currentList = activeTab === "active" ? investments.active : investments.completed;

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto  [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="bg-[#111827] px-4 pt-4 pb-3 flex justify-between items-center shadow-sm z-10 sticky top-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <h1 className="text-white/90 text-[15px] font-bold">My Investments</h1>
        </div>
        <Link href="/dashboard/mining" className="w-8 h-8 bg-[#0073b6] rounded-md flex items-center justify-center text-white hover:bg-amber-600 transition-colors shadow-sm cursor-pointer">
          <Plus size={16} />
        </Link>
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-[480px] mx-auto w-full pb-10">
        {/* Tabs */}
        <div className="flex p-1 bg-[#111827] rounded-[12px] border border-white/5 shadow-sm">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2 rounded-[8px] text-[13px] font-bold transition-colors cursor-pointer ${activeTab === "active"
                ? "bg-[#0073b6] text-white"
                : "text-gray-400 hover:bg-white/5"
              }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-2 rounded-[8px] text-[13px] font-bold transition-colors cursor-pointer ${activeTab === "completed"
                ? "bg-[#0073b6] text-white"
                : "text-gray-400 hover:bg-white/5"
              }`}
          >
            Completed
          </button>
        </div>

        {/* Stats Card */}
        <div className="bg-[#0073b6] rounded-lg px-4 py-2 text-white shadow-[0_4px_14px_rgba(59,130,246,0.3)] flex justify-between items-center">
          <div className="text-center flex-1">
            <div className="text-[18px] font-bold tracking-tight">{settings.currency_symbol || "$"}{Number(investments.stats.total_invested).toFixed(2)}</div>
            <div className="text-[10px] text-white/80">Total Invested</div>
          </div>
          <div className="text-center flex-1 border-x border-white/20">
            <div className="text-[18px] font-bold tracking-tight">{investments.stats.active_count}</div>
            <div className="text-[10px] text-white/80 capitalize">Active</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-[18px] font-bold tracking-tight">{settings.currency_symbol || "$"}{Number(investments.stats.est_monthly).toFixed(2)}</div>
            <div className="text-[10px] text-white/80">Expected Return</div>
          </div>
        </div>

        {/* Investment List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-6 h-6 border-2 border-[#0073b6] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 pb-12 gap-3">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border-4 border-[#111827] shadow-sm relative">
              <div className="absolute top-0 right-0 w-2 h-2 bg-[#111827] rounded-bl-sm"></div>
              <Wallet size={24} className="text-gray-500" />
            </div>
            <span className="text-[13px] text-gray-400">
              No {activeTab === "active" ? "Active" : "Completed"} investments
            </span>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {currentList.map((inv) => {
              const startDate = new Date(inv.created_at);
              const formattedStart = `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
              const endDate = inv.end_date ? new Date(inv.end_date) : null;
              const formattedEnd = endDate ? `${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` : '';

              return (
                <div key={inv.id} className="bg-[#111827] rounded-[16px] p-4 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#0073b6]"></div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-bold text-[15px]">{inv.plan?.name || 'Investment Plan'}</h3>
                      <div className="text-gray-400 text-[11px] mt-0.5">{formattedStart}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold ${activeTab === 'active' ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'}`}>
                      {activeTab === 'active' ? 'ACTIVE' : 'COMPLETED'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white/5 p-2 rounded-lg">
                      <div className="text-gray-400 text-[10px] mb-1">Amount Invested</div>
                      <div className="text-white font-bold text-[13px]">{settings.currency_symbol || "$"}{Number(inv.amount).toFixed(2)}</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg">
                      <div className="text-gray-400 text-[10px] mb-1">Expected Return</div>
                      <div className="text-green-400 font-bold text-[13px]">
                         {inv.plan?.daily_income ? `${inv.plan.daily_income}% Daily` : 'Variable'}
                      </div>
                    </div>
                  </div>
                  
                  {activeTab === 'active' && inv.end_date && (
                    <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                      <Clock size={12} className="text-amber-400" />
                      <span>Ends: {formattedEnd}</span>
                    </div>
                  )}
                  {activeTab === 'completed' && (
                    <div className="flex items-center gap-1.5 text-green-400 text-[11px]">
                      <CheckCircle2 size={12} />
                      <span>Successfully matured</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
