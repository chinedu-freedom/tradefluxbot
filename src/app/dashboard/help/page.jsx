"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  HelpCircle,
  Search,
  MessageCircle,
  Send,
  Phone,
  Users,
  Zap,
  Wallet,
  CreditCard,
  Clock,
  FileText,
  Download,
  Upload,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function HelpCenterPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(1); // Default to first FAQ open
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};

  const handleLink = (link) => {
    if (link) {
      window.open(link, "_blank");
    }
  };

  const faqs = [
    {
      id: 1,
      title: "How do I make a deposit?",
      desc: "Learn about deposit methods...",
      answer: "To make a deposit, go to the Recharge page, select your preferred payment method, enter the amount, and follow the instructions. Your balance will be updated automatically once the payment is confirmed.",
      icon: Download,
      iconBg: "bg-[#d1fae5]",
      iconColor: "text-[#059669]"
    },
    {
      id: 2,
      title: "How long do withdrawals take?",
      desc: "Withdrawal processing times...",
      answer: "Withdrawals typically take between 10 minutes to 24 hours to process depending on the selected payment method and network congestion. Crypto withdrawals are usually the fastest.",
      icon: Upload,
      iconBg: "bg-[#fee2e2]",
      iconColor: "text-[#ef4444]"
    },
    {
      id: 3,
      title: "Is my account secure?",
      desc: "Security measures we use...",
      answer: "Yes, your account is highly secure. We use industry-standard encryption protocols, and you can further secure your account by verifying your email and setting up a secure withdrawal pin.",
      icon: ShieldCheck,
      iconBg: "bg-[#ede9fe]",
      iconColor: "text-[#0073b6]"
    },
    {
      id: 4,
      title: "How does the referral program work?",
      desc: "Earn commissions by inviting...",
      answer: "Our referral program allows you to earn 5% commission on any deposit made by users you invite. The commission is credited instantly to your withdrawable balance whenever your referral completes a deposit.",
      icon: Users,
      iconBg: "bg-[#fef3c7]",
      iconColor: "text-[#9333ea]"
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden ">
      {/* Header */}
      <div className="bg-[#111827] px-4 py-3 flex items-center gap-2.5 sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button
          onClick={() => router.back()}
          className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors text-white/90 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[15px] font-bold">Help Center</h1>
      </div>

      <div className="px-4 py-6 max-w-[480px] mx-auto w-full space-y-6">

        {/* Top Hero */}
        <div className="flex flex-col items-center text-center">
          <div className="w-[60px] h-[60px] bg-[#0073b6] rounded-[18px] flex items-center justify-center mb-4 shadow-[0_4px_12px_rgba(139,92,246,0.3)]">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-[18px]">
              ?
            </div>
          </div>
          <h2 className="text-white/90 text-[20px] font-bold mb-1.5">How can we help?</h2>
          <p className="text-gray-400 text-[13px] leading-relaxed max-w-[260px]">
            Find answers to common questions or reach out to our support team
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help..."
            className="w-full bg-[#111827] border border-white/5 rounded-[14px] pl-10 pr-4 py-3.5 text-[14px] text-white/90 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm"
          />
        </div>

        {/* Contact Support */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={14} className="text-[#0073b6] fill-[#0073b6]/20" />
            <h3 className="text-white/90 text-[13px] font-bold">Contact Support</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleLink(settings.telegram_support)}
              className="cursor-pointer bg-[#111827] rounded-[16px] border border-white/5 shadow-md p-4 flex flex-col items-center text-center hover:bg-white/5 transition-colors"
            >
              <div className="w-[42px] h-[42px] bg-amber-900/20 rounded-full flex items-center justify-center text-[#0073b6] mb-2.5">
                <Send size={20} className="fill-[#0073b6] -ml-0.5" />
              </div>
              <span className="text-white/90 text-[13px] font-bold mb-0.5">Telegram</span>
              <span className="text-gray-400 text-[11px]">Fast response</span>
            </button>
            <button 
              onClick={() => handleLink(settings.whatsapp_support)}
              className="cursor-pointer bg-[#111827] rounded-[16px] border border-white/5 shadow-md p-4 flex flex-col items-center text-center hover:bg-white/5 transition-colors"
            >
              <div className="w-[42px] h-[42px] bg-green-900/20 rounded-full flex items-center justify-center text-[#16a34a] mb-2.5">
                <Phone size={20} className="fill-[#16a34a]" />
              </div>
              <span className="text-white/90 text-[13px] font-bold mb-0.5">WhatsApp</span>
              <span className="text-gray-400 text-[11px]">24/7 support</span>
            </button>
          </div>
        </div>

        {/* Join Our Community */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-[#0073b6] fill-[#0073b6]/20" />
            <h3 className="text-white/90 text-[13px] font-bold">Join Our Community</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleLink(settings.telegram_community)}
              className="cursor-pointer bg-[#111827] rounded-[16px] border border-white/5 shadow-md p-4 flex flex-col items-center text-center hover:bg-white/5 transition-colors"
            >
              <div className="w-[42px] h-[42px] bg-amber-900/20 rounded-[14px] flex items-center justify-center text-[#0073b6] mb-2.5">
                <Send size={20} className="fill-[#0073b6] -ml-0.5" />
              </div>
              <span className="text-white/90 text-[13px] font-bold mb-0.5">Channel</span>
              <span className="text-gray-400 text-[11px]">News & Updates</span>
            </button>
            <button 
              onClick={() => handleLink(settings.telegram_group)}
              className="cursor-pointer bg-[#111827] rounded-[16px] border border-white/5 shadow-md p-4 flex flex-col items-center text-center hover:bg-white/5 transition-colors"
            >
              <div className="w-[42px] h-[42px] bg-amber-900/20 rounded-[14px] flex items-center justify-center text-[#0073b6] mb-2.5">
                <Users size={20} className="fill-[#0073b6]" />
              </div>
              <span className="text-white/90 text-[13px] font-bold mb-0.5">Whatsapp Group</span>
              <span className="text-gray-400 text-[11px]">Community</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-[#0073b6] fill-[#0073b6]" />
            <h3 className="text-white/90 text-[13px] font-bold">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Wallet, label: "Deposit", action: () => router.push("/dashboard/wallet/deposit") },
              { icon: CreditCard, label: "Withdraw", action: () => router.push("/dashboard/wallet/withdraw") },
              { icon: Wallet, label: "Wallet", action: () => router.push("/dashboard/wallet") },
              { icon: Clock, label: "History", action: () => router.push("/dashboard/transactions") }
            ].map((action, idx) => (
              <button 
                key={idx} 
                onClick={action.action}
                className="cursor-pointer bg-[#111827] rounded-[12px] border border-white/5 shadow-md p-2.5 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors"
              >
                <div className="text-[#0073b6]">
                  <action.icon size={18} className="fill-[#0073b6]/20" />
                </div>
                <span className="text-gray-400 text-[10px] font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={14} className="text-[#0073b6] fill-[#0073b6]/20" />
            <h3 className="text-white/90 text-[13px] font-bold">Frequently Asked Questions</h3>
          </div>
          <div className="space-y-2.5">
            {filteredFaqs.length === 0 ? (
              <div className="bg-[#111827] rounded-[16px] border border-white/5 p-6 text-center shadow-md">
                <p className="text-gray-400 text-[13px]">No FAQs found matching "{searchQuery}"</p>
              </div>
            ) : (
              filteredFaqs.map(faq => {
                const isOpen = openFaq === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className={`w-full bg-[#111827] rounded-[16px] border ${isOpen ? 'border-[#0073b6] shadow-[0_2px_12px_-4px_rgba(139,92,246,0.15)]' : 'border-white/5 shadow-md'} transition-all text-left overflow-hidden`}
                >
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="cursor-pointer w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 ${faq.iconBg} ${faq.iconColor}`}>
                        <faq.icon size={18} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-white/90 text-[13px] font-bold mb-0.5">{faq.title}</h4>
                        <p className="text-gray-400 text-[11px]">{faq.desc}</p>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-[#0073b6] shrink-0 ml-2" /> : <ChevronDown size={16} className="text-gray-500 shrink-0 ml-2" />}
                  </button>
                  
                  {isOpen && (
                     <div className="px-4 pb-4">
                      <p className="text-gray-400 text-[13px] leading-relaxed pt-2">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            }))}
          </div>
        </div>

        {/* Bottom Support Banner */}
        <div className="bg-[#0073b6] rounded-[20px] p-6 text-center text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] relative overflow-hidden mt-8">
          {/* Decorative subtle circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-[11px] font-bold mb-4 backdrop-blur-sm border border-white/10">
              <div className="w-1.5 h-1.5 bg-[#4ade80] rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
              Online Now
            </div>

            <h3 className="text-[18px] font-bold mb-2">24/7 Customer Support</h3>
            <p className="text-white/80 text-[13px] leading-relaxed max-w-[280px]">
              Our dedicated support team is always ready to help you with any questions or concerns.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
