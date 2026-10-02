"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { HelpCircle, X, Pointer, Gift, Star, Crown } from "lucide-react";

export default function HowToPlayModal({ isOpen, setIsOpen }) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[340px] p-0 overflow-hidden bg-white rounded-[24px] border-0 shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#0073b6] flex items-center justify-center">
              <HelpCircle className="text-white w-3 h-3" />
            </div>
            <h2 className="text-[16px] font-bold text-[#1e293b]">How to Play</h2>
          </div>
        
        </div>

        <div className="px-5 pb-4 space-y-5">
          {/* Item 1 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-[12px] bg-[#f5f3ff] flex items-center justify-center shrink-0">
              <Pointer className="text-[#0073b6] w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#1e293b] mb-1">Tap to Spin</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Press the Start button in the center of the wheel to begin spinning.
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-[12px] bg-[#f5f3ff] flex items-center justify-center shrink-0">
              <Gift className="text-[#0073b6] w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#1e293b] mb-1">Win Prizes</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                The wheel will stop on a random prize. All winnings are instantly credited to your account.
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-[12px] bg-[#f5f3ff] flex items-center justify-center shrink-0">
              <Star className="text-[#0073b6] w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#1e293b] mb-1">Earn Free Spins</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Get free spins through deposits and by inviting friends to join.
              </p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-[12px] bg-[#f5f3ff] flex items-center justify-center shrink-0">
              <Crown className="text-[#0073b6] w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#1e293b] mb-1">Hit the Jackpot</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Land on the jackpot segment to win the biggest prize available!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
