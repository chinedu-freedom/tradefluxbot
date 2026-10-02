"use client";

import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Cpu, 
  Rocket,
  Zap,
  Activity,
  CheckCircle2,
  Users,
  Globe
} from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function AboutPage() {
  const router = useRouter();

  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const siteName = settingsRes?.settings?.site_name || "TradeFluxBot";

  const whyChooseItems = [
    "More than 5M+ application downloads worldwide.",
    "A global community of over 15M+ registered mining pool users.",
    "More than 30,000 active miners connected across 32 mining pools.",
    "Over $50,000 in daily mining payouts processed through the platform.",
    "Support for ASICs, GPUs, CPUs, FPGAs, and rented hashrate.",
    "Automatic profitability optimization with intelligent coin switching.",
    "Real-time monitoring of hashrate, hardware performance, temperatures, and payout history.",
    "Flexible cryptocurrency payout options with secure withdrawal methods."
  ];

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="bg-[#111827] px-4 py-3.5 flex items-center gap-2.5 sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button 
          onClick={() => router.back()}
          className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors text-white/90 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[15px] font-bold">About Us</h1>
      </div>

      <div className="px-4 py-5 max-w-[480px] mx-auto w-full space-y-5">
        
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-amber-500 to-amber-600 rounded-[20px] pt-7 pb-12 px-5 text-center text-white overflow-hidden shadow-lg border border-amber-400/20">
          {/* Decorative Background Glows */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/4"></div>

          <div className="inline-flex items-center gap-1 bg-white/15 px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md mb-3 relative z-10">
            <ShieldCheck size={11} /> Global Mining Ecosystem
          </div>
          
          <h2 className="text-[20px] font-black mb-2.5 leading-tight relative z-10">About {siteName}</h2>
          <p className="text-[12px] font-semibold text-amber-100/90 tracking-wide uppercase mb-3 relative z-10">
            Powering the Future of Cryptocurrency Mining
          </p>
          <p className="text-[11.5px] text-white/90 leading-relaxed max-w-[340px] mx-auto relative z-10">
            {siteName} is a global cryptocurrency mining platform dedicated to making digital asset mining simple, efficient, and accessible for everyone. Since its launch, {siteName} has helped millions of users monetize their computing power by providing intelligent mining software, reliable mining pools, and an ecosystem designed for both beginners and experienced miners.
          </p>
        </div>

        {/* Stats Section - overlap */}
        <div className="grid grid-cols-3 gap-1.5 -mt-8 px-2 relative z-10">
          <div className="bg-[#111827] rounded-[12px] py-2.5 px-1 text-center shadow-md border border-white/5">
            <div className="text-[#0073b6] text-[14px] font-bold mb-0.5">2M+</div>
            <div className="text-[8px] font-bold text-gray-400 tracking-wider">USERS</div>
          </div>
          <div className="bg-[#111827] rounded-[12px] py-2.5 px-1 text-center shadow-md border border-white/5">
            <div className="text-[#0073b6] text-[14px] font-bold mb-0.5">$50M+</div>
            <div className="text-[8px] font-bold text-gray-400 tracking-wider">VOLUME</div>
          </div>
          <div className="bg-[#111827] rounded-[12px] py-2.5 px-1 text-center shadow-md border border-white/5">
            <div className="text-[#0073b6] text-[14px] font-bold mb-0.5">99.9%</div>
            <div className="text-[8px] font-bold text-gray-400 tracking-wider">UPTIME</div>
          </div>
        </div>

        {/* How It Works & Mining Pools */}
        <div className="space-y-5">
          {/* How It Works */}
          <div className="bg-[#111827] rounded-[16px] p-4.5 border border-white/5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-500/10 rounded-[8px] flex items-center justify-center text-[#0073b6]">
                <Rocket size={14} className="animate-bounce" />
              </div>
              <h3 className="text-white/90 font-bold text-[13px]">How It Works</h3>
            </div>
            
            <p className="text-gray-400 text-[11px] leading-relaxed font-semibold">
              Getting started on {siteName} is simple:
            </p>

            <div className="space-y-2.5">
              {[
                { step: "1", text: "Register your personal account." },
                { step: "2", text: "Fund your account." },
                { step: "3", text: "Activate your preferred mining package." },
                { step: "4", text: "Begin earning rewards automatically according to your selected mining plan." }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-[#0b0f19]/40 p-2.5 rounded-xl border border-white/5">
                  <div className="w-5.5 h-5.5 bg-[#0073b6]/10 text-[#0073b6] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                    {item.step}
                  </div>
                  <span className="text-gray-300 text-[11px] font-medium leading-tight">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mining Pools Overview */}
          <div className="bg-[#111827] rounded-[16px] p-4.5 border border-white/5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-500/10 rounded-[8px] flex items-center justify-center text-[#0073b6]">
                <Cpu size={14} />
              </div>
              <h3 className="text-white/90 font-bold text-[13px]">Mining Pools Overview</h3>
            </div>

            {/* Basic Pool */}
            <div className="space-y-2 border-b border-white/5 pb-3">
              <h4 className="text-amber-500 text-[11px] font-extrabold uppercase tracking-wider">{siteName} Basic Pool</h4>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                The Basic Pool offers a daily return of <strong>7.5% for 20 days</strong>, providing a total return of <strong>150%</strong> over the investment period without requiring referrals or compounding.
              </p>
              <p className="text-gray-400 text-[10.5px] leading-relaxed">
                Users who wish to increase their earnings may also choose to compound their profits by following the platform’s activation process.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-[#0b0f19]/30 p-2 rounded-lg border border-white/5">
                  <span className="text-gray-400 text-[9.5px] block font-semibold">Activation Amount</span>
                  <span className="text-white font-bold text-[11px]">$30</span>
                </div>
                <div className="bg-[#0b0f19]/30 p-2 rounded-lg border border-white/5">
                  <span className="text-gray-400 text-[9.5px] block font-semibold">Min Compounding</span>
                  <span className="text-white font-bold text-[11px]">$30</span>
                </div>
                <div className="bg-[#0b0f19]/30 p-2 rounded-lg border border-white/5 col-span-2">
                  <span className="text-gray-400 text-[9.5px] block font-semibold">Min Withdrawal</span>
                  <span className="text-white font-bold text-[11px]">$20 (Withdraw at any time once reached)</span>
                </div>
              </div>
            </div>

            {/* VIP Pool */}
            <div className="space-y-2 border-b border-white/5 pb-3">
              <h4 className="text-amber-500 text-[11px] font-extrabold uppercase tracking-wider">{siteName} VIP Pool</h4>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                The {siteName} VIP Pool offers a daily return of <strong>8.5% for 20 days</strong> and is designed for users seeking higher investment opportunities.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-[#0b0f19]/30 p-2 rounded-lg border border-white/5">
                  <span className="text-gray-400 text-[9.5px] block font-semibold">Min Activation Amount</span>
                  <span className="text-white font-bold text-[11px]">$10,000</span>
                </div>
                <div className="bg-[#0b0f19]/30 p-2 rounded-lg border border-white/5">
                  <span className="text-gray-400 text-[9.5px] block font-semibold">Min Withdrawal</span>
                  <span className="text-white font-bold text-[11px]">$20 (Withdraw at any time)</span>
                </div>
              </div>
            </div>

            {/* Contract Pool */}
            <div className="space-y-2">
              <h4 className="text-amber-500 text-[11px] font-extrabold uppercase tracking-wider">{siteName} Contract Pool</h4>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                The {siteName} Contract Pool is a fixed-income, long-term mining plan designed for users who prefer stable returns over an extended period. This plan provides a fixed daily return of <strong>10.5% for 183 days (6 months)</strong>.
              </p>
              <p className="text-gray-400 text-[10.5px] leading-relaxed">
                Unlike the other mining pools, withdrawals are only available upon the completion of the contract period. At the end of the contract, both the accumulated earnings and the initial capital are released to the user.
              </p>
            </div>
          </div>
        </div>

        {/* Our Mission */}
        <div className="bg-[#111827] rounded-[16px] p-4.5 border border-white/5 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500/10 rounded-[8px] flex items-center justify-center text-[#0073b6]">
              <Cpu size={14} className="animate-pulse" />
            </div>
            <h3 className="text-white/90 font-bold text-[13px]">Our Mission</h3>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            Our mission is to remove the complexity from cryptocurrency mining. Whether you’re using a gaming PC, a professional GPU rig, an ASIC miner, or FPGA hardware, {siteName} provides the tools and infrastructure needed to maximize performance and earnings while maintaining a seamless user experience.
          </p>
        </div>

        {/* Our Platform */}
        <div className="bg-[#111827] rounded-[16px] p-4.5 border border-white/5 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500/10 rounded-[8px] flex items-center justify-center text-[#0073b6]">
              <Zap size={14} />
            </div>
            <h3 className="text-white/90 font-bold text-[13px]">Our Platform</h3>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            {siteName} combines powerful mining technology with automation. The {siteName} Miner automatically detects compatible hardware, selects the most profitable mining algorithm, and switches between supported cryptocurrencies in real time to optimize returns. Users can monitor performance, track earnings, and receive payouts through a secure and transparent dashboard.
          </p>
          <p className="text-gray-400 text-[11px] leading-relaxed pt-1.5 border-t border-white/5">
            For professional miners, {siteName} Pool offers advanced mining infrastructure with multiple payout systems, real-time statistics, detailed hashrate monitoring, API access, and support for large-scale mining operations.
          </p>
        </div>

        {/* Why Millions Choose TradeFluxBot */}
        <div className="bg-[#111827] rounded-[16px] p-4.5 border border-white/5 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500/10 rounded-[8px] flex items-center justify-center text-[#0073b6]">
              <Users size={14} />
            </div>
            <h3 className="text-white/90 font-bold text-[13px]">Why Millions Choose {siteName}</h3>
          </div>
          <div className="space-y-2">
            {whyChooseItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 size={13} className="text-[#0073b6] shrink-0 mt-0.5" />
                <span className="text-gray-300 text-[11px] leading-relaxed font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Built for Performance */}
        <div className="bg-[#111827] rounded-[16px] p-4.5 border border-white/5 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500/10 rounded-[8px] flex items-center justify-center text-[#0073b6]">
              <Activity size={14} />
            </div>
            <h3 className="text-white/90 font-bold text-[13px]">Built for Performance</h3>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            At {siteName}, we believe mining should be effortless. Our software continuously updates supported miners, optimizes workloads automatically, and enables users to earn cryptocurrency without manually configuring complex mining settings. Advanced analytics, remote management tools, and automated workflows allow miners to focus on maximizing profitability instead of managing technical details.
          </p>
        </div>

        {/* Security & Transparency */}
        <div className="bg-[#111827] rounded-[16px] p-4.5 border border-white/5 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500/10 rounded-[8px] flex items-center justify-center text-[#0073b6]">
              <ShieldCheck size={14} />
            </div>
            <h3 className="text-white/90 font-bold text-[13px]">Security & Transparency</h3>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            Trust is the foundation of our ecosystem. {siteName} is committed to transparent operations, secure infrastructure, and reliable payout systems. Every mining session runs only with user authorization, and the platform continuously improves its software to deliver a stable, secure, and efficient mining experience.
          </p>
        </div>

        {/* Our Vision */}
        <div className="bg-[#111827] rounded-[16px] p-4.5 border border-white/5 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500/10 rounded-[8px] flex items-center justify-center text-[#0073b6]">
              <Globe size={14} />
            </div>
            <h3 className="text-white/90 font-bold text-[13px]">Our Vision</h3>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            We envision a future where blockchain technology is accessible to everyone. By simplifying cryptocurrency mining and providing enterprise-grade infrastructure, {siteName} empowers individuals and businesses around the world to participate in the decentralized economy with confidence.
          </p>
        </div>

        {/* Join the Community */}
        <div className="relative bg-[#111827] rounded-[16px] p-5 text-center border border-white/5 shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/4"></div>
          
          <div className="relative z-10 space-y-2.5">
            <h3 className="text-[14px] font-bold text-white">Join the {siteName} Community</h3>
            <p className="text-gray-400 text-[11px] leading-relaxed max-w-[280px] mx-auto">
              Whether you’re mining with a single computer or managing an industrial-scale mining farm, {siteName} provides the technology, tools, and support needed to succeed in the evolving world of cryptocurrency.
            </p>
            <button 
              onClick={() => router.push('/dashboard/mining')}
              className="cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-center gap-1.5 w-full py-2.5 rounded-[12px] text-[12px] font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-md mt-2 border border-amber-400/20"
            >
              <Rocket size={14} /> Start Earning Now
            </button>
            <div className="text-[10px] font-semibold text-amber-500 pt-2 tracking-wide uppercase">
              {siteName} — Simple. Reliable. Profitable Mining.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
