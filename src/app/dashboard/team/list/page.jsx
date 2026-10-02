"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function TeamListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(1);

  const { data: teamListRes, isLoading } = useFetchData(`/users/team/list?level=${activeTab}`, ["team-list", activeTab]);
  const teamList = teamListRes?.data || [];

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden ">
      {/* Header */}
      <div className="bg-[#111827] px-4 py-4 flex items-center gap-3 sticky top-0 z-20 border-b border-white/5">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-white/5 border border-white/5 rounded-[10px] flex items-center justify-center transition-colors text-white/90 shadow-sm hover:bg-white/10 shrink-0 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-white/90 text-[18px] font-bold">Team List</h1>
      </div>

      <div className="px-4 max-w-[480px] mx-auto w-full flex-1 flex flex-col pb-10">

        {/* Tabs */}
        <div className="bg-[#111827] border border-white/5 p-1.5 rounded-[12px] flex mt-2 mb-6">
          {[1, 2, 3, 4].map((level) => (
            <button
              key={level}
              onClick={() => setActiveTab(level)}
              className={`cursor-pointer flex-1 py-2.5 text-[13px] font-medium rounded-[8px] transition-all ${activeTab === level
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white/90'
                }`}
            >
              Level {level}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#0073b6] mb-3" />
            <span className="text-[12px] text-gray-500 font-medium">Loading team members...</span>
          </div>
        ) : teamList.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[300px]">
            <div className="relative mb-4">
              {/* Simple overlapping users icon effect */}
              <Users size={64} className="text-white/10 opacity-60 ml-4" />
              <Users size={48} className="text-white/5 opacity-40 absolute top-2 right-8" />
            </div>
            <p className="text-gray-400 text-[14px]">
              No members in Level {activeTab} yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {teamList.map((user) => (
              <div key={user.id} className="bg-[#111827] rounded-[16px] px-4 py-3 flex items-center justify-between shadow-md border border-white/5">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-br from-[#0d9488] to-[#2563eb] flex items-center justify-center text-white font-bold text-[20px] shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* User Info */}
                  <div>
                    <h3 className="text-white/90 font-bold text-[15px] -mb-0.5">{user.username}</h3>
                    <p className="text-gray-400 text-[12px] ">
                      Joined {new Date(user.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className={`text-[12px] font-bold ${user.status === 'Active' ? 'text-[#34d399]' : 'text-gray-400'}`}>
                      {user.status}
                    </p>
                  </div>
                </div>

                {/* Financials */}
                <div className="text-right flex flex-col items-end justify-center">
                  <div className="flex items-baseline gap-2 -mb-0.5">
                    <span className="text-gray-400 text-[11px]">Balance:</span>
                    <span className="text-white/90 font-bold text-[14px]">
                      ${Number(user.balance).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-baseline gap-2 -mb-0.5">
                    <span className="text-gray-400 text-[11px]">Deposited:</span>
                    <span className="text-[#fbbf24] font-bold text-[13px]">
                      ${Number(user.deposited_amount || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 -mb-0.5">
                    <span className="text-gray-400 text-[11px]">Invested:</span>
                    <span className="text-[#34d399] font-bold text-[13px]">
                      ${Number(user.invested_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
