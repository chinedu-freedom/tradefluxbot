"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Key, Gift, Info, Send, Ticket, Wallet, History, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFetchData, usePost } from "@/hooks/useApi";
import { toast } from "sonner";
import Image from "next/image";
import TelegramModal from "@/components/TelegramModal";

export default function TreasurePage() {
  const router = useRouter();
  const [giftCode, setGiftCode] = useState("");
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);

  useEffect(() => {
    // Open the Telegram modal immediately when the page loads
    setIsTelegramModalOpen(true);
  }, []);

  const { data: historyData, isLoading } = useFetchData("/users/treasure/history", ["treasure-history"]);
  const claimMutation = usePost("/users/treasure/claim", "treasure-history");
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};

  const claims = historyData?.claims || [];

  const handleClaim = (e) => {
    e.preventDefault();
    if (!giftCode.trim()) {
      toast.error("Please enter a gift code");
      return;
    }
    claimMutation.mutate({ code: giftCode.trim() }, {
      onSuccess: () => {
        setGiftCode("");
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden pb-20">
      {/* Header Section */}
      <div className="bg-[#111827] px-4 pt-6 pb-20 relative border-b border-white/5">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors z-10 relative mb-6 cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span className="text-[14px] font-medium">Back</span>
        </button>

        <div className="flex flex-col items-center text-center relative z-10">
          <div className="text-[64px] leading-none mb-3 drop-shadow-lg">
            🎁
          </div>
          <h1 className="text-white/90 text-[24px] font-bold mb-1 tracking-wide">Lucky Treasure</h1>
          <p className="text-gray-400 text-[13px]">Redeem your gift code for rewards</p>
        </div>
      </div>

      <div className="px-4 -mt-12 relative z-20 space-y-5">
        {/* Claim Card */}
        <div className="bg-[#111827] rounded-[20px] p-5 shadow-sm border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Ticket className="text-[#0073b6]" size={20} />
            <h2 className="text-[15px] font-bold text-white/90">Enter Gift Code</h2>
          </div>

          <form onSubmit={handleClaim}>
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value)}
                placeholder="Enter your code here..."
                className="w-full bg-white/5 border border-white/5 rounded-[12px] py-3 pl-10 pr-4 text-[14px] text-white/90 placeholder:text-gray-500 outline-none focus:border-[#0073b6] focus:bg-white/10 transition-colors"
                disabled={claimMutation.isPending}
              />
            </div>

            <button 
              type="submit"
              disabled={claimMutation.isPending || !giftCode.trim()}
              className="w-full bg-[#0073b6] hover:bg-[#1d4ed8] text-white py-3.5 rounded-[12px] font-bold text-[14px] flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
            >
              {claimMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Gift size={18} />
                  Claim Reward
                </>
              )}
            </button>
          </form>
        </div>

        {/* How It Works */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
              <Info className="text-[#0073b6]" size={12} />
            </div>
            <h3 className="font-bold text-white/90 text-[15px]">How It Works</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2.5">
            <div 
              onClick={() => setIsTelegramModalOpen(true)}
              className="bg-[#111827] p-3 rounded-[16px] flex flex-col items-center text-center border border-white/5 shadow-sm cursor-pointer hover:border-[#0073b6] transition-colors"
            >
              <div className="w-10 h-10 bg-amber-900/20 rounded-[10px] flex items-center justify-center mb-2">
                <Send className="text-[#0073b6]" size={18} />
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-tight">Get gift code from Telegram</p>
            </div>
            <div className="bg-[#111827] p-3 rounded-[16px] flex flex-col items-center text-center border border-white/5 shadow-sm">
              <div className="w-10 h-10 bg-amber-900/20 rounded-[10px] flex items-center justify-center mb-2">
                <Ticket className="text-[#0073b6]" size={18} />
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-tight">Enter your unique gift code</p>
            </div>
            <div className="bg-[#111827] p-3 rounded-[16px] flex flex-col items-center text-center border border-white/5 shadow-sm">
              <div className="w-10 h-10 bg-amber-900/20 rounded-[10px] flex items-center justify-center mb-2">
                <Wallet className="text-[#0073b6]" size={18} />
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-tight">Reward added to balance</p>
            </div>
          </div>
        </div>

        {/* Recent Redemptions */}
        <div>
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="flex items-center gap-2">
              <History className="text-[#0073b6]" size={18} />
              <h3 className="font-bold text-white/90 text-[15px]">Recent Redemptions</h3>
            </div>
            <button 
              onClick={() => router.push('/dashboard/transactions')}
              className="text-[#0073b6] text-[12px] font-medium flex items-center gap-1 hover:underline cursor-pointer"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          <div className="bg-[#111827] rounded-[16px] border border-white/5 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
              </div>
            ) : claims.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-white/5 rounded-[12px] flex items-center justify-center mb-3">
                  <Gift className="text-gray-400" size={24} />
                </div>
                <p className="text-[14px] text-gray-400 font-medium">No redemptions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {claims.map((claim) => (
                  <div key={claim.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-900/20 rounded-[10px] flex items-center justify-center shrink-0">
                        <Gift className="text-[#16a34a]" size={20} />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-white/90">
                          {claim.gift_code?.code_name || claim.gift_code?.code || 'Gift Reward'}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(claim.claimed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-bold text-[#10b981]">
                        +{settings.currency_symbol || "$"}{Number(claim.reward_amount).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium bg-white/5 border border-white/5 px-1.5 py-0.5 rounded mt-1 inline-block">
                        Claimed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <TelegramModal isOpen={isTelegramModalOpen} setIsOpen={setIsTelegramModalOpen} />
    </div>
  );
}
