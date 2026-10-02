"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Share2, Calendar, Info, Loader2, Globe } from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function MyProfilePage() {
  const router = useRouter();
  const { data, isLoading } = useFetchData("/users/me", ["profile"]);
  const user = data?.user || {};

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="bg-[#111827] px-4 py-3.5 flex items-center sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button 
          onClick={() => router.push('/dashboard/settings')}
          className="mr-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[15px] font-bold">My Profile</h1>
      </div>

      <div className="px-4 py-4 max-w-[480px] mx-auto w-full space-y-4">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
             <Loader2 className="animate-spin text-[#0073b6] mb-2" size={32} />
             <p className="text-gray-500 text-sm">Loading profile...</p>
          </div>
        ) : (
          <>
            {/* Profile Avatar Card */}
            <div className="bg-[#111827] rounded-[16px] border border-white/5 p-5 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-20 h-20 rounded-full border-2 border-[#0073b6]/40 overflow-hidden mb-3 bg-gradient-to-br from-[#00629b] to-[#0f172a] flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
                {user.profile_image ? (
                  <img src={user.profile_image} alt={user.full_name || "Profile"} className="w-full h-full object-cover" />
                ) : (
                  (user.full_name || user.email || "U").charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="text-white/95 font-bold text-base">{user.full_name || "User"}</h2>
              <p className="text-gray-400 text-xs mt-0.5">{user.email || ""}</p>
            </div>

            {/* Main Details Card */}
            <div className="bg-[#111827] rounded-[16px] border border-white/5 shadow-sm overflow-hidden">
              <div className="flex flex-col divide-y divide-white/5">
                {/* Full Name */}
                <div className="p-4">
                  <div className="text-gray-400 text-[10px] font-medium tracking-wide uppercase mb-1.5">Full Name</div>
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-[#0073b6] fill-[#0073b6]/20" />
                    <span className="text-white/90 text-[14px]">{user.full_name || "N/A"}</span>
                  </div>
                </div>

                {/* Email Address */}
                <div className="p-4">
                  <div className="text-gray-400 text-[10px] font-medium tracking-wide uppercase mb-1.5">Email Address</div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-[#0073b6] fill-[#0073b6]/20" />
                    <span className="text-white/90 text-[14px]">{user.email || "N/A"}</span>
                  </div>
                </div>

                {/* Country */}
                <div className="p-4">
                  <div className="text-gray-400 text-[10px] font-medium tracking-wide uppercase mb-1.5">Country</div>
                  <div className="flex items-center gap-3">
                    <Globe size={16} className="text-[#0073b6] fill-[#0073b6]/20" />
                    <span className="text-white/90 text-[14px]">{user.country?.country_name || "N/A"}</span>
                  </div>
                </div>

                {/* Referral Code */}
                <div className="p-4">
                  <div className="text-gray-400 text-[10px] font-medium tracking-wide uppercase mb-1.5">Referral Code</div>
                  <div className="flex items-center gap-3">
                    <Share2 size={16} className="text-[#0073b6]" />
                    <span className="text-white/90 text-[14px]">{user.referral_code || "N/A"}</span>
                  </div>
                </div>

                {/* Member Since */}
                <div className="p-4">
                  <div className="text-gray-400 text-[10px] font-medium tracking-wide uppercase mb-1.5">Member Since</div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-[#0073b6]" />
                    <span className="text-white/90 text-[14px]">{user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-amber-900/20 rounded-[12px] p-4 border border-amber-500/20 flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <div className="w-[18px] h-[18px] bg-amber-500 rounded-full flex items-center justify-center text-white">
                  <Info size={12} strokeWidth={3} />
                </div>
              </div>
              <p className="text-amber-300 text-[13px] leading-snug">
                Profile information cannot be edited. Contact support if you need to make changes.
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
