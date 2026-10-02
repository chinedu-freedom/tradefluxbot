"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet, X, Loader2, Zap, Clock, ShieldCheck, Cpu, TrendingUp, ChevronRight, Layers, Coins } from "lucide-react";
import Link from "next/link";
import { useFetchData } from "@/hooks/useApi";
import { postData } from "@/config/apiHelpers";
import { toast } from "sonner";

export default function MiningPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const { data: plansRes, isLoading } = useFetchData("/plans", ["plans"]);
  const { data: userRes } = useFetchData("/users/me", ["user"]);
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const plans = Array.isArray(plansRes?.data) 
    ? [...plansRes.data].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];
  const router = useRouter();

  const balances = {
    main: Number(userRes?.user?.balance || 0) + Number(userRes?.user?.withdrawable_balance || 0)
  };

  const [isInvesting, setIsInvesting] = useState(false);

  const handleInvest = async () => {
    if (!selectedPlan || !investmentAmount) {
      toast.error("Please enter an investment amount");
      return;
    }
    
    setIsInvesting(true);
    try {
      const data = await postData('/plans/invest', {
        planId: selectedPlan.id,
        amount: parseFloat(investmentAmount),
        source: "main"
      });
      
      if (data?.success) {
        toast.success(data.message || "Plan activated successfully! Your investment is now running.");
        setSelectedPlan(null);
        setInvestmentAmount("");
        setTimeout(() => {
          router.push("/dashboard/investments");
        }, 1500);
      } else {
        toast.error(data.error || "Investment failed");
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errMsg);
    } finally {
      setIsInvesting(false);
    }
  };

  const handleMineClick = (plan) => {
    setSelectedPlan(plan);
    setBalanceSource("main");
    setInvestmentAmount("");
  };

  const closeModal = () => {
    setSelectedPlan(null);
  };

  // Calculations
  const amount = parseFloat(investmentAmount) || 0;
  const dailyIncome = selectedPlan ? (amount * Number(selectedPlan.daily_income)) / 100 : 0;
  const totalReturn = selectedPlan ? (dailyIncome * selectedPlan.duration) : 0;

  // Format currency helper
  const formatCurrency = (val) => {
    const symbol = settings.currency_symbol || "$";
    return `${symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto  [&::-webkit-scrollbar]:hidden relative">
      {/* Header */}
      <div className="bg-[#111827] px-4 pt-4 pb-3 flex justify-between items-center shadow-sm z-10 sticky top-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <h1 className="text-white/90 text-[15px] font-bold">Mining Contracts</h1>
        </div>
        <Link href="/dashboard/investments" className="w-8 h-8 bg-[#0073b6] rounded-md flex items-center justify-center text-white hover:bg-amber-600 transition-colors shadow-sm cursor-pointer">
          <Wallet size={14} />
        </Link>
      </div>

      {/* Plans List */}
      <div className="px-4 pt-4 pb-24 space-y-4 max-w-[480px] mx-auto w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#0073b6]" />
            <p className="text-sm font-medium">Loading plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-sm font-medium">No plans available.</p>
          </div>
        ) : plans.map((plan) => (
          <div key={plan.id} className="bg-[#111827] rounded-[12px] p-3 border border-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-3">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  {plan.image ? (
                    <img src={plan.image} alt={plan.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Layers className="text-[#0073b6]" size={18} strokeWidth={2.5} />
                  )}
                </div>
                <h2 className="text-white/90 font-extrabold text-[14px] uppercase tracking-wide">{plan.name}</h2>
              </div>
              <div className="text-[#0073b6] font-extrabold text-[18px] leading-none">
                {Number(plan.daily_income).toFixed(1)}%
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-1.5 mt-0.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-[11px] font-medium">Minimum Deposit:</span>
                <span className="text-white/90 font-bold text-[11px]">{formatCurrency(Number(plan.min_investment))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-[11px] font-medium">Maximum Deposit:</span>
                <span className="text-white/90 font-bold text-[11px]">{formatCurrency(Number(plan.max_investment))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-[11px] font-medium">Mining Duration:</span>
                <span className="text-white/90 font-bold text-[11px]">{plan.duration} Days</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleMineClick(plan)}
              className="cursor-pointer w-full mt-0.5 bg-[#0073b6] text-white font-bold py-2 rounded-lg hover:bg-amber-600 transition-colors text-[12px] shadow-sm flex items-center justify-center gap-2"
            >
             {/* <Cpu size={14} /> */}
              Activate Pool
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="bg-[#0b0f19] border border-white/10 w-full max-w-[800px] rounded-t-[24px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-full duration-300 ease-out shadow-2xl"
            style={{ maxHeight: '90vh' }}
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1 bg-white/20 rounded-full"></div>
            </div>

            {/* Modal Header */}
            <div className="flex justify-between items-start px-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-[42px] h-[42px] bg-[#020617] rounded-full flex items-center justify-center shadow-inner relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent"></div>
                  {selectedPlan.image ? (
                    <img src={selectedPlan.image} alt={selectedPlan.name} className="w-full h-full object-cover z-10" />
                  ) : (
                    <div className="w-[18px] h-[26px] border border-amber-400/50 rounded flex flex-col items-center justify-center bg-[#0f172a] z-10 shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                      <span className="text-amber-400 text-[9px] font-bold leading-none">{selectedPlan.duration}</span>
                      <span className="text-white text-[4px] opacity-80 uppercase mt-0.5">Days</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white/90 text-[15px] leading-tight">{selectedPlan.name}</h3>
                  <p className="text-gray-400 text-[11px] mt-0.5">{selectedPlan.duration} days • {Number(selectedPlan.daily_income).toFixed(1)}% daily</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-gray-400 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-6 [&::-webkit-scrollbar]:hidden">

              <div className="flex justify-between items-center py-4 border-y border-white/5">
                <div className="text-center w-1/3">
                  <div className="text-[#22c55e] font-bold text-[14px]">{Number(selectedPlan.daily_income).toFixed(1)}%</div>
                  <div className="text-gray-400 text-[10px] mt-1">Daily Rate</div>
                </div>
                <div className="text-center w-1/3 border-x border-white/5">
                  <div className="text-[#0073b6] font-bold text-[14px]">{selectedPlan.duration} days</div>
                  <div className="text-gray-400 text-[10px] mt-1">Revenue Days</div>
                </div>
                <div className="text-center w-1/3">
                  <div className="text-[#0073b6] font-bold text-[14px]">{(Number(selectedPlan.daily_income) * selectedPlan.duration).toFixed(1)}%</div>
                  <div className="text-gray-400 text-[10px] mt-1">Total Yield</div>
                </div>
              </div>

              {/* Available Balance */}
              <div>
                <label className="block text-gray-400 text-[12px] mb-2">Available Balance</label>
                <div className="w-full py-4 rounded-[12px] border border-[#0073b6] bg-amber-900/10 flex flex-col items-center justify-center gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0073b6]">Earning & Deposit Balance</span>
                  <span className="text-[18px] text-white font-bold">{formatCurrency(balances.main)}</span>
                </div>
              </div>

              {/* Investment Amount */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="text-gray-400 text-[12px]">Investment Amount</label>
                  <span className="text-gray-400 text-[10px]">Min: {formatCurrency(Number(selectedPlan.min_investment))} | Max: {formatCurrency(Number(selectedPlan.max_investment))}</span>
                </div>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full border border-white/10 bg-[#111827] rounded-[12px] px-4 py-3.5 text-[14px] text-white/90 focus:outline-none focus:border-[#0073b6] focus:ring-1 focus:ring-[#0073b6] transition-all placeholder:text-gray-500"
                />
              </div>

              {/* Earnings Breakdown */}
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-gray-400 text-[12px]">Daily Income</span>
                  <span className="text-[#22c55e] text-[14px] font-bold">{formatCurrency(dailyIncome)}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-gray-400 text-[12px]">Total Return</span>
                  <span className="text-white/90 text-[14px] font-bold">{formatCurrency(totalReturn)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/5 bg-[#0b0f19] flex flex-col items-center gap-3">
              <div className="text-[12px] text-gray-400">
                 Balance: <span className="text-[#0073b6] font-bold">{formatCurrency(balances.main)}</span>
              </div>
              <button 
                onClick={handleInvest}
                disabled={isInvesting}
                className="w-full bg-[#0073b6] text-white font-bold py-4 rounded-[12px] hover:bg-amber-600 transition-colors text-[15px] shadow-md disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {isInvesting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Mining"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
