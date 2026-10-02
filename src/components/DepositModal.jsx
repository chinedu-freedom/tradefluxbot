"use client";

import { useEffect } from "react";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useFetchData } from "@/hooks/useApi";
import { Loader2, X, Hexagon, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function DepositModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const isVisible = searchParams.get('depositModal') === 'true';

  const { data: cryptosRes, isLoading: isLoadingCryptos } = useFetchData(
    "/settings/payout-cryptos",
    ["payout-cryptos"],
    isVisible // Only fetch when modal is visible
  );
  const cryptos = cryptosRes?.data || [];

  const { data: settingsRes, isLoading: isLoadingSettings } = useFetchData(
    "/settings",
    ["platform-settings"],
    isVisible
  );
  const settings = settingsRes?.settings || {};

  // Track the page the user was on before opening the modal

  useEffect(() => {
    if (isVisible) {
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      const hasCryptoId = new URLSearchParams(currentSearch).has('cryptoId');
      
      // Save return URL only if we're not on a plain deposit page (which requires a cryptoId to be valid)
      if (currentPath !== '/dashboard/wallet/deposit' || hasCryptoId) {
        sessionStorage.setItem('depositModalReturnPath', window.location.href);
      }
    }
  }, [isVisible]);

  const handleClose = () => {
    const returnUrl = sessionStorage.getItem('depositModalReturnPath');
    sessionStorage.removeItem('depositModalReturnPath');
    
    if (returnUrl) {
      try {
        const urlObj = new URL(returnUrl);
        urlObj.searchParams.delete('depositModal');
        router.push(urlObj.pathname + urlObj.search, { scroll: false });
        return;
      } catch (e) {
        console.error("Error parsing return URL:", e);
      }
    }
    
    // Fallback routing
    if (pathname === '/dashboard/wallet/deposit') {
      router.push('/dashboard/wallet');
    } else {
      const params = new URLSearchParams(searchParams);
      params.delete('depositModal');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const handleSelectCrypto = (crypto) => {
    // Clear return path so it doesn't conflict with future closures
    sessionStorage.removeItem('depositModalReturnPath');
    handleClose();
    setTimeout(() => {
      router.push(`/dashboard/wallet/deposit?cryptoId=${crypto.id}`);
    }, 100); // Wait a bit for modal to close smoothly
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in cursor-pointer"
      onClick={handleClose}
    >
      <div 
        className="bg-[#111827] border border-white/5 rounded-t-[20px] sm:rounded-[16px] w-full max-w-[400px] overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[70vh] md:max-h-[80vh] mt-auto sm:mt-0 cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#111827] z-10 shrink-0">
          <div>
            <h3 className="font-bold text-[16px] text-white/90">Deposit Method</h3>
            <p className="text-[12px] text-gray-400">Select cryptocurrency</p>
          </div>
          <button 
            onClick={handleClose}
            className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors text-gray-400 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-3 overflow-y-auto overflow-x-hidden flex-1 pb-[80px] sm:pb-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isLoadingCryptos || isLoadingSettings ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
              <p className="text-xs text-gray-400">Loading methods...</p>
            </div>
          ) : cryptos.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No deposit methods available.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {cryptos.map((crypto) => (
                <div 
                  key={crypto.id}
                  onClick={() => handleSelectCrypto(crypto)}
                  className="p-3 rounded-[12px] border border-white/5 bg-white/5 hover:bg-white/10 hover:border-[#0073b6] shadow-sm cursor-pointer transition-all flex flex-col items-center justify-center text-center group aspect-square select-none"
                >
                  {/* Square shape for icon */}
                  <div className="w-11 h-11 bg-[#0b0f19] group-hover:bg-[#111827] rounded-[10px] flex items-center justify-center border border-white/5 shrink-0 overflow-hidden shadow-inner p-1.5 mb-2">
                    {crypto.icon ? (
                      <img src={crypto.icon} alt={crypto.name} className="w-full h-full object-contain" />
                    ) : (
                      <Hexagon className="text-gray-400" size={22} />
                    )}
                  </div>
                  
                  <h4 className="font-bold text-[13px] text-white/90 uppercase flex flex-col items-center gap-1">
                    <span>{crypto.name}</span>
                    <span className="text-[8.5px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full font-medium tracking-wide">
                      {crypto.symbol}-{crypto.network}
                    </span>
                  </h4>
                  
                  <p className="text-[9.5px] text-gray-400 mt-1.5 leading-tight">
                    Min: {settings?.currency_symbol || "$"}{settings?.min_deposit || 10}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
