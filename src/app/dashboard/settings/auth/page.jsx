"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFetchData, usePost } from "@/hooks/useApi";
import { toast } from "sonner";
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from "lucide-react";

export default function AuthenticationSettingsPage() {
  const router = useRouter();

  const { data: userProfile, isLoading: isProfileLoading, refetch } = useFetchData("/users/me");

  // 1 = unverified, 2 = enter code, 3 = verified
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");

  const { mutate: sendCode, isPending: isSending } = usePost("/users/me/send-verification");
  const { mutate: verifyCode, isPending: isVerifying } = usePost("/users/me/verify-email");

  useEffect(() => {
    router.replace("/dashboard/settings");
  }, [router]);

  const handleSendCode = () => {
    sendCode({}, {
      onSuccess: (res) => {
        setStep(2);
      }
    });
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    verifyCode({ code }, {
      onSuccess: (res) => {
        setStep(3);
        refetch();
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] overflow-y-auto [&::-webkit-scrollbar]:hidden ">
      {/* Header */}
      <div className="bg-[#111827] px-4 py-3 flex items-center gap-2.5 sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button
          onClick={() => router.back()}
          className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors text-gray-400 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[15px] font-bold">Authentication</h1>
      </div>

      <div className="px-4 py-4 max-w-[480px] mx-auto w-full">
        <div className="bg-[#111827] rounded-[16px] border border-white/5 shadow-sm p-6">

          {/* Top Status Area */}
          <div className="flex flex-col items-center text-center">
            {step < 3 ? (
              <div className="w-[72px] h-[72px] bg-[#fef3c7] rounded-full flex items-center justify-center text-[#00629b] mb-4">
                <ShieldAlert size={36} className="fill-[#00629b] text-[#fef3c7]" />
              </div>
            ) : (
              <div className="w-[72px] h-[72px] bg-[#d1fae5] rounded-full flex items-center justify-center text-[#059669] mb-4">
                <ShieldCheck size={36} className="fill-[#059669] text-[#d1fae5]" />
              </div>
            )}

            <h2 className="text-white/90 text-[20px] font-bold mb-1.5">
              {step < 3 ? "Verify Your Email" : "Email Verified"}
            </h2>
            {isProfileLoading ? (
               <div className="h-4 bg-white/5 rounded animate-pulse w-48 mb-4"></div>
            ) : (
               <p className="text-gray-400 text-[14px] mb-4">
                 {userProfile?.user?.email}
               </p>
            )}

            {/* Pill Badge */}
            <div className="mb-8">
              {step < 3 ? (
                <div className="inline-flex items-center gap-1.5 bg-[#fef3c7] text-[#00629b] px-4 py-2 rounded-full text-[13px] font-bold">
                  <AlertTriangle size={16} className="fill-[#00629b] text-white" />
                  Unverified
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-[#d1fae5] text-[#059669] px-4 py-2 rounded-full text-[13px] font-bold">
                  <CheckCircle2 size={16} className="fill-[#059669] text-white" />
                  Verified
                </div>
              )}
            </div>
          </div>

          {/* Action Area based on step */}
          {step === 1 && (
            <button
              onClick={handleSendCode}
              disabled={isSending}
              className="w-full bg-[#0073b6] hover:bg-amber-700 disabled:bg-amber-400 flex items-center justify-center gap-2 text-white font-bold text-[15px] py-3.5 rounded-[12px] transition-colors shadow-sm cursor-pointer"
            >
              {isSending ?  <Loader2 size={18} className="animate-spin" /> : "Send Verification Code"     }
            </button>
          )}

          {step === 2 && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-white/80 text-[13px] font-medium">Enter Verification Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="0 0 0 0 0 0"
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-[12px] px-4 py-4 text-[16px] text-center tracking-[0.4em] font-medium text-white/90 placeholder-gray-500 focus:outline-none focus:border-[#0073b6] transition-all"
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full flex items-center justify-center gap-2 bg-[#0073b6] hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold text-[15px] py-3.5 rounded-[12px] transition-colors shadow-sm cursor-pointer"
              >
                {isVerifying ? <Loader2 size={18} className="animate-spin" /> : "Verify"}
              </button>

              <div className="text-center pt-2">
                <p className="text-[13px] text-gray-500">
                  Didn't receive the code? 
                  <button 
                    type="button" 
                    onClick={handleSendCode} 
                    disabled={isSending}
                    className="text-[#0073b6] hover:underline disabled:opacity-50 font-medium ml-1 cursor-pointer"
                  >
                    Resend
                  </button>
                </p>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
