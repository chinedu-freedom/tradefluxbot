"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Volume2, VolumeX, History, Gift, Ticket, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFetchData, usePost } from "@/hooks/useApi";
import HowToPlayModal from "@/components/HowToPlayModal";
import { toast } from "sonner";
import dayjs from "dayjs";

export default function SpinPage() {
  const router = useRouter();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);
  const rotationRef = useRef(0);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Custom Result Modal State
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState({ isWin: false, amount: 0, message: "" });
  
  const audioCtxRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
    return () => {
      if (audioCtxRef.current?.state !== 'closed') {
        audioCtxRef.current?.close().catch(() => {});
      }
    };
  }, []);

  const playTone = (freq, duration, type = 'sine', vol = 0.3) => {
    if (isMuted || !audioCtxRef.current) return;
    try {
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = type;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch(e) {}
  };
  
  const playTick = () => playTone(1200, 0.03, 'square', 0.15);
  const playSpinStart = () => playTone(300, 0.3, 'sine', 0.2);
  const playWin = () => {
      setTimeout(() => playTone(523, 0.15, 'sine', 0.4), 0);
      setTimeout(() => playTone(659, 0.15, 'sine', 0.4), 100);
      setTimeout(() => playTone(784, 0.3, 'sine', 0.5), 200);
  };
  
  // Confetti setup
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
  }, []);
  
  // Fetch spin data
  const { data: spinRes, isLoading, refetch } = useFetchData('/users/spin');
  const postSpin = usePost('/users/spin', null, false, { showToast: false });
  const { data: settingsRes } = useFetchData('/settings', ['platform-settings']);
  const settings = settingsRes?.settings || {};

  const spinData = spinRes?.data;
  
  const currentBalance = spinData?.accountBalance || 0;
  const freeSpins = spinData?.userSpins?.free_spins_remaining || 0;
  const cost = Number(spinData?.settings?.cost_per_spin || 0);

  // Dynamic segments from backend, strictly 9 divisions
  let basePrizes = spinData?.prizes || [];
  let displaySegments = [];

  for (let i = 0; i < 9; i++) {
    if (i < 8) {
      if (basePrizes[i]) {
        displaySegments.push({
          label: basePrizes[i].name,
          color: i % 2 === 0 ? "#fefefe" : "#fdf6e3",
          id: basePrizes[i].id,
          value: Number(basePrizes[i].value),
          originalIndex: i
        });
      } else {
        displaySegments.push({
          label: "0.00",
          color: i % 2 === 0 ? "#fefefe" : "#fdf6e3",
          id: `empty-${i}`,
          value: 0,
          originalIndex: i
        });
      }
    } else {
      // 9th segment is constant 'Try again' (or the 9th configured prize if it exists)
      displaySegments.push({
        label: basePrizes[8] ? basePrizes[8].name : "Try again",
        color: "#fefefe", // 8 is even index, so #fefefe
        id: basePrizes[8] ? basePrizes[8].id : "try-again",
        value: basePrizes[8] ? Number(basePrizes[8].value) : 0,
        originalIndex: 8
      });
    }
  }

  const segments = displaySegments;
  const segmentDegree = 360 / 9; // Exactly 40 degrees

  // Build the conic-gradient string
  const gradientStops = segments.map((seg, i) => {
    const start = i * segmentDegree;
    const end = start + segmentDegree;
    return `${seg.color} ${start}deg ${end}deg`;
  }).join(", ");

  const handleSpin = async () => {
    if (isSpinning) return;
    
    if (basePrizes.length < 8) {
      toast.error("Wheel not fully configured. 8 prizes required.");
      return;
    }
    
    // Check local balance first if no free spins
    if (freeSpins <= 0 && currentBalance < cost) {
      toast.error('Insufficient balance for a spin');
      return;
    }

    setIsSpinning(true);
    
    postSpin.mutate({}, {
      onSuccess: (res) => {
        if (!res.success) {
          toast.error(res.message);
          setIsSpinning(false);
          return;
        }

        const { prizeIndex, rewardAmount } = res.data;
        
        // Find all visual segments that map to this actual backend prize index
        const matchingIndices = segments
          .map((seg, idx) => (seg.originalIndex === prizeIndex ? idx : -1))
          .filter(idx => idx !== -1);
          
        // Pick a random visual segment out of the duplicates to land on
        const targetIndex = matchingIndices.length > 0 
          ? matchingIndices[Math.floor(Math.random() * matchingIndices.length)] 
          : prizeIndex;
        
        // Calculate target rotation based on the visual index
        const targetAngle = targetIndex * segmentDegree + (segmentDegree / 2);
        const startRotation = rotationRef.current;
        const newRotation = startRotation + (360 * 5) + (360 - (targetAngle + (startRotation % 360)) % 360);
        
        playSpinStart();

        // Animate with requestAnimationFrame to sync sound with rotation
        const duration = 4000;
        const startTime = performance.now();
        let lastTickAngle = startRotation;

        const animate = (time) => {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // easeOutQuart
          const eased = 1 - Math.pow(1 - progress, 4);
          
          const currentRotation = startRotation + (newRotation - startRotation) * eased;
          rotationRef.current = currentRotation;
          
          if (wheelRef.current) {
            wheelRef.current.style.transform = `rotate(${currentRotation}deg)`;
          }

          // Play tick if we crossed a segment threshold
          // In the original, the threshold grows slightly so it ticks less often at the end
          const tickThreshold = segmentDegree * (0.8 + progress * 0.4);
          if (currentRotation - lastTickAngle >= tickThreshold) {
            playTick();
            lastTickAngle = currentRotation;
          }

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Animation complete
            setIsSpinning(false);
            setRotation(newRotation); // sync React state just in case
            
            const isWin = rewardAmount > 0;

            if (isWin) {
              playWin();
              confettiRef.current?.launch(100);
            }
            
            setResultData({
              isWin: isWin,
              amount: rewardAmount,
              message: res.data.prize.name
            });
            setShowResultModal(true);
            
            refetch();
          }
        };

        requestAnimationFrame(animate);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Failed to spin');
        setIsSpinning(false);
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden pb-20">
      {/* Header */}
      <div className="px-4 py-4 flex justify-between items-center bg-[#111827] sticky top-0 z-20 border-b border-white/5">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-white/5 border border-white/5 rounded-[12px] flex items-center justify-center text-gray-300 shadow-sm cursor-pointer hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-white/90 text-[18px] font-bold">Lucky Spin</h1>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="cursor-pointer w-10 h-10 bg-white/5 border border-white/5 rounded-[12px] flex items-center justify-center text-gray-300 shadow-sm hover:bg-white/10 transition-colors"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      <div className="px-4 mt-2 space-y-4 relative z-10">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#111827] p-4 rounded-[16px] border border-white/5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-4 h-4 rounded-[4px] bg-white/10 flex items-center justify-center">
                <div className="w-2 h-1.5 bg-gray-400 rounded-[1px]"></div>
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Deposit Balance</span>
            </div>
            <div className="text-[20px] font-bold text-[#0073b6]">
              {settings.currency_symbol || "$"}{Number(currentBalance).toFixed(2)}
            </div>
          </div>

          <div className="bg-[#111827] p-4 rounded-[16px] border border-white/5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <Ticket className="text-gray-400 w-4 h-4" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Free Spins</span>
            </div>
            <div className="text-[20px] font-bold text-[#0073b6]">
              {freeSpins}
            </div>
          </div>
        </div>

        {/* Cost Indicator */}
        <div className="flex justify-center mt-2 mb-6">
          <div className="bg-[#111827] px-5 py-2 rounded-full border border-white/5 shadow-sm flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded-[4px]"></div>
            <span className="text-[13px] font-bold text-white/90">Cost: {settings.currency_symbol || "$"}{cost.toFixed(2)}</span>
          </div>
        </div>

        {/* Wheel Container */}
        <div className="flex justify-center items-center py-6">
          <div className="relative w-[320px] h-[320px]">
            {/* The Outer Blue Ring with Lights */}
            <div className="absolute inset-0 rounded-full bg-[#0073b6] shadow-[0_0_20px_rgba(59,130,246,0.3)] border-4 border-[#60a5fa] overflow-hidden">
              {/* Fake lights using CSS repeating conic gradient or positioned dots */}
              <div className="absolute inset-1 rounded-full border border-amber-400/50"></div>
              {Array.from({ length: 24 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_white]"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${i * 15}deg) translateY(-150px)`
                  }}
                />
              ))}
            </div>

            {/* The Inner Spinning Wheel */}
            <div 
              ref={wheelRef}
              className="absolute inset-[15px] rounded-full overflow-hidden shadow-inner"
              style={{
                background: `conic-gradient(${gradientStops})`,
                transform: `rotate(${rotation}deg)`
              }}
            >
              {segments.map((seg, i) => {
                const angle = (i * segmentDegree) + (segmentDegree / 2);
                const lineAngle = i * segmentDegree;
                const isTryAgain = seg.label.toLowerCase().includes("try again") || seg.label.toLowerCase().includes("oops");
                return (
                  <div key={i}>
                    {/* Separator Line */}
                    <div 
                      className="absolute top-0 left-1/2 w-[1px] h-1/2 bg-[#e2e8f0]/40 origin-bottom z-10"
                      style={{ transform: `translateX(-50%) rotate(${lineAngle}deg)` }}
                    />
                    
                    {/* Segment Content */}
                    {isTryAgain ? (
                      <div 
                        className="absolute top-0 bottom-1/2 left-1/2 w-[80px] origin-bottom z-20 flex flex-col items-center justify-start pt-3 leading-none select-none"
                        style={{ 
                          transform: `translateX(-50%) rotate(${angle}deg)`,
                        }}
                      >
                        <span className="text-[20px] filter drop-shadow-sm">🥲</span>
                        <span className="text-[13px] text-[#ff3333] font-black mt-1.5 tracking-tight">Oops!</span>
                        <span className="text-[8px] text-[#475569] font-bold uppercase tracking-wider mt-1 whitespace-nowrap">Try Again</span>
                      </div>
                    ) : (
                      <div 
                        className="absolute inset-0 flex items-start justify-center pt-[20px] z-20"
                        style={{ transform: `rotate(${angle}deg)` }}
                      >
                        <span 
                          className="text-[15px] font-bold text-slate-800 w-[20px] text-center select-none"
                          style={{ 
                            transform: 'rotate(180deg)',
                            writingMode: 'vertical-rl',
                            textOrientation: 'mixed'
                          }}
                        >
                          <span className="inline-block mt-4">{seg.label}</span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Center Start Button */}
            <div 
              onClick={handleSpin}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px] bg-gradient-to-b from-[#94a3b8] to-[#475569] rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.3)] z-30 border-[4px] border-[#0073b6] hover:scale-105 active:scale-95 transition-all"
            >
              {/* Pointer Triangle */}
              <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[16px] border-b-[#0073b6]"></div>
              
              <span className="text-white font-bold text-[16px] drop-shadow-md">Start</span>
            </div>
            
          </div>
        </div>

        {/* Recent Wins */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4 px-1">
            <History className="text-[#0073b6]" size={18} />
            <h3 className="font-bold text-white/90 text-[16px]">Recent Wins</h3>
          </div>

          <div className="space-y-3">
            {spinData?.recentWins?.length > 0 ? (
              spinData.recentWins.map((win) => (
                <div key={win.id} className="bg-[#111827] rounded-[16px] p-4 border border-white/5 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${Number(win.reward_earned) > 0 ? 'bg-green-900/20' : 'bg-white/5'}`}>
                      <Gift className={Number(win.reward_earned) > 0 ? 'text-[#16a34a]' : 'text-gray-400'} size={20} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-white/90">{win.prize.name}</h4>
                      <p className="text-[12px] text-gray-500 mt-0.5">{dayjs(win.created_at).format('MMM DD, HH:mm')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[15px] font-bold ${Number(win.reward_earned) > 0 ? 'text-[#16a34a]' : 'text-gray-500'}`}>
                      {Number(win.reward_earned) > 0 ? `+${settings.currency_symbol || "$"}${Number(win.reward_earned).toFixed(2)}` : '0.00'}
                    </div>
                    <div className="text-[12px] text-gray-400 mt-0.5">
                      {win.spin_type === 'free' ? 'Free Spin' : `-${settings.currency_symbol || "$"}${cost.toFixed(2)}`}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400 bg-[#111827] rounded-[16px] border border-white/5 text-sm">
                No recent wins yet
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Floating Help Button */}
      <button 
        onClick={() => setIsHowToPlayOpen(true)}
        className="fixed bottom-[80px] right-4 w-[60px] h-[60px] bg-[#0073b6] rounded-full shadow-[0_4px_16px_rgba(59,130,246,0.5)] flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-transform"
      >
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <span className="text-[#0073b6] font-bold text-[18px]">?</span>
        </div>
      </button>

      <HowToPlayModal isOpen={isHowToPlayOpen} setIsOpen={setIsHowToPlayOpen} />

      {/* Spin Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/5 rounded-[24px] p-8 w-full max-w-[320px] flex flex-col items-center text-center shadow-[0_25px_50px_rgba(0,0,0,0.25)] animate-in zoom-in-95 duration-200">
            
            <div 
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 text-[40px]`}
              style={{ background: resultData.isWin ? 'linear-gradient(135deg, rgba(22,163,74,0.2) 0%, rgba(34,197,94,0.1) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' }}
            >
              {resultData.isWin ? "🎉" : "😔"}
            </div>
            
            <h2 className="text-white/90 text-[24px] font-bold mb-2">
              {resultData.isWin ? "You Won!" : "Try Again"}
            </h2>
            
            {resultData.isWin ? (
              <div className="flex flex-col items-center gap-2 mb-2">
                <p className="text-[#16a34a] text-[36px] font-extrabold leading-none">
                  +{settings.currency_symbol || "$"}{resultData.amount.toFixed(2)}
                </p>
                <p className="text-[#64748b] text-[14px]">
                  {resultData.message}
                </p>
                <p className="text-[#0073b6] text-[13px] mt-2 mb-4 flex items-center gap-1.5 font-medium">
                  <span className="w-4 h-4 rounded-full bg-[#0073b6] text-white flex items-center justify-center text-[10px]">✓</span>
                  Added to withdrawable balance
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 mb-6">
                <p className="text-[#64748b] text-[18px]">
                  Better luck next time!
                </p>
                <p className="text-[#64748b] text-[14px]">
                  {resultData.message}
                </p>
              </div>
            )}
            
            <button 
              onClick={() => setShowResultModal(false)}
              className="w-full bg-gradient-to-br from-[#0073b6] to-[#2563eb] text-white font-semibold rounded-[12px] py-3.5 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(59,130,246,0.3)] active:translate-y-0 transition-all"
            >
              Continue
            </button>
            
          </div>
        </div>
      )}

      {/* Confetti Canvas */}
      <canvas 
        ref={confettiCanvasRef} 
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9998]"
        style={{ display: 'none' }}
      />
    </div>
  );
}
