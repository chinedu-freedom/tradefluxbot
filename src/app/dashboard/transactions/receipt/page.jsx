"use client";

import { useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Image as ImageIcon, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useFetchData } from "@/hooks/useApi";

function ReceiptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const receiptRef = useRef(null);

  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const siteName = settingsRes?.settings?.site_name || "TradeFluxBot";
  const symbol = settingsRes?.settings?.currency_symbol || "$";

  // Extract from URL query params
  const id = searchParams.get("id") || "0";
  const rawTitle = (searchParams.get("title") || "Receipt").toUpperCase();
  const rawStatus = (searchParams.get("status") || "SUCCESS").toUpperCase();
  let title = rawTitle;
  if (rawTitle.includes("CREDIT") || rawTitle.includes("MANUAL CREDIT") || rawTitle.includes("DEPOSIT SUCCESSFUL")) {
    title = "DEPOSIT SUCCESSFUL";
  } else if (rawTitle.includes("INVEST") || rawTitle.includes("PLAN")) {
    title = "MINING POOL ACTIVATED";
  } else if (rawTitle === "DEPOSIT" || rawTitle === "DEPOSIT CREDITED" || rawTitle === "DEPOSIT INITIATED") {
    if (rawStatus === "APPROVED" || rawStatus === "COMPLETED" || rawStatus === "SUCCESS") {
      title = "DEPOSIT CREDITED";
    } else {
      title = "DEPOSIT INITIATED";
    }
  } else if (rawTitle.includes("PROFIT")) {
    title = "DAILY PROFITS";
  } else {
    title = rawTitle.replace(/_/g, ' ');
  }
  const date = searchParams.get("date") || "N/A";
  const amount = searchParams.get("amount") || `${symbol}0.00`;
  const status = (rawStatus === "APPROVED") ? "SUCCESS" : rawStatus;
  const type = searchParams.get("type") || "Transaction";
  const walletAddress = searchParams.get("wallet_address") || "";
  
  // Format transaction number
  const txnNo = `TXN${id.padStart(10, '0')}`;
  
  // Determine if it's an addition or deduction for color
  const isPositive = amount.startsWith('+');
  const amountColor = isPositive ? "text-[#10b981]" : "text-red-500";
  
  // Format title for receipt
  const receiptTitle = `${title} RECEIPT`;

  const handleShareAsImage = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2 });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `${siteName}-${title}-Receipt.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Failed to generate image", error);
    }
  };

  const handleShareAsPDF = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${siteName}-${title}-Receipt.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden pb-32">
      {/* Header */}
      <div className="bg-[#111827] px-4 py-4 flex items-center gap-3 sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button 
          onClick={() => router.back()}
          className="w-9 h-9 bg-white/5 border border-white/5 rounded-[10px] flex items-center justify-center transition-colors text-gray-300 shadow-sm hover:bg-white/10 shrink-0 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[15px] font-bold truncate max-w-[260px]">{receiptTitle}</h1>
      </div>

      <div className="px-4 max-w-[480px] mx-auto w-full flex-1 flex flex-col items-center pt-6">
        
        {/* Receipt Card */}
        <div 
          ref={receiptRef}
          className="bg-[#111827] rounded-[20px] shadow-sm border border-white/5 w-full max-w-[360px] p-6 relative overflow-hidden flex flex-col items-center"
        >
          {/* Watermarks */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-12 z-0 opacity-[0.03]">
             <span className="text-[32px] font-bold tracking-wider text-white whitespace-nowrap -rotate-45">{siteName}</span>
             <span className="text-[32px] font-bold tracking-wider text-white whitespace-nowrap -rotate-45 ml-24">{siteName}</span>
             <span className="text-[32px] font-bold tracking-wider text-white whitespace-nowrap -rotate-45 -ml-24">{siteName}</span>
          </div>

          <div className="w-full flex justify-between items-center mb-6 relative z-10">
            <div className="text-white/90 font-bold text-[14px]">{siteName}</div>
            <div className="text-gray-400 text-[10px] truncate max-w-[150px]">{receiptTitle}</div>
          </div>

          <div className={`${amountColor} font-bold text-[32px] leading-none mb-3 relative z-10`}>
            {amount}
          </div>
          
          <div className="bg-emerald-900/20 text-emerald-400 px-4 py-1.5 rounded-full text-[12px] font-bold tracking-wide mb-4 relative z-10 capitalize">
            {status.toLowerCase()}
          </div>

          <div className="text-gray-400 text-[11px] mb-6 relative z-10">
            {date}
          </div>

          <div className="w-full space-y-4 relative z-10">
            <div className="flex justify-between items-center border-b border-dashed border-white/5 pb-4">
              <span className="text-gray-400 text-[12px]">Transaction Type</span>
              <span className="text-white/90 text-[12px] font-bold truncate max-w-[160px] text-right">{title}</span>
            </div>
            <div className="flex justify-between items-center border-b border-dashed border-white/5 pb-4">
              <span className="text-gray-400 text-[12px]">Transaction No.</span>
              <span className="text-white/90 text-[12px] font-bold">{txnNo}</span>
            </div>
            <div className="flex justify-between items-center border-b border-dashed border-white/5 pb-4">
              <span className="text-gray-400 text-[12px]">Amount</span>
              <span className="text-white/90 text-[12px] font-bold">{amount}</span>
            </div>
            <div className="flex justify-between items-center border-b border-dashed border-white/5 pb-4">
              <span className="text-gray-400 text-[12px]">Status</span>
              <span className="text-white/90 text-[12px] font-bold capitalize">{status.toLowerCase()}</span>
            </div>
            <div className="flex justify-between items-center border-b border-dashed border-white/5 pb-4">
              <span className="text-gray-400 text-[12px]">Date & Time</span>
              <span className="text-white/90 text-[12px] font-bold max-w-[160px] text-right">{date}</span>
            </div>
            <div className="flex justify-between items-center border-b border-dashed border-white/5 pb-4">
              <span className="text-gray-400 text-[12px]">Description</span>
              <span className="text-white/90 text-[12px] font-bold truncate max-w-[160px] text-right">{title}</span>
            </div>
            {walletAddress && (
              <div className="flex justify-between items-center pb-4">
                <span className="text-gray-400 text-[12px]">Wallet Address</span>
                <span className="text-white/90 text-[12px] font-bold truncate max-w-[160px] text-right select-all" title={walletAddress}>
                  {walletAddress.length > 16 ? `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 8)}` : walletAddress}
                </span>
              </div>
            )}
          </div>

          <div className="w-full bg-[#0b0f19] border-l-[3px] border-[#0073b6] rounded-r-[8px] p-3 mt-2 relative z-10">
            <p className="text-gray-400 text-[10px] leading-relaxed">
              Transaction processed by <span className="font-bold text-white/90">{siteName}</span>. Thank you for being a valued member of our platform.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#111827] border-t border-white/5 pb-6 pt-4 px-4 z-50">
        <div className="max-w-[480px] mx-auto w-full flex gap-3">
          <button 
            onClick={handleShareAsImage}
            className="flex-1 bg-[#0b0f19] border border-white/10 text-[#0073b6] flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-[13px] font-medium hover:bg-white/5 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
          >
            <ImageIcon size={16} /> Share as image
          </button>
          <button 
            onClick={handleShareAsPDF}
            className="flex-1 bg-[#0b0f19] border border-white/10 text-[#0073b6] flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-[13px] font-medium hover:bg-white/5 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
          >
            <FileText size={16} /> Share as PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 text-sm">Loading receipt...</div>}>
      <ReceiptContent />
    </Suspense>
  );
}
