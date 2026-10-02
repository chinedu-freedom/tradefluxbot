"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet, Info, ChevronDown, Check, Loader2, Eye, EyeOff, ShieldCheck, Mail, RefreshCw, AlertTriangle, ExternalLink } from "lucide-react";
import { useFetchData, usePost } from "@/hooks/useApi";
import { toast } from "sonner";
import Link from "next/link";

const parseNoticeToLines = (htmlString) => {
  if (!htmlString) return [];
  
  const liMatches = htmlString.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  if (liMatches && liMatches.length > 0) {
    return liMatches.map(li => li.replace(/^<li[^>]*>/i, '').replace(/<\/li>$/i, '').trim()).filter(Boolean);
  }
  
  const pMatches = htmlString.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  if (pMatches && pMatches.length > 0) {
    return pMatches.map(p => p.replace(/^<p[^>]*>/i, '').replace(/<\/p>$/i, '').trim()).filter(Boolean);
  }
  
  return htmlString
    .split(/<br\s*\/?>/gi)
    .map(line => line.trim())
    .filter(Boolean);
};

function WithdrawContent() {
  const router = useRouter();
  
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [amount, setAmount] = useState("");

  // 2-Step Verification Modal states
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [withdrawalPassword, setWithdrawalPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { mutate: submitWithdrawal, isPending: isSubmitting } = usePost("/users/withdraw");
  const sendOtpMutation = usePost("/users/withdraw/send-otp", null, false, {
    showToast: true
  });
  
  const { data: userRes, isLoading: isLoadingUser } = useFetchData("/users/me", ["profile"]);
  const user = userRes?.user || {};
  
  const { data: settingsRes, isLoading: isLoadingSettings } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  
  const { data: cryptosRes, isLoading: isLoadingCryptos } = useFetchData("/settings/payout-cryptos", ["payout-cryptos"]);
  const cryptos = cryptosRes?.data || [];

  const { data: walletsRes, isLoading: isLoadingWallets } = useFetchData("/wallets", ["user-wallets"]);
  const wallets = walletsRes?.wallets || [];

  const minWithdrawal = Number(settings.min_withdrawal) || 20;
  const maxWithdrawal = Number(settings.max_withdrawal) || 10000;
  const withdrawalCharge = Number(settings.withdrawal_charge) || 2;
  
  const mainBalance = Number(user.withdrawable_balance || 0);
  const totalBalance = mainBalance;
  const feeAmount = amount ? (Number(amount) * (withdrawalCharge / 100)) : 0;
  const netPayout = amount ? Math.max(0, Number(amount) - feeAmount) : 0;

  // Find linked wallet matching selected crypto symbol and network
  const matchingWallet = selectedCrypto && wallets.find(
    w => w.symbol.toLowerCase() === selectedCrypto.symbol.toLowerCase() && 
         w.network.toLowerCase() === selectedCrypto.network.toLowerCase()
  );

  const walletAddress = matchingWallet?.address || "";

  // Auto-select first crypto if available
  useEffect(() => {
    if (!isLoadingCryptos && !selectedCrypto && cryptos.length > 0) {
      setSelectedCrypto(cryptos[0]);
    }
  }, [isLoadingCryptos, cryptos, selectedCrypto]);

  // Click outside to close dropdown
  useEffect(() => {
    if (!isDropdownOpen) return;
    const closeDropdown = () => setIsDropdownOpen(false);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [isDropdownOpen]);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSelectCrypto = (crypto) => {
    setSelectedCrypto(crypto);
    setIsDropdownOpen(false);
  };

  const handleSendOtp = async () => {
    if (!selectedCrypto || !walletAddress || !amount) return;
    try {
      await sendOtpMutation.mutateAsync({
        amount: Number(amount),
        network: `${selectedCrypto.symbol} (${selectedCrypto.network})`,
        wallet_address: walletAddress
      });
      setCooldown(60);
      // Toast is already handled automatically by the usePost hook
      // toast.success(`Verification code sent to ${user.email || 'your email'}!`);
    } catch (err) {
      const remaining = err?.response?.data?.remainingSeconds;
      if (remaining) setCooldown(remaining);
    }
  };

  const handleOpenSecurityModal = () => {
    if (!selectedCrypto) {
      return toast.error("Please select a cryptocurrency network");
    }
    if (!matchingWallet || !walletAddress) {
      return toast.error("Please link a payout wallet address for this network first");
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return toast.error("Please enter a valid withdrawal amount");
    }
    if (Number(amount) < minWithdrawal) {
      return toast.error(`Minimum withdrawal amount is ${settings.currency_symbol || "$"}${minWithdrawal}`);
    }
    if (Number(amount) > maxWithdrawal) {
      return toast.error(`Maximum withdrawal amount is ${settings.currency_symbol || "$"}${maxWithdrawal}`);
    }
    if (Number(amount) > totalBalance) {
      return toast.error("Insufficient withdrawable balance");
    }
    if (!user.has_withdrawal_pin && !user.withdrawal_pin) {
      toast.error("Please set your withdrawal password in settings first");
      router.push("/dashboard/settings/payment");
      return;
    }

    setShowSecurityModal(true);
    setOtpCode("");
    setWithdrawalPassword("");
  };

  const handleFinalSubmit = () => {
    if (!withdrawalPassword) {
      return toast.error("Please enter your withdrawal password");
    }

    submitWithdrawal({
      amount: Number(amount),
      network: `${selectedCrypto.symbol} (${selectedCrypto.network})`,
      wallet_address: walletAddress,
      password: withdrawalPassword,
      method: "crypto"
    }, {
      onSuccess: () => {
        setAmount("");
        setWithdrawalPassword("");
        setShowSecurityModal(false);
        setShowPassword(false);
      }
    });
  };

  const customRules = settings.withdrawal_notice ? parseNoticeToLines(settings.withdrawal_notice) : [];

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden relative z-10">
      {/* Background Ambient Glow */}
      <div className="absolute top-[15%] left-[-40px] w-[180px] h-[180px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none z-0" />
      <div className="absolute bottom-[25%] right-[-40px] w-[180px] h-[180px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none z-0" />

      {/* Header */}
      <div className="bg-[#111827] px-4 py-4 flex items-center justify-center sticky top-0 z-20 shadow-sm border-b border-white/5 shrink-0">
        <button
          onClick={() => router.push("/dashboard")}
          className="absolute left-4 w-8 h-8 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors text-gray-300 border border-white/5 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[16px] font-bold">Withdraw</h1>
      </div>

      <div className="px-4 py-6 max-w-[480px] mx-auto w-full space-y-6 pb-[100px] relative z-10 flex-1">
        
        {/* Back to Dashboard link */}
        <div className="pl-1">
          <Link 
            href="/dashboard"
            className="text-gray-400 hover:text-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>

        {/* Withdraw Funds Card */}
        <div className="bg-[#111827]/50 border border-white/5 rounded-[24px] p-6 shadow-xl space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-[22px] font-extrabold text-white">Withdraw Funds</h2>
            <p className="text-[12.5px] text-gray-400 leading-relaxed max-w-[320px] mx-auto">
              Transfer funds securely from your Withdrawable Balance to your verified linked wallet.
            </p>
          </div>

          {/* Currency Selector */}
          <div className="space-y-2 relative">
            <label className="text-[13px] font-semibold text-white/80 block pl-1">Select Currency & Network</label>
            
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="w-full h-[52px] bg-black/40 border border-white/10 rounded-[12px] px-4 flex items-center justify-between text-white/90 cursor-pointer hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                {selectedCrypto ? (
                  <>
                    <div className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-white/5">
                      {selectedCrypto.icon ? (
                        <img src={selectedCrypto.icon} alt={selectedCrypto.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-[#0073b6]">{selectedCrypto.symbol.charAt(0)}</span>
                      )}
                    </div>
                    <span className="font-bold text-[13.5px] uppercase text-white/90">
                      {selectedCrypto.name} <span className="text-[9.5px] text-gray-400 font-medium ml-1">({selectedCrypto.symbol.toUpperCase()} - {selectedCrypto.network})</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-400 font-medium text-[13.5px] flex items-center gap-1.5">
                      <span className="text-amber-500 font-bold text-[16px] font-sans">₮</span> Choose currency
                    </span>
                  </>
                )}
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Custom Dropdown List */}
            {isDropdownOpen && (
              <div className="absolute top-[78px] left-0 right-0 bg-[#131926] border border-white/10 rounded-[12px] shadow-2xl z-50 max-h-[220px] overflow-y-auto [&::-webkit-scrollbar]:hidden py-1.5">
                {cryptos.length === 0 ? (
                  <div className="px-4 py-3 text-gray-400 text-sm">No payout options available</div>
                ) : (
                  cryptos.map((crypto) => (
                    <button
                      key={crypto.id}
                      type="button"
                      onClick={() => handleSelectCrypto(crypto)}
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer ${
                        selectedCrypto?.id === crypto.id ? "bg-white/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-white/5">
                          {crypto.icon ? (
                            <img src={crypto.icon} alt={crypto.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-[#0073b6]">{crypto.symbol.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[12.5px] text-white/90 uppercase">{crypto.name}</p>
                          <p className="text-[9.5px] text-gray-400">{crypto.symbol.toUpperCase()} - {crypto.network} network</p>
                        </div>
                      </div>
                      {selectedCrypto?.id === crypto.id && (
                        <Check size={14} className="text-[#0073b6]" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Linked Wallet Address (Strict - No Arbitrary Input) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[13px] font-semibold text-white/80 block">
                Destination Wallet Address
              </label>
              <Link
                href="/dashboard/settings/wallets"
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                Manage Wallets <ExternalLink size={11} />
              </Link>
            </div>

            {matchingWallet ? (
              <div className="bg-black/40 border border-emerald-500/30 rounded-[12px] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldCheck size={12} /> Verified Linked Wallet
                  </span>
                  {matchingWallet.label && (
                    <span className="text-gray-400 text-[11px] font-semibold">
                      {matchingWallet.label}
                    </span>
                  )}
                </div>
                <p className="text-white/90 font-mono text-[12.5px] break-all leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                  {matchingWallet.address}
                </p>
              </div>
            ) : (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-[12px] p-4 space-y-3">
                <div className="flex items-start gap-2.5 text-amber-400">
                  <AlertTriangle size={17} className="shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-amber-300">No Linked Wallet Found</p>
                    <p className="text-gray-400 text-[11.5px] leading-relaxed">
                      For your protection, withdrawals are strictly permitted only to verified linked wallet addresses.
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/settings/wallets"
                  className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Wallet size={13} /> Link {selectedCrypto?.symbol || "Crypto"} Wallet Address
                </Link>
              </div>
            )}
          </div>

          {/* Enter Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[13px] font-semibold text-white/80 block">
                Enter Amount
              </label>
              <span className="text-[11.5px] text-gray-400 font-semibold">
                Available: {isLoadingUser ? "..." : `${settings.currency_symbol || "$"}${totalBalance.toFixed(2)}`}
              </span>
            </div>
            
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-[52px] bg-black/40 border border-white/10 rounded-[12px] px-4 text-[16px] font-bold text-white/90 focus:outline-none focus:border-amber-500/30 transition-all placeholder:text-gray-600"
              />
              <button
                type="button"
                onClick={() => setAmount(totalBalance.toString())}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-[#0073b6] hover:bg-amber-600 text-black text-[10px] font-extrabold px-3 py-1.5 rounded-[8px] transition-colors cursor-pointer"
              >
                MAX
              </button>
            </div>
            
            <div className="flex justify-between items-center text-[11px] text-gray-400 font-medium px-1">
              <span>Estimated: ${amount ? Number(amount).toFixed(2) : "0.00"} USD</span>
              {amount && (
                <span>Fee ({withdrawalCharge}%): -{settings.currency_symbol || "$"}{feeAmount.toFixed(2)}</span>
              )}
            </div>
          </div>

          {/* Action Button: Opens 2-Step Security Modal */}
          <button
            onClick={handleOpenSecurityModal}
            disabled={!amount || !matchingWallet || !selectedCrypto || Number(amount) <= 0 || Number(amount) > totalBalance}
            className="w-full h-[52px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black py-2.5 rounded-[14px] font-bold text-[14.5px] transition-all shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {!matchingWallet ? "Linked Wallet Required" : "Request Withdrawal"}
          </button>
        </div>

        {/* Withdrawal Rules Card */}
        <div className="bg-[#111827]/50 border border-white/5 rounded-[24px] p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-[14.5px] text-white/95 uppercase tracking-wider pl-1">Withdrawal Rules</h3>
          
          <ul className="space-y-3.5 text-[12px] text-gray-300 pl-1">
            {customRules.length > 0 ? (
              customRules.map((line, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-[#0073b6] font-bold shrink-0 mt-0.5">•</span>
                  <p className="leading-relaxed font-medium text-gray-300" dangerouslySetInnerHTML={{ __html: line }} />
                </li>
              ))
            ) : (
              <>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0073b6] font-bold shrink-0 mt-0.5">▲</span>
                  <p className="leading-relaxed font-medium">Minimum withdrawal amount is ${minWithdrawal}</p>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0073b6] font-bold shrink-0 mt-0.5">▲</span>
                  <p className="leading-relaxed font-medium">All withdrawals require authorization with your Withdrawal Password</p>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0073b6] font-bold shrink-0 mt-0.5">▲</span>
                  <p className="leading-relaxed font-medium">Withdrawals are processed exclusively to your verified linked wallet addresses</p>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0073b6] font-bold shrink-0 mt-0.5">▲</span>
                  <p className="leading-relaxed font-medium">Transactions cannot be reversed once processed on the blockchain</p>
                </li>
              </>
            )}
          </ul>
        </div>

      </div>

      {/* 2-Step Verification Modal for Withdrawal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/10 rounded-[24px] w-full max-w-[400px] p-6 space-y-4 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Background ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -z-10"></div>

            <div className="flex flex-col items-center text-center space-y-1.5">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-400">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-white text-base font-bold">Withdrawal Authorization</h3>
              <p className="text-gray-400 text-[11.5px] leading-relaxed">
                Confirm your payout request for <span className="text-amber-400 font-bold">{settings.currency_symbol || "$"}{Number(amount).toFixed(2)}</span>
              </p>
            </div>

            {/* Withdrawal Summary Card */}
            <div className="bg-black/40 border border-white/5 rounded-xl p-3 space-y-1.5 text-[11.5px]">
              <div className="flex justify-between text-gray-400">
                <span>Asset / Network:</span>
                <span className="text-white font-semibold">{selectedCrypto?.name} ({selectedCrypto?.network})</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Withdrawal Fee:</span>
                <span className="text-amber-400 font-semibold">-{settings.currency_symbol || "$"}{feeAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400 border-t border-white/5 pt-1.5 font-bold">
                <span className="text-white">Net Payout:</span>
                <span className="text-emerald-400">{settings.currency_symbol || "$"}{netPayout.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/5 pt-1.5 text-left text-[11px] font-mono text-gray-400 break-all">
                <span className="text-gray-500 font-sans block text-[10px] uppercase font-bold mb-0.5">Destination:</span>
                {walletAddress}
              </div>
            </div>

            {/* Withdrawal Password */}
            <div className="space-y-1.5">
              <label className="text-gray-300 text-[11.5px] font-bold block">
                Withdrawal Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your withdrawal password"
                  value={withdrawalPassword}
                  onChange={(e) => setWithdrawalPassword(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-white/10 text-white rounded-lg pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#0073b6] focus:ring-1 focus:ring-[#0073b6] placeholder:text-gray-600"
                  autoFocus
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

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSecurityModal(false);
                  setWithdrawalPassword("");
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer border border-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting || !withdrawalPassword}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center shadow-lg"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : "Confirm & Withdraw"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default function WithdrawPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    }>
      <WithdrawContent />
    </Suspense>
  );
}
