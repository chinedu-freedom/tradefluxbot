"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Eye, EyeOff, Loader2, ShieldCheck, Mail, RefreshCw, CheckCircle2 } from "lucide-react";
import { usePut, usePost, useFetchData } from "@/hooks/useApi";
import { toast } from "sonner";

export default function PaymentSettingsPage() {
  const router = useRouter();
  const { data: userRes } = useFetchData("/users/me", ["profile"]);
  const user = userRes?.user || {};
  const hasPin = !!user?.has_withdrawal_pin;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Mutations
  const { mutate: updatePayment, isPending } = usePut("/users/me/payment", ["profile"]);
  const sendOtpMutation = usePost("/users/me/payment/send-otp", null, false, {
    showToast: true
  });

  // Cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Please enter and confirm your new withdrawal password first");
      return;
    }
    if (newPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await sendOtpMutation.mutateAsync({});
      setCooldown(60);
      // Toast is already displayed automatically by usePost hook
    } catch (err) {
      const remaining = err?.response?.data?.remainingSeconds;
      if (remaining) setCooldown(remaining);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Please fill in both password fields");
      return;
    }
    if (newPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      toast.error("Please enter the 6-digit email verification code");
      return;
    }

    updatePayment({ 
      newPassword, 
      otp: otpCode.trim() 
    }, {
      onSuccess: () => {
        setNewPassword("");
        setConfirmPassword("");
        setOtpCode("");
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="bg-[#111827] px-4 py-3.5 flex items-center sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button 
          onClick={() => router.push('/dashboard/settings')}
          className="mr-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[15px] font-bold">Payment & Withdrawal Password</h1>
      </div>

      <div className="px-4 py-5 max-w-[480px] mx-auto w-full space-y-4">
        {/* Security Notice */}
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-[16px] p-3.5 flex gap-3 text-xs leading-normal">
          <ShieldCheck size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-white/90 font-bold">2-Step Protected</p>
            <p className="text-gray-400">
              For your account safety, setting or modifying your withdrawal password requires an email verification code.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#111827] rounded-[20px] border border-white/5 shadow-xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white/90 text-[15px] font-bold">
                {hasPin ? "Update Withdrawal Password" : "Set Withdrawal Password"}
              </h2>
              <p className="text-gray-400 text-[12px] mt-0.5">
                Required to authorize payouts and link external crypto addresses.
              </p>
            </div>
            {hasPin ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-[11px] font-bold">
                <CheckCircle2 size={13} /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full text-[11px] font-bold">
                <AlertTriangle size={13} /> Not Set
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-white/80 text-[12px] font-semibold">New Withdrawal Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new withdrawal password"
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-[12px] pl-3.5 pr-10 py-2.5 text-[13.5px] text-white/90 placeholder-gray-600 focus:outline-none focus:border-[#0073b6] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-white/80 text-[12px] font-semibold">Confirm Withdrawal Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new withdrawal password"
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-[12px] pl-3.5 pr-10 py-2.5 text-[13.5px] text-white/90 placeholder-gray-600 focus:outline-none focus:border-[#0073b6] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Email OTP Verification */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center">
                <label className="text-gray-300 text-[12px] font-semibold flex items-center gap-1">
                  <Mail size={13} className="text-amber-400" /> Email Verification Code
                </label>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={cooldown > 0 || sendOtpMutation.isPending}
                  className={`text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    cooldown > 0 || sendOtpMutation.isPending
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-amber-400 hover:text-amber-300 underline"
                  }`}
                >
                  {sendOtpMutation.isPending ? (
                    <RefreshCw size={11} className="animate-spin" />
                  ) : cooldown > 0 ? (
                    `Resend (${cooldown}s)`
                  ) : (
                    "Send Code"
                  )}
                </button>
              </div>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code sent to your email"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-[#0b0f19] border border-white/10 text-white rounded-[12px] px-3.5 py-2.5 text-center text-base tracking-widest font-mono font-bold focus:outline-none focus:border-[#0073b6] placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:text-gray-600 transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending || !newPassword || !confirmPassword || otpCode.length < 6}
              className="w-full flex justify-center items-center gap-2 bg-[#0073b6] hover:bg-amber-500 disabled:opacity-50 text-black font-bold text-[14px] py-3 rounded-[12px] transition-all shadow-lg cursor-pointer mt-2"
            >
              {isPending ? (
                <Loader2 size={18} className="animate-spin text-black" />
              ) : hasPin ? (
                "Verify & Update Password"
              ) : (
                "Verify & Set Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
