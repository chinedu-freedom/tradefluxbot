"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2, Wallet, Info, ShieldCheck, Eye, EyeOff, Mail, RefreshCw } from "lucide-react";
import { useFetchData, usePost, useDelete } from "@/hooks/useApi";
import { toast } from "sonner";

export default function LinkedWalletsPage() {
  const router = useRouter();
  const [selectedCryptoId, setSelectedCryptoId] = useState("");
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  // 2-Step Verification states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [withdrawalPassword, setWithdrawalPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Fetch user profile for email display
  const { data: userRes } = useFetchData("/users/me", ["profile"]);
  const user = userRes?.user || {};

  // Fetch linked wallets
  const { data: walletsRes, isLoading: isLoadingWallets, refetch } = useFetchData("/wallets", ["user-wallets"]);
  const wallets = walletsRes?.wallets || [];

  // Fetch active payout cryptos to choose from
  const { data: cryptosRes, isLoading: isLoadingCryptos } = useFetchData("/settings/payout-cryptos", ["payout-cryptos"]);
  const cryptos = Array.isArray(cryptosRes) ? cryptosRes : cryptosRes?.data || [];

  const linkWalletMutation = usePost("/wallets", ["user-wallets"], false, {
    showToast: true,
    onError: (error) => {
      const errMsg = error?.response?.data?.error || error?.message || "";
      if (errMsg.includes("Please set your withdrawal password")) {
        setTimeout(() => {
          router.push("/dashboard/settings/payment");
        }, 1500);
      }
    }
  });

  const sendOtpMutation = usePost("/wallets/send-otp", null, false, {
    showToast: true
  });

  const unlinkWalletMutation = useDelete((id) => `/wallets/${id}`, "user-wallets");

  const selectedCrypto = cryptos.find(c => c.id === selectedCryptoId);

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
    if (!selectedCrypto || !address.trim()) return;
    try {
      await sendOtpMutation.mutateAsync({
        symbol: selectedCrypto.symbol,
        network: selectedCrypto.network,
        address: address.trim()
      });
      setCooldown(60);
      // Toast is already handled automatically by the usePost hook
      // toast.success(`Verification code sent to ${user.email || 'your email'}!`);
    } catch (err) {
      const remaining = err?.response?.data?.remainingSeconds;
      if (remaining) setCooldown(remaining);
    }
  };

  const handleOpenConfirm = async (e) => {
    e.preventDefault();
    if (!selectedCryptoId || !address.trim()) {
      toast.error("Please select a coin and enter a valid address");
      return;
    }
    setShowConfirmModal(true);
    setOtpCode("");
    setWithdrawalPassword("");
    // Trigger initial OTP sending
    handleSendOtp();
  };

  const handleConfirmLink = async () => {
    if (!otpCode.trim()) {
      toast.error("Please enter the email verification code");
      return;
    }
    if (!withdrawalPassword) {
      toast.error("Please enter your withdrawal password");
      return;
    }

    setIsLinking(true);
    try {
      const res = await linkWalletMutation.mutateAsync({
        symbol: selectedCrypto.symbol,
        network: selectedCrypto.network,
        address: address.trim(),
        label: label.trim() || undefined,
        withdrawalPassword: withdrawalPassword,
        otp: otpCode.trim()
      });
      if (res?.success) {
        setAddress("");
        setLabel("");
        setSelectedCryptoId("");
        setOtpCode("");
        setWithdrawalPassword("");
        setShowConfirmModal(false);
        refetch();
      }
    } catch (error) {
      // Handled by hook
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = async (id) => {
    try {
      await unlinkWalletMutation.mutateAsync(id);
      toast.success("Wallet address unlinked!");
      refetch();
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const isLoading = isLoadingWallets || isLoadingCryptos;

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="bg-[#111827] px-4 py-3.5 flex items-center sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button 
          onClick={() => router.push('/dashboard/settings')}
          className="mr-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[15px] font-bold">Linked Wallet Addresses</h1>
      </div>

      <div className="px-4 py-4 max-w-[480px] mx-auto w-full space-y-5">
        {/* Important Info Alert */}
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 flex gap-3 text-xs leading-normal">
          <ShieldCheck size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-white/90 font-bold">2-Step Security Verified Wallets</p>
            <p className="text-gray-400">
              Linking your payout address requires 2-Step Authentication (Email Verification Code + Withdrawal Password). Once linked, withdrawals can only be sent to your verified addresses.
            </p>
          </div>
        </div>

        {/* Link Wallet Form */}
        <div className="bg-[#111827] rounded-[16px] border border-white/5 p-4 space-y-4">
          <h3 className="text-white/90 text-sm font-bold flex items-center gap-2">
            <Plus size={16} className="text-[#0073b6]" /> Link New Wallet Address
          </h3>

          <form onSubmit={handleOpenConfirm} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-gray-400 text-[11px] font-semibold uppercase">Select Cryptocurrency</label>
              <select
                value={selectedCryptoId}
                onChange={(e) => setSelectedCryptoId(e.target.value)}
                className="w-full bg-[#0b0f19] border border-white/5 text-white/90 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#0073b6] focus:ring-1 focus:ring-[#0073b6]"
              >
                <option value="">-- Choose Coin & Network --</option>
                {cryptos.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.name} ({coin.symbol}) • {coin.network}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-400 text-[11px] font-semibold uppercase">Wallet Address</label>
              <input
                type="text"
                placeholder="Paste your address here"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#0b0f19] border border-white/5 text-white/90 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#0073b6] focus:ring-1 focus:ring-[#0073b6] placeholder:text-gray-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-400 text-[11px] font-semibold uppercase">Label (Optional)</label>
              <input
                type="text"
                placeholder="e.g. My Trust Wallet, Binance"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-[#0b0f19] border border-white/5 text-white/90 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#0073b6] focus:ring-1 focus:ring-[#0073b6] placeholder:text-gray-600"
              />
            </div>

            <button
              type="submit"
              disabled={isLinking || isLoading || !selectedCryptoId || !address.trim()}
              className="w-full bg-[#0073b6] text-black font-bold py-2.5 rounded-lg hover:bg-amber-500 transition-colors text-xs disabled:opacity-50 flex items-center justify-center cursor-pointer mt-2 shadow-md"
            >
              {isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Link Wallet Address"}
            </button>
          </form>
        </div>

        {/* Linked Wallets List */}
        <div className="space-y-3">
          <h3 className="text-white/90 text-sm font-bold">Your Linked Addresses</h3>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-[#0073b6]" />
            </div>
          ) : wallets.length === 0 ? (
            <div className="bg-[#111827] rounded-[16px] border border-white/5 py-10 text-center text-gray-500 text-xs">
              No wallet addresses linked yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {wallets.map((wallet) => (
                <div 
                  key={wallet.id}
                  className="bg-[#111827] rounded-[16px] border border-white/5 p-3 flex justify-between items-center gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 text-[#0073b6] border border-amber-500/20">
                      <Wallet size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white/90 font-bold text-xs">{wallet.symbol}</span>
                        <span className="text-amber-400 text-[10px] bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">{wallet.network}</span>
                        {wallet.label && (
                          <span className="text-gray-400 text-[10px] italic">({wallet.label})</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-[11px] font-mono truncate mt-0.5 max-w-[240px]">
                        {wallet.address}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnlink(wallet.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                    title="Unlink address"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2-Step Verification Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/10 rounded-[24px] w-full max-w-[390px] p-6 space-y-4 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#0073b6]/10 rounded-full blur-3xl -z-10"></div>

            <div className="flex flex-col items-center text-center space-y-1.5">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-[#0073b6]">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-white text-base font-bold">2-Step Security Verification</h3>
              <p className="text-gray-400 text-[11.5px] leading-relaxed">
                Confirm linking <span className="text-amber-400 font-semibold">{selectedCrypto?.symbol} ({selectedCrypto?.network})</span> wallet.
              </p>
            </div>

            {/* Wallet Address Preview */}
            <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 text-left text-[11px] font-mono text-gray-300 break-all">
              <span className="text-gray-500 font-sans block text-[10px] uppercase font-bold mb-0.5">Destination:</span>
              {address}
            </div>

            {/* Step 1: Email OTP */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-gray-300 text-[11.5px] font-bold flex items-center gap-1">
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
                    "Resend Code"
                  )}
                </button>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-[#0b0f19] border border-white/10 text-white rounded-lg px-3 py-2.5 text-center text-base tracking-widest font-mono font-bold focus:outline-none focus:border-[#0073b6] focus:ring-1 focus:ring-[#0073b6] placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:text-gray-600"
                autoFocus
              />
            </div>

            {/* Step 2: Withdrawal Password */}
            <div className="space-y-1.5">
              <label className="text-gray-300 text-[11.5px] font-bold block">
                Withdrawal Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter withdrawal password"
                  value={withdrawalPassword}
                  onChange={(e) => setWithdrawalPassword(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-white/10 text-white rounded-lg pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#0073b6] focus:ring-1 focus:ring-[#0073b6] placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setOtpCode("");
                  setWithdrawalPassword("");
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer border border-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLink}
                disabled={isLinking || !withdrawalPassword || otpCode.length < 6}
                className="flex-1 bg-[#0073b6] hover:bg-amber-500 text-black text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center shadow-lg"
              >
                {isLinking ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : "Verify & Save"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
