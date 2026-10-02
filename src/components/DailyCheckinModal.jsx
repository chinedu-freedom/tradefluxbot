"use client";

import { useState, useEffect, useRef } from "react";
import { useFetchData, usePost } from "@/hooks/useApi";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Lock, Loader2, Coins, Check } from "lucide-react";
import { toast } from "sonner";

export default function DailyCheckinModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, refetch } = useFetchData("/users/checkin", "checkin-status");
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const claimMutation = usePost("/users/checkin");

  const confettiCanvasRef = useRef(null);
  const confettiRef = useRef(null);

  useEffect(() => {
    if (!confettiCanvasRef.current) return;
    class Confetti {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.running = false;
        }
        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
        launch(count = 150) {
            this.resize();
            this.canvas.style.display = 'block';
            this.particles = [];
            const colors = ['#0073b6', '#22c55e', '#0073b6', '#ef4444', '#0073b6', '#06b6d4'];
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: -20 - Math.random() * 200,
                    size: Math.random() * 10 + 4,
                    speedY: Math.random() * 4 + 2,
                    speedX: (Math.random() - 0.5) * 6,
                    rotation: Math.random() * 360,
                    rotSpeed: (Math.random() - 0.5) * 15,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    shape: Math.random() > 0.5 ? 'rect' : 'circle'
                });
            }
            this.running = true;
            this.animate();
        }
        animate() {
            if (!this.running) return;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            let active = 0;
            this.particles.forEach(p => {
                if (p.y < this.canvas.height + 50) {
                    active++;
                    p.y += p.speedY;
                    p.x += p.speedX;
                    p.rotation += p.rotSpeed;
                    p.speedY += 0.15;
                    this.ctx.save();
                    this.ctx.translate(p.x, p.y);
                    this.ctx.rotate(p.rotation * Math.PI / 180);
                    this.ctx.fillStyle = p.color;
                    if (p.shape === 'rect') {
                        this.ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
                    } else {
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, p.size/2, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                    this.ctx.restore();
                }
            });
            if (active > 0) {
                requestAnimationFrame(() => this.animate());
            } else {
                this.running = false;
                this.canvas.style.display = 'none';
            }
        }
    }
    confettiRef.current = new Confetti(confettiCanvasRef.current);
  }, [isOpen]);

  // Commented out to prevent automatic modal popup on mount/data load:
  // useEffect(() => {
  //   if (data && data.enabled && !data.claimedToday) {
  //     setIsOpen(true);
  //   }
  // }, [data]);

  // Allow other components to trigger the modal
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-daily-checkin', handleOpen);
    return () => window.removeEventListener('open-daily-checkin', handleOpen);
  }, []);

  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!data?.claimedToday) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow - now;

      if (diff <= 0) {
        refetch(); // Automatically refetch when the countdown hits 0
        return "00:00:00";
      }

      const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
      const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.claimedToday, refetch]);

  const handleClaim = async () => {
    try {
      const result = await claimMutation.mutateAsync({});
      if (result.success) {
        confettiRef.current?.launch(150);
        await refetch();
        setTimeout(() => {
          handleOpenChange(false);
        }, 2000);
      }
    } catch (error) {
      toast.error("Claim Failed", {
        description: error.response?.data?.error || "Could not claim daily reward",
      });
    }
  };

  if (isLoading || !data || !data.enabled) return null;

  const { rewards, currentStreak, claimedToday } = data;
  const nextClaimDay = claimedToday ? currentStreak : currentStreak + 1;
  const displayDay = nextClaimDay > data.maxDays ? 1 : nextClaimDay;

  const settings = settingsRes?.settings || {};

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      window.dispatchEvent(new Event('checkin-modal-closed'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="cursor-pointer sm:max-w-[400px] p-0 overflow-hidden bg-[#111827] rounded-2xl border border-white/5 shadow-2xl">
        <div className="p-8 flex flex-col items-center">
          
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4 text-orange-400 shadow-sm relative overflow-hidden">
            <Gift className="w-8 h-8" />
            <div className="absolute top-1 right-1 text-[10px]">✨</div>
          </div>
          
          <h2 className="text-xl font-bold text-white/90 mb-1">Daily Rewards</h2>
          <p className="text-sm text-gray-400 mb-8 text-center px-4">
            Check in for 7 consecutive days to get maximum rewards. Missing a day resets your streak!
          </p>
          
          <div className="grid grid-cols-4 gap-3 w-full mb-4">
            {rewards.slice(0, 4).map((reward, i) => (
              <RewardCard key={reward.day} reward={reward} isNext={reward.day === displayDay && !claimedToday} settings={settings} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mb-8">
            {rewards.slice(4, 7).map((reward, i) => (
              <RewardCard key={reward.day} reward={reward} isNext={reward.day === displayDay && !claimedToday} settings={settings} />
            ))}
          </div>

          {claimedToday ? (
            <div className="w-full bg-white/5 text-gray-400 border border-white/5 rounded-xl py-4 font-bold text-center tracking-[0.2em] shadow-inner text-lg">
              {timeLeft}
            </div>
          ) : (
            <Button 
              onClick={handleClaim} 
              disabled={claimMutation.isPending}
              className="w-full bg-[#0073b6] hover:bg-[#0073b6] text-white rounded-xl py-6 font-semibold shadow-md shadow-amber-500/20 transition-all active:scale-[0.98]"
            >
              {claimMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                `Claim Day ${displayDay}`
              )}
            </Button>
          )}
          
        </div>
      </DialogContent>
      <canvas 
        ref={confettiCanvasRef} 
        className="pointer-events-none fixed inset-0 z-[100] w-full h-full" 
        style={{ display: 'none' }}
      />
    </Dialog>
  );
}

function RewardCard({ reward, isNext, settings }) {
  const isClaimed = reward.status === 'claimed';
  const isAvailable = reward.status === 'available' || isNext;
  
  return (
    <div className={`
      flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
      ${isClaimed ? 'border-[#10b981] bg-[#10b981]/10' : ''}
      ${isAvailable ? 'border-[#0073b6] bg-[#0073b6]/10 shadow-sm scale-105 z-10 relative' : ''}
      ${reward.status === 'locked' && !isNext ? 'border-white/5 bg-white/5' : ''}
    `}>
      <span className={`text-[11px] font-bold tracking-wider uppercase mb-2 
        ${isClaimed ? 'text-[#10b981]' : isAvailable ? 'text-[#0073b6]' : 'text-gray-400'}
      `}>
        Day {reward.day}
      </span>
      
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 shadow-sm
        ${isClaimed ? 'bg-[#10b981] text-white' : isAvailable ? 'bg-[#0073b6] text-white' : 'bg-white/10 text-gray-400'}
      `}>
        {isClaimed ? (
          <Check className="w-5 h-5" strokeWidth={3} />
        ) : isAvailable ? (
          <Coins className="w-4 h-4" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
      </div>
      
      <span className={`text-xs font-bold 
        ${isClaimed ? 'text-[#10b981]' : isAvailable ? 'text-[#0073b6]' : 'text-gray-400'}
      `}>
        +{settings?.currency_symbol || "$"}{parseFloat(reward.amount).toFixed(2)}
      </span>
    </div>
  );
}
