"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Smartphone, Apple, Monitor, Share, MoreVertical, Download } from "lucide-react";

export default function InstallGuideModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ios");

  useEffect(() => {
    const handleOpen = () => {
      // Detect platform to set the default tab
      if (typeof window !== "undefined" && window.navigator) {
        const ua = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(ua)) {
          setActiveTab("ios");
        } else if (/android/.test(ua)) {
          setActiveTab("android");
        } else {
          setActiveTab("desktop");
        }
      }
      setIsOpen(true);
    };

    window.addEventListener("open-install-guide", handleOpen);
    return () => window.removeEventListener("open-install-guide", handleOpen);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-[#111827] rounded-[24px] border border-white/5 shadow-2xl">
        <div className="p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-[#0073b6]">
                <Download size={18} />
              </div>
              <h2 className="text-[17px] font-bold text-white/90">Install App</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Platform Tabs */}
          <div className="flex bg-[#0b0f19] p-1 rounded-[12px] mb-6 border border-white/5">
            {[
              { id: "ios", label: "iOS (Apple)", icon: Apple },
              { id: "android", label: "Android", icon: Smartphone },
              { id: "desktop", label: "Desktop", icon: Monitor },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[9px] text-[12px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0073b6] text-[#111827] shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div className="space-y-5 text-gray-300">
            {activeTab === "ios" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <p className="text-[13px] text-gray-400 leading-relaxed">
                  iOS devices do not support automatic PWA downloads. Add it to your home screen using Safari:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="w-6 h-6 bg-[#0073b6]/10 text-[#0073b6] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="text-[13px]">
                      Open the app in <strong className="text-white">Safari</strong> and tap the <strong className="text-white flex inline-flex items-center gap-1">Share <Share size={13} className="inline text-[#0073b6]" /></strong> icon in the bottom menu.
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="w-6 h-6 bg-[#0073b6]/10 text-[#0073b6] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="text-[13px]">
                      Scroll down through the options list and select <strong className="text-white">Add to Home Screen</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="w-6 h-6 bg-[#0073b6]/10 text-[#0073b6] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="text-[13px]">
                      Tap <strong className="text-white">Add</strong> in the top-right corner to place it on your home screen.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "android" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <p className="text-[13px] text-gray-400 leading-relaxed">
                  If the automatic install popup doesn't appear, you can add it manually using Google Chrome:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="w-6 h-6 bg-[#0073b6]/10 text-[#0073b6] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="text-[13px]">
                      Tap the <strong className="text-white flex inline-flex items-center gap-1">Menu <MoreVertical size={13} className="inline text-[#0073b6]" /></strong> icon (three vertical dots) in the top-right corner of Chrome.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="w-6 h-6 bg-[#0073b6]/10 text-[#0073b6] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="text-[13px]">
                      Tap <strong className="text-white">Add to Home screen</strong> or <strong className="text-white">Install App</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="w-6 h-6 bg-[#0073b6]/10 text-[#0073b6] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="text-[13px]">
                      Confirm by tapping <strong className="text-white">Install</strong> / <strong className="text-white">Add</strong> when prompted.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "desktop" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <p className="text-[13px] text-gray-400 leading-relaxed">
                  Install the application on your computer using Chrome, Edge, or Brave:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="w-6 h-6 bg-[#0073b6]/10 text-[#0073b6] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="text-[13px]">
                      Look at the right side of the address bar at the top of your browser.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="w-6 h-6 bg-[#0073b6]/10 text-[#0073b6] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="text-[13px]">
                      Click the <strong className="text-white">Install App</strong> icon (usually a computer screen with a down arrow, or a plus sign).
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="w-6 h-6 bg-[#0073b6]/10 text-[#0073b6] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="text-[13px]">
                      Click <strong className="text-white">Install</strong> in the dialog box that appears.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full mt-6 bg-[#0073b6] hover:bg-amber-600 text-white rounded-[12px] h-[44px] text-[14px] font-bold shadow-md transition-all cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
