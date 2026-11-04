"use client";

import React, { useState, useEffect } from "react";
import { useFetchData } from "@/hooks/useApi";

export default function WhatsAppWidget({ phoneNumber = "+44 7344 560920", message = "Message us" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);

  const rawNumber = settingsRes?.settings?.whatsapp_floating_support || settingsRes?.settings?.whatsapp_support || phoneNumber;
  
  let whatsappUrl = "#";
  if (rawNumber) {
    if (rawNumber.startsWith("http://") || rawNumber.startsWith("https://")) {
      whatsappUrl = rawNumber;
    } else {
      const cleanNumber = rawNumber.replace(/[^0-9]/g, "");
      whatsappUrl = `https://wa.me/${cleanNumber}`;
    }
  }

  useEffect(() => {
    const handleMenuToggle = (e) => {
      setMenuOpen(Boolean(e.detail?.open));
    };
    window.addEventListener("mobile-menu-toggle", handleMenuToggle);
    return () => window.removeEventListener("mobile-menu-toggle", handleMenuToggle);
  }, []);

  if (menuOpen) return null;

  return (
    <div id="whatsapp-widget" className="fixed bottom-5 left-4 sm:bottom-6 sm:left-6 z-40 flex items-center select-none font-sans pointer-events-auto">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 sm:gap-3 transition-transform duration-300 hover:scale-105 focus:outline-none group"
        aria-label="Message us on WhatsApp"
      >
        {/* WhatsApp Green Circle Button with Official WhatsApp Icon */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 relative shrink-0">
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8 fill-current"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16 2A13 13 0 0 0 4.7 20.9L3 27l6.3-1.6A13 13 0 1 0 16 2zm0 23.6a10.6 10.6 0 0 1-5.4-1.5l-.4-.2-4 1 1.1-3.9-.3-.4A10.6 10.6 0 1 1 16 25.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a9 9 0 0 1-2.6-1.6 9.9 9.9 0 0 1-1.8-2.3c-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.4.3-.5.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.3-.6-.6-.5-.8-.5h-.7c-.2 0-.7.1-1 .5a4.3 4.3 0 0 0-1.3 3.2 7.5 7.5 0 0 0 1.6 4 17.2 17.2 0 0 0 6.6 5.8c2.4 1 2.9.8 3.4.8a5.8 5.8 0 0 0 3.8-2.6 4.7 4.7 0 0 0 .3-2.6c-.1-.1-.3-.2-.6-.4z"/>
          </svg>
        </div>

        {/* White Speech Bubble Pill (Hidden on Mobile, Visible on Desktop) */}
        <div className="hidden sm:flex relative bg-white text-slate-900 text-sm font-semibold px-4 py-2.5 rounded-lg shadow-lg border border-slate-100/80 items-center justify-center whitespace-nowrap">
          {/* Triangular Tail pointing to icon */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-white" />
          <span>{message}</span>
        </div>
      </a>
    </div>
  );
}

