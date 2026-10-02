"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Lock,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Check,
  Loader2
} from "lucide-react";
import { usePut } from "@/hooks/useApi";
import { toast } from "sonner";

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { mutate: updatePassword, isPending } = usePut("/users/me/password");

  // State for toggling password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      toast.error("Password must contain both letters and numbers");
      return;
    }

    if (newPassword === currentPassword) {
      toast.error("Please do not reuse your current password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    updatePassword({ currentPassword, newPassword }, {
      onSuccess: () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] overflow-y-auto [&::-webkit-scrollbar]:hidden ">
      {/* Header */}
      <div className="bg-[#111827] px-4 py-3.5 flex items-center sticky top-0 z-20 shadow-sm border-b border-white/5">
        <button 
          onClick={() => router.push('/dashboard/settings')}
          className="mr-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[15px] font-bold">Security</h1>
      </div>

      <div className="px-4 py-6 max-w-[480px] mx-auto w-full">

        {/* Top Icon Area */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-[60px] h-[60px] bg-[#0073b6] rounded-[18px] flex items-center justify-center text-white mb-3 shadow-sm">
            <Shield size={28} className="fill-white" />
          </div>
          <h2 className="text-white/90 text-[18px] font-bold">Change Password</h2>
          <p className="text-gray-400 text-[12.5px] mt-1">Update your account password</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#111827] rounded-[16px] border border-white/5 shadow-sm p-4 mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-white/80 mb-2">
                <Lock size={14} className="text-[#0073b6]" />
                <label className="text-[12px] font-medium">Login Password</label>
              </div>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your withdrawal password"
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-[10px] pl-3.5 pr-10 py-2.5 text-[13px] text-white/90 placeholder-gray-500 focus:outline-none focus:border-[#0073b6] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-white/80 mb-2">
                <Lock size={14} className="text-[#0073b6]" />
                <label className="text-[12px] font-medium">New Password</label>
              </div>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-[10px] pl-3.5 pr-10 py-2.5 text-[13px] text-white/90 placeholder-gray-500 focus:outline-none focus:border-[#0073b6] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 pb-2">
              <div className="flex items-center gap-1.5 text-white/80 mb-2">
                <CheckCircle2 size={14} className="text-[#0073b6]" />
                <label className="text-[12px] font-medium">Confirm Password</label>
              </div>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-[10px] pl-3.5 pr-10 py-2.5 text-[13px] text-white/90 placeholder-gray-500 focus:outline-none focus:border-[#0073b6] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#0073b6] hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold text-[14px] py-3 rounded-[10px] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Changes
                  <div className="w-[14px] h-[14px] bg-white rounded-full flex items-center justify-center">
                    <Check size={10} className="text-[#0073b6] stroke-[4]" />
                  </div>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Requirements Box */}
        <div className="bg-amber-900/20 rounded-[16px] border border-amber-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-[18px] h-[18px] bg-amber-500 rounded-full flex items-center justify-center text-white">
              <Info size={12} strokeWidth={3} />
            </div>
            <h3 className="text-amber-300 text-[13px] font-bold">Password Requirements</h3>
          </div>
          <ul className="space-y-2.5">
            {[
              "Minimum 8 characters",
              "Use a combination of letters and numbers",
              "Avoid using personal information",
              "Don't reuse old passwords"
            ].map((req, idx) => (
              <li key={idx} className="flex items-center gap-2.5 text-[#0073b6] text-[12px]">
                <Check size={14} className="shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
