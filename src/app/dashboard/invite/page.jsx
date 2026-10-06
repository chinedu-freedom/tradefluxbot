"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Copy, 
  Share2, 
  Users, 
  Gift, 
  QrCode,
  Check,
  DollarSign,
  Diamond
} from "lucide-react";
import QRCode from "react-qr-code";
import { useFetchData } from "@/hooks/useApi";

export default function InvitePage() {
  const router = useRouter();
  const [copied, setCopied] = useState("");
  const [invitationLink, setInvitationLink] = useState("");

  const { data: userRes, isLoading } = useFetchData("/users/me", ["user-profile"]);
  const user = userRes?.user;
  
  const invitationCode = user?.referral_code || "------";

  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const siteName = settingsRes?.settings?.site_name || "TradeFluxBot";

  useEffect(() => {
    if (invitationCode && invitationCode !== "------") {
      setInvitationLink(`${window.location.origin}/auth/register?ref=${invitationCode}`);
    }
  }, [invitationCode]);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleShare = async () => {
    if (navigator.share && invitationLink) {
      try {
        await navigator.share({
          title: `Join ${siteName}`,
          text: `Use my invitation code to join ${siteName} and start earning!`,
          url: invitationLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy(invitationLink, "link");
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden relative pb-20">
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-4 h-[1px] bg-white/20 -rotate-45"></div>
        <div className="absolute top-[8%] right-[20%] w-3 h-[1px] bg-white/20 rotate-45"></div>
        <div className="absolute top-[25%] left-[5%] w-6 h-[1px] bg-white/10 -rotate-45"></div>
        <div className="absolute top-[35%] right-[8%] w-8 h-[1px] bg-white/10 -rotate-45"></div>
        <div className="absolute top-[45%] left-[12%] w-4 h-[1px] bg-white/20 rotate-45"></div>
        <div className="absolute bottom-[30%] left-[8%] w-4 h-[1px] bg-white/10 rotate-45"></div>
        <div className="absolute bottom-[20%] right-[15%] w-6 h-[1px] bg-white/10 -rotate-45"></div>
        
        <div className="absolute top-[5%] left-[30%] opacity-[0.05] text-white">
          <Diamond size={24} />
        </div>
        <div className="absolute top-[20%] right-[15%] opacity-[0.05] text-white">
          <DollarSign size={28} />
        </div>
        <div className="absolute bottom-[40%] right-[5%] opacity-[0.03] text-white">
          <Diamond size={40} />
        </div>
        <div className="absolute bottom-[10%] left-[10%] opacity-[0.05] text-white">
          <DollarSign size={20} />
        </div>
        <div className="absolute bottom-[15%] right-[25%] w-2 h-2 bg-yellow-500/20 rounded-full blur-[1px]"></div>
        <div className="absolute top-[30%] left-[20%] w-1.5 h-1.5 bg-amber-500/30 rounded-full blur-[1px]"></div>
      </div>
      
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-center sticky top-0 z-20 bg-[#0b0f19]/60 backdrop-blur-md">
        <h1 className="text-white text-[14px] font-bold">Invite Friends</h1>
      </div>

      <div className="px-4 mt-2 flex flex-col items-center max-w-[480px] mx-auto w-full z-10">
        
        <p className="text-white/80 text-center text-[11px] leading-snug mb-5 max-w-[260px]">
          Let's pass {siteName} to the world together, so everyone feels joy and reward
        </p>

        {/* QR Code */}
        <div className="bg-white p-2.5 rounded-[16px] mb-5 shadow-lg relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-[16px]">
              <div className="w-6 h-6 border-2 border-[#00629b] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div className="w-[130px] h-[130px] flex items-center justify-center rounded-[10px] overflow-hidden">
            {invitationLink ? (
              <QRCode value={invitationLink} size={130} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
            ) : (
              <QrCode size={130} strokeWidth={1} className="text-[#0f172a]/20" />
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="w-full space-y-2 mb-4">
          {/* Invitation Code */}
          <div className="bg-[#111827] border border-white/5 rounded-[12px] p-3 flex items-center justify-between shadow-md">
            <div>
              <div className="text-white/50 text-[10px] mb-1 font-medium">Invitation code</div>
              <div className="text-white/90 font-bold text-[13px]">{invitationCode}</div>
            </div>
            <button 
              onClick={() => handleCopy(invitationCode, "code")}
              className="w-8 h-8 border border-white/10 rounded-[10px] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {copied === "code" ? <Check size={14} className="text-[#34d399] cursor-pointer" /> : <Copy size={14} className="cursor-pointer" />}
            </button>
          </div>

          {/* Invitation Link */}
          <div className="bg-[#111827] border border-white/5 rounded-[12px] p-3 flex items-center justify-between shadow-md">
            <div className="overflow-hidden pr-3">
              <div className="text-white/50 text-[10px] mb-1 font-medium">Invitation link</div>
              <div className="text-white/90 font-bold text-[11px] truncate">{invitationLink}</div>
            </div>
            <button 
              onClick={() => handleCopy(invitationLink, "link")}
              className="w-8 h-8 shrink-0 border border-white/10 rounded-[10px] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {copied === "link" ? <Check size={14} className="text-[#34d399] cursor-pointer" /> : <Copy size={14} className="cursor-pointer" />}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex gap-2 mb-5">
          <button onClick={handleShare} className=" cursor-pointer flex-1 bg-[#0073b6] text-white flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[12px] font-bold hover:bg-[#00629b] active:scale-[0.98] transition-all shadow-md">
            <Share2 size={14} /> Share Link
          </button>
          <button 
            onClick={() => router.push('/dashboard/team')}
            className="cursor-pointer flex-1 bg-white/5 border border-white/5 text-white/90 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[12px] font-bold hover:bg-white/10 active:scale-[0.98] transition-all shadow-md"
          >
            <Users size={14} /> My Team
          </button>
        </div>

        {/* Referral Rewards Banner */}
        <div className="w-full bg-amber-900/20 border border-white/5 rounded-[16px] p-4 text-center shadow-md relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0073b6]/5 to-transparent"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="flex items-center justify-center">
                <Gift size={14} className="text-[#fbbf24]" fill="#fbbf24" fillOpacity={0.2} />
              </div>
              <h3 className="text-white/90 font-bold text-[13px]">Referral Rewards</h3>
            </div>
            
            <p className="text-white/70 text-[10px] leading-relaxed max-w-[260px]">
              {/* Earn up to 10% commission on your referrals' investments. The more friends you invite, the more you earn! */}
              Earn 5% direct commission on any deposit made by friends you invite!

            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
