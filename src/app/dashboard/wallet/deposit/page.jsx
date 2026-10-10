"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Wallet, Info, ChevronDown, Copy, Check, Loader2 } from "lucide-react";
import { useFetchData, usePost } from "@/hooks/useApi";
import { toast } from "sonner";
import Link from "next/link";

const parseNoticeToLines = (htmlString) => {
  if (!htmlString) return [];
  
  // Extract list items if present
  const liMatches = htmlString.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  if (liMatches && liMatches.length > 0) {
    return liMatches.map(li => li.replace(/^<li[^>]*>/i, '').replace(/<\/li>$/i, '').trim()).filter(Boolean);
  }
  
  // Extract paragraphs if present
  const pMatches = htmlString.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  if (pMatches && pMatches.length > 0) {
    return pMatches.map(p => p.replace(/^<p[^>]*>/i, '').replace(/<\/p>$/i, '').trim()).filter(Boolean);
  }
  
  // Split by <br> or newline tags
  return htmlString
    .split(/<br\s*\/?>/gi)
    .map(line => line.trim())
    .filter(Boolean);
};

const FIXED_CRYPTOS = [
  { id: "usdt-trc20", name: "Tether (TRC20)", symbol: "USDT", network: "TRC20", network_name: "Tron Network (TRC20)", icon: "https://assets.coingecko.com/coins/images/325/large/Tether.png" },
  { id: "usdt-bep20", name: "Tether (BEP20)", symbol: "USDT", network: "BEP20", network_name: "BNB Smart Chain (BEP20)", icon: "https://assets.coingecko.com/coins/images/325/large/Tether.png" },
  { id: "eth-bep20", name: "Ethereum (BEP20)", symbol: "ETH", network: "BEP20", network_name: "BNB Smart Chain (BEP20)", icon: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  { id: "ltc", name: "Litecoin", symbol: "LTC", network: "Litecoin", network_name: "Litecoin Network", icon: "https://assets.coingecko.com/coins/images/2/large/litecoin.png" }
];

function DepositContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cryptoId = searchParams.get("cryptoId");
  
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [paymentAddress, setPaymentAddress] = useState("");
  const [trackId, setTrackId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [payableAmount, setPayableAmount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { data: cryptosRes, isLoading: isLoadingCryptos } = useFetchData("/settings/payout-cryptos", ["payout-cryptos"]);
  const cryptos = (cryptosRes?.data && cryptosRes.data.length > 0) ? cryptosRes.data : FIXED_CRYPTOS;
  
  const { data: settingsRes, isLoading: isLoadingSettings } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};

  const selectedCrypto = cryptos.find(c => c.id === cryptoId || c.symbol === cryptoId) || cryptos[0];

  // Auto-select the first cryptocurrency if none is selected
  useEffect(() => {
    if (!isLoadingCryptos && !cryptoId && cryptos.length > 0) {
      router.replace(`?cryptoId=${cryptos[0].id}`, { scroll: false });
    }
  }, [isLoadingCryptos, cryptoId, cryptos, router]);

  // Click outside to close dropdown
  useEffect(() => {
    if (!isDropdownOpen) return;
    const closeDropdown = () => setIsDropdownOpen(false);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [isDropdownOpen]);

  const handleSelectCrypto = (crypto) => {
    router.replace(`?cryptoId=${crypto.id}`, { scroll: false });
    setIsDropdownOpen(false);
  };

  const getPayableAmount = () => {
    if (!amount || isNaN(amount)) return "0.00";
    const charge = Number(settings?.deposit_charge || 0);
    const fee = Number(amount) * (charge / 100);
    return (Number(amount) + fee).toFixed(2);
  };

  const { mutate: submitDeposit, isPending } = usePost("/users/deposit");

  const handleProceed = () => {
    if (!selectedCrypto) {
      return toast.error("Please select a cryptocurrency");
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return toast.error("Please enter a valid deposit amount");
    }
    const minDep = Number(settings?.min_deposit || 10);
    const maxDep = Number(settings?.max_deposit || 100000);

    if (Number(amount) < minDep || Number(amount) > maxDep) {
      return toast.error(`Amount must be between ${settings.currency_symbol || "$"}${minDep} and ${settings.currency_symbol || "$"}${maxDep}`);
    }

    setShowConfirmModal(true);
  };

  const handleConfirmPay = () => {
    setShowConfirmModal(false);
    submitDeposit(
      { amount: Number(amount), cryptoId: selectedCrypto.id },
      {
        onSuccess: (res) => {
          setPaymentAddress(res.address);
          setTrackId(res.trackId || null);
          setPayableAmount(res.payableAmount || res.amount || (Number(amount) * (1 + Number(settings?.deposit_charge || 0) / 100)));
          setStep(2);
        }
      }
    );
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(paymentAddress).then(() => {
      setCopied(true);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error("Failed to copy address. Please copy manually.");
    });
  };

  const customRules = settings.deposit_notice ? parseNoticeToLines(settings.deposit_notice) : [];

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden relative z-10">
      {/* Background Ambient Bubbles */}
      <div className="absolute top-[15%] left-[-40px] w-[180px] h-[180px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none z-0" />
      <div className="absolute bottom-[25%] right-[-40px] w-[180px] h-[180px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none z-0" />

      {/* Header */}
      <div className="bg-[#111827] px-4 py-4 flex items-center justify-center sticky top-0 z-20 shadow-sm border-b border-white/5 shrink-0">
        <button
          onClick={() => {
            if (step === 2) {
              setStep(1);
            } else {
              router.push("/dashboard");
            }
          }}
          className="absolute left-4 w-8 h-8 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors text-gray-300 border border-white/5 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[16px] font-bold">
          {step === 1 ? "Deposit" : "Complete Payment"}
        </h1>
      </div>

      <div className="px-4 py-6 max-w-[480px] mx-auto w-full space-y-6 pb-[100px] relative z-10 flex-1">
        {isLoadingCryptos || isLoadingSettings ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-amber-500" size={32} />
          </div>
        ) : step === 1 ? (
          <>
            {/* Back to Dashboard link */}
            <div className="pl-1">
              <Link 
                href="/dashboard"
                className="text-gray-400 hover:text-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </Link>
            </div>

            {/* Deposit Funds Card */}
            <div className="bg-[#111827]/50 border border-white/5 rounded-[24px] p-6 shadow-xl space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-[22px] font-extrabold text-white">Deposit Funds</h2>
                <Link 
                  href="/dashboard/mining" 
                  className="text-[#0073b6] hover:text-amber-400 text-[13px] font-semibold underline underline-offset-4 transition-colors block"
                >
                  View packages
                </Link>
              </div>

              {/* Currency Selector */}
              <div className="space-y-2 relative">
                <label className="text-[13px] font-semibold text-white/80 block pl-1">Select Currency</label>
                
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
                          {selectedCrypto.name} <span className="text-[9.5px] text-gray-400 font-medium ml-1">({selectedCrypto.symbol.toUpperCase()}-{selectedCrypto.network})</span>
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
                      <div className="px-4 py-3 text-gray-400 text-sm">No payment options available</div>
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

              {/* Enter Amount */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-white/80 block pl-1">
                  Enter Amount (USD, min ${settings.min_deposit || 50})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-[52px] bg-black/40 border border-white/10 rounded-[12px] px-4 text-[16px] font-bold text-white/90 focus:outline-none focus:border-amber-500/30 transition-all placeholder:text-gray-600"
                  />
                </div>
                <p className="text-[11px] text-gray-400 font-medium pl-1">
                  Credited amount: ${amount ? Number(amount).toFixed(2) : "0.00"} USD | Total payable (with {settings?.deposit_charge || 0}% fee): ${amount ? getPayableAmount() : "0.00"} USD
                </p>
              </div>

              {/* Proceed to Payment Button */}
              <button
                onClick={handleProceed}
                disabled={isPending || !amount || !selectedCrypto}
                className="w-full h-[52px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black py-2.5 rounded-[14px] font-bold text-[14.5px] transition-all shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="animate-spin text-black" size={18} />
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            </div>

            {/* Deposit Rules Card */}
            <div className="bg-[#111827]/50 border border-white/5 rounded-[24px] p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-[14.5px] text-white/95 uppercase tracking-wider pl-1">Deposit Rules</h3>
              
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
                      <span className="text-[#0073b6] font-bold shrink-0 mt-0.5">•</span>
                      <p className="leading-relaxed font-medium">Minimum deposit: ${settings.min_deposit || 50} equivalent</p>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#0073b6] font-bold shrink-0 mt-0.5">•</span>
                      <p className="leading-relaxed font-medium">Wait for network confirmations (typically 1–3 blocks)</p>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#0073b6] font-bold shrink-0 mt-0.5">•</span>
                      <p className="leading-relaxed font-medium">Supported networks: TRC-20, ERC-20, BEP-20, Polygon</p>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#0073b6] font-bold shrink-0 mt-0.5">•</span>
                      <p className="leading-relaxed font-medium">Processing time: usually 5–30 minutes after confirmation</p>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#0073b6] font-bold shrink-0 mt-0.5">!</span>
                      <p className="leading-relaxed font-semibold text-amber-200">Send only the selected currency to this address; wrong assets may be lost</p>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* Step 2 Payment Details */}
            <div className="bg-[#111827]/50 border border-white/5 rounded-[24px] p-6 shadow-xl space-y-6 relative z-10">
              <div className="text-center space-y-1">
                <p className="text-[12px] text-gray-400 font-semibold tracking-wider uppercase">Send exactly</p>
                <p className="text-[26px] font-extrabold text-white">
                  {settings.currency_symbol || "$"}{Number(payableAmount || amount).toFixed(2)}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    {selectedCrypto.symbol.toUpperCase()} ({selectedCrypto.network} Network)
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-3 bg-white rounded-2xl shadow-inner">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(paymentAddress)}&margin=4&color=000000&bgcolor=ffffff`}
                    alt="Payment QR Code"
                    className="w-[140px] h-[140px] object-contain"
                  />
                </div>
              </div>

              {/* Payment Address */}
              <div className="space-y-2">
                <label className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block pl-1">Deposit Address</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] font-mono text-gray-300 break-all select-all flex items-center leading-normal">
                    {paymentAddress}
                  </div>
                  <button
                    onClick={handleCopyAddress}
                    className={`px-4 rounded-xl border font-bold text-[12px] flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0 ${
                      copied
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-white/5 border-white/10 text-amber-500 hover:bg-white/10"
                    }`}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Warning Banner */}
              <div className="bg-amber-950/20 border border-amber-500/10 rounded-xl p-4 flex gap-3 items-start">
                <span className="text-amber-500 shrink-0 text-[18px] font-bold leading-none mt-0.5">!</span>
                <p className="text-[11.5px] text-amber-200/90 leading-relaxed font-medium">
                  Only send <strong>{selectedCrypto.symbol.toUpperCase()}</strong> on the <strong>{selectedCrypto.network}</strong> network to this address. Sending other assets or using the wrong network will result in permanent loss.
                </p>
              </div>
            </div>

            {/* Waiting for Payment Notification */}
            <div className="bg-[#111827]/50 border border-white/5 rounded-[24px] p-6 shadow-xl flex flex-col items-center justify-center space-y-4 relative z-10">
              <Loader2 className="animate-spin text-[#0073b6]" size={28} />
              <div className="text-center space-y-1 px-2">
                <h4 className="text-[14px] font-bold text-white">Awaiting Payment</h4>
                <p className="text-[11.5px] text-gray-400 leading-relaxed">
                  Your balance will be credited automatically once the network confirms your transaction. You can safely leave this page.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-white/10 w-full max-w-[360px] rounded-[24px] overflow-hidden shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 text-left">
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-1.5 border-b border-white/5">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                <Info size={18} />
              </div>
              <h3 className="font-bold text-white text-[15px]">Confirm Deposit</h3>
            </div>

            {/* Breakdown */}
            <div className="space-y-3.5 text-[12.5px] text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">Intended Deposit:</span>
                <span className="text-white font-bold">{settings.currency_symbol || "$"}{Number(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Deposit Fee ({settings?.deposit_charge || 0}%):</span>
                <span className="text-amber-500 font-bold">+{settings.currency_symbol || "$"}{(Number(amount) * Number(settings?.deposit_charge || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="border-t border-white/5 pt-3 flex justify-between text-[14px]">
                <span className="font-bold text-white">Total to Send:</span>
                <span className="font-extrabold text-white">{settings.currency_symbol || "$"}{getPayableAmount()}</span>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-950/20 border border-amber-500/10 rounded-xl p-3 text-[11px] text-amber-200/90 leading-relaxed font-medium">
              Important: You must send exactly <strong className="text-white font-bold">{settings.currency_symbol || "$"}{getPayableAmount()}</strong>. Sending any other amount may cause the transaction to fail to credit.
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 h-[42px] bg-white/5 hover:bg-white/10 text-gray-300 rounded-[12px] font-bold text-[13px] transition-all border border-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPay}
                className="flex-1 h-[42px] bg-[#0073b6] hover:bg-amber-600 text-white rounded-[12px] font-bold text-[13px] transition-all shadow-md cursor-pointer"
              >
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DepositPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    }>
      <DepositContent />
    </Suspense>
  );
}
