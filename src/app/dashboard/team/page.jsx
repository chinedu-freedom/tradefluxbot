"use client";

import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Mail, 
  Loader2, 
  Trophy, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Lock, 
  Unlock, 
  Zap, 
  Info 
} from "lucide-react";
import { useFetchData } from "@/hooks/useApi";

export default function TeamPage() {
  const router = useRouter();
  
  const { data: teamRes, isLoading } = useFetchData("/users/team", ["team-stats"]);
  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const settings = settingsRes?.settings || {};
  const symbol = settings.currency_symbol || "$";
  
  const stats = teamRes?.data;
  const overview = stats?.overview || { new_members_today: 0, new_earnings_today: 0, total_team: 0 };
  const levels = stats?.levels || [
    { level: 1, total_members: 0, valid_members: 0, commission_rate: 0, total_earnings: 0, total_deposits: 0 },
    { level: 2, total_members: 0, valid_members: 0, commission_rate: 0, total_earnings: 0, total_deposits: 0 },
    { level: 3, total_members: 0, valid_members: 0, commission_rate: 0, total_earnings: 0, total_deposits: 0 },
    { level: 4, total_members: 0, valid_members: 0, commission_rate: 0, total_earnings: 0, total_deposits: 0 }
  ];
  
  const l1 = levels[0];
  const l2 = levels[1];
  const l3 = levels[2];
  const l4 = levels[3];

  const total = overview.total_team || 1; 
  const p1 = (l1.total_members / total) * 100;
  const p2 = (l2.total_members / total) * 100;
  const p3 = (l3.total_members / total) * 100;

  const ranksData = stats?.ranks || {};
  const currentRank = ranksData?.current_rank || 0;
  const directVolume = Number(ranksData?.direct_volume ?? l1.total_deposits ?? 0);
  const teamVolume = Number(ranksData?.team_volume ?? ((l1.total_deposits || 0) + (l2.total_deposits || 0) + (l3.total_deposits || 0) + (l4.total_deposits || 0)));
  const isFridayToday = ranksData?.is_friday ?? (new Date().getDay() === 5);

  const defaultTiers = [
    {
      rank_level: 1,
      name: "Rank 1",
      title: "Bronze Ambassador",
      badge: "🥉",
      type: "DIRECT_VOLUME",
      target_volume: 5000,
      reward_amount: 250,
      withdrawable_everyday: true,
      current_volume: directVolume,
      progress_percent: Math.min(100, Math.round((directVolume / 5000) * 100)),
      is_claimed: false,
      description: "Direct Volume $5,000 = $250 Once-off Bonus (Withdrawable 24/7)"
    },
    {
      rank_level: 2,
      name: "Rank 2",
      title: "Silver Leader",
      badge: "🥈",
      type: "TEAM_VOLUME",
      target_volume: 15000,
      reward_amount: 750,
      withdrawable_everyday: false,
      current_volume: teamVolume,
      progress_percent: Math.min(100, Math.round((teamVolume / 15000) * 100)),
      is_claimed: false,
      description: "Team Volume $15,000 = $750 Once-off Bonus (Withdrawable Fridays)"
    },
    {
      rank_level: 3,
      name: "Rank 3",
      title: "Gold Director",
      badge: "🥇",
      type: "TEAM_VOLUME",
      target_volume: 30000,
      reward_amount: 1250,
      withdrawable_everyday: false,
      current_volume: teamVolume,
      progress_percent: Math.min(100, Math.round((teamVolume / 30000) * 100)),
      is_claimed: false,
      description: "Team Volume $30,000 = $1,250 Once-off Bonus (Withdrawable Fridays)"
    },
    {
      rank_level: 4,
      name: "Rank 4",
      title: "Diamond Partner",
      badge: "💎",
      type: "TEAM_VOLUME",
      target_volume: 60000,
      reward_amount: 2500,
      withdrawable_everyday: false,
      current_volume: teamVolume,
      progress_percent: Math.min(100, Math.round((teamVolume / 60000) * 100)),
      is_claimed: false,
      description: "Team Volume $60,000 = $2,500 Once-off Bonus (Withdrawable Fridays)"
    }
  ];

  const rankTiers = ranksData?.tiers || defaultTiers;

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="bg-[#111827] px-4 py-4 flex justify-between items-center sticky top-0 z-20 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 bg-white/5 rounded-[10px] flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-white/90 text-[20px] font-bold">Team & Ranks</h1>
        </div>
        <button
          onClick={() => router.push('/dashboard/invite')}
          className="w-9 h-9 bg-[#0073b6] rounded-[10px] flex items-center justify-center text-white shadow-sm hover:bg-[#0073b6] transition-colors cursor-pointer"
        >
          <Mail size={16} fill="currentColor" />
        </button>
      </div>

      <div className="px-4 space-y-4 max-w-[480px] mx-auto w-full pb-10 mt-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0073b6] mb-3" />
            <span className="text-[12px] text-gray-500 font-medium">Loading team data...</span>
          </div>
        ) : (
          <>
            {/* Team Data Overview */}
            <div className="bg-[#111827] rounded-[16px] p-5 text-white/90 shadow-md border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-[14px]">Team Data Overview</h2>
                <div className="bg-white/5 px-3 py-1 rounded-full text-[11px] text-gray-400">
                  today
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <div className="text-[28px] font-bold mb-1 leading-none text-[#0073b6]">{overview.new_members_today}</div>
                  <div className="text-gray-400 text-[11px]">New Members</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-[28px] font-bold mb-1 leading-none text-[#0073b6]">{symbol}{Number(overview.new_earnings_today).toFixed(2)}</div>
                  <div className="text-gray-400 text-[11px]">New Earnings</div>
                </div>
              </div>
            </div>

            {/* Rank Ups and Rewards Card */}
            <div className="bg-gradient-to-b from-[#141d2e] to-[#111827] rounded-[20px] border border-amber-500/20 shadow-xl p-5 relative overflow-hidden space-y-5">
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-[15px]">Rank Ups & Rewards</h2>
                    <p className="text-[11px] text-gray-400">Unlock once-off cash bonuses</p>
                  </div>
                </div>

                <div className="flex items-center">
                  {currentRank > 0 ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-[11px] shadow-sm">
                      <Sparkles size={12} /> Rank {currentRank}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-[11px] font-medium">
                      Member
                    </span>
                  )}
                </div>
              </div>

              {/* Volume Stats Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                  <div className="text-gray-400 text-[11px] mb-1 font-medium">Direct Volume (L1)</div>
                  <div className="text-[18px] font-bold text-white">{symbol}{directVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Level 1 deposits
                  </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                  <div className="text-gray-400 text-[11px] mb-1 font-medium">Total Team Volume</div>
                  <div className="text-[18px] font-bold text-amber-400">{symbol}{teamVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Levels 1-4 combined
                  </div>
                </div>
              </div>

              {/* Rank Tiers List */}
              <div className="space-y-3 pt-1">
                {rankTiers.map((tier) => {
                  const targetFormatted = tier.target_volume.toLocaleString();
                  const currentVol = Number(tier.current_volume || 0);
                  const progress = tier.is_claimed ? 100 : Math.min(100, Math.round((currentVol / tier.target_volume) * 100));
                  const isEligible = currentVol >= tier.target_volume;

                  return (
                    <div 
                      key={tier.rank_level}
                      className={`rounded-xl p-3.5 border transition-all ${
                        tier.is_claimed 
                          ? "bg-emerald-500/5 border-emerald-500/30" 
                          : isEligible 
                            ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]" 
                            : "bg-white/[0.03] border-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[18px]">{tier.badge || "🏆"}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-white font-bold text-[13px]">{tier.name}</span>
                              <span className="text-[10px] text-gray-400">({tier.type === "DIRECT_VOLUME" ? "Direct" : "Team"})</span>
                            </div>
                            <div className="text-[11px] text-gray-400">
                              Target: {symbol}{targetFormatted} volume
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-amber-400 font-extrabold text-[14px]">
                            +{symbol}{tier.reward_amount}
                          </div>
                          {tier.is_claimed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-0.5">
                              <CheckCircle2 size={10} /> Claimed
                            </span>
                          ) : isEligible ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full mt-0.5 animate-pulse">
                              <Sparkles size={10} /> Unlocked!
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-medium">
                              {progress}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            tier.is_claimed 
                              ? "bg-emerald-400" 
                              : isEligible 
                                ? "bg-gradient-to-r from-amber-400 to-yellow-400" 
                                : "bg-[#0073b6]"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1.5">
                        <span>{symbol}{currentVol.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / {symbol}{targetFormatted}</span>
                        <span className={tier.withdrawable_everyday ? "text-emerald-400/90 font-medium" : "text-amber-400/90 font-medium"}>
                          {tier.withdrawable_everyday ? "Everyday Payout" : "Friday Payout"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Withdrawal Rules Notice */}
              <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-[11px] space-y-1.5">
                <div className="flex items-center gap-1.5 text-white/90 font-bold">
                  <Info size={13} className="text-[#0073b6]" /> Payout Schedule:
                </div>
                <div className="text-gray-300 leading-relaxed space-y-1 pl-1">
                  <p className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold shrink-0">•</span>
                    <span><strong>Level 1 Direct Commissions & Rank 1 Bonus:</strong> Withdrawable anytime, every day (24/7).</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold shrink-0">•</span>
                    <span><strong>Levels 2-4 Commissions & Team Rank Bonuses:</strong> Withdrawable exclusively on Fridays.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Earnings Analysis */}
            <div className="bg-[#111827] rounded-[16px] border border-white/5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white/90 font-bold text-[14px]">Earnings Analysis</h2>
                <div className="text-gray-400 text-[11px]">today</div>
              </div>

              <div className="flex items-center justify-between mb-8">
                {/* Donut Chart */}
                <div className="relative w-32 h-32 ml-4">
                  <div 
                    className="w-full h-full rounded-full transition-all duration-700" 
                    style={{ 
                      background: overview.total_team === 0 
                        ? 'rgba(255,255,255,0.05)' 
                        : `conic-gradient(#fecdd3 0% ${p1}%, #93c5fd ${p1}% ${p1+p2}%, #fde047 ${p1+p2}% ${p1+p2+p3}%, #10b981 ${p1+p2+p3}% 100%)` 
                    }}
                  >
                    <div className="absolute inset-3 bg-[#111827] rounded-full shadow-inner"></div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-3 mr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-[4px] bg-[#fecdd3]"></div>
                    <span className="text-white/90 text-[12px] font-medium">Level 1 ({l1.total_members})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-[4px] bg-[#93c5fd]"></div>
                    <span className="text-white/90 text-[12px] font-medium">Level 2 ({l2.total_members})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-[4px] bg-[#fde047]"></div>
                    <span className="text-white/90 text-[12px] font-medium">Level 3 ({l3.total_members})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-[4px] bg-[#10b981]"></div>
                    <span className="text-white/90 text-[12px] font-medium">Level 4 ({l4.total_members})</span>
                  </div>
                </div>
              </div>

              {/* Bottom Link */}
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <div className="text-gray-400 text-[13px]">
                  Accumulated Team: <span className="text-white/90 font-bold">{overview.total_team}</span>
                </div>
                <button
                  onClick={() => router.push('/dashboard/team/list')}
                  className="text-[#0073b6] text-[13px] cursor-pointer hover:underline font-medium"
                >
                  View Team List
                </button>
              </div>
            </div>

            {/* Effective User Data */}
            <div className="bg-[#111827] rounded-[16px] border border-white/5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5">
              <h2 className="text-white/90 font-bold text-[14px] mb-6">Effective User Data</h2>

              <div className="space-y-6">
                {/* Level 1 */}
                <div>
                  <h3 className="text-white/90 text-[13px] font-bold mb-4">Level 1</h3>
                  <div className="grid grid-cols-4 text-center">
                    <div>
                      <div className="text-[#0073b6] text-[16px] font-bold mb-1">{l1.valid_members}/{l1.total_members}</div>
                      <div className="text-gray-400 text-[10px]">Valid Members</div>
                    </div>
                    <div>
                      <div className="text-[#0073b6] text-[16px] font-bold mb-1">{l1.commission_rate}%</div>
                      <div className="text-gray-400 text-[10px]">Commission</div>
                    </div>
                    <div>
                      <div className="text-[#0073b6] text-[16px] font-bold mb-1">{symbol}{Number(l1.total_deposits || 0).toFixed(2)}</div>
                      <div className="text-gray-400 text-[10px]">Total Deposit</div>
                    </div>
                    <div>
                      <div className="text-[#0073b6] text-[16px] font-bold mb-1">{symbol}{Number(l1.total_earnings).toFixed(2)}</div>
                      <div className="text-gray-400 text-[10px]">Total Earnings</div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/5 w-full"></div>

                {/* Level 2 */}
                <div>
                  <h3 className="text-white/90 text-[13px] font-bold mb-4">Level 2</h3>
                  <div className="grid grid-cols-4 text-center">
                    <div>
                      <div className="text-[#0073b6] text-[16px] font-bold mb-1">{l2.valid_members}/{l2.total_members}</div>
                      <div className="text-gray-400 text-[10px]">Valid Members</div>
                    </div>
                    <div>
                      <div className="text-[#0073b6] text-[16px] font-bold mb-1">{l2.commission_rate}%</div>
                      <div className="text-gray-400 text-[10px]">Commission</div>
                    </div>
                    <div>
                      <div className="text-[#0073b6] text-[16px] font-bold mb-1">{symbol}{Number(l2.total_deposits || 0).toFixed(2)}</div>
                      <div className="text-gray-400 text-[10px]">Total Deposit</div>
                    </div>
                    <div>
                      <div className="text-[#0073b6] text-[16px] font-bold mb-1">{symbol}{Number(l2.total_earnings).toFixed(2)}</div>
                      <div className="text-gray-400 text-[10px]">Total Earnings</div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/5 w-full"></div>

                {/* Level 3 */}
                <div>
                  <h3 className="text-white/90 text-[13px] font-bold mb-4">Level 3</h3>
                  <div className="grid grid-cols-4 text-center">
                    <div>
                      <div className="text-[#0073b6] text-[16px] font-bold mb-1">{l3.valid_members}/{l3.total_members}</div>
                      <div className="text-gray-400 text-[10px]">Valid Members</div>
                    </div>
                    <div>
                      <div className="text-[#0073b6] text-[16px] font-bold mb-1">{l3.commission_rate}%</div>
                      <div className="text-gray-400 text-[10px]">Commission</div>
                    </div>
                    <div>
                      <div className="text-[#0073b6] text-[16px] font-bold mb-1">{symbol}{Number(l3.total_deposits || 0).toFixed(2)}</div>
                      <div className="text-gray-400 text-[10px]">Total Deposit</div>
                    </div>
                    <div>
                      <div className="text-[#0073b6] text-[16px] font-bold mb-1">{symbol}{Number(l3.total_earnings).toFixed(2)}</div>
                      <div className="text-gray-400 text-[10px]">Total Earnings</div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/5 w-full"></div>

                {/* Level 4 */}
                <div>
                  <h3 className="text-white/90 text-[13px] font-bold mb-4">Level 4</h3>
                  <div className="grid grid-cols-4 text-center">
                    <div>
                      <div className="text-[#0073b6] text-[16px] font-bold mb-1">{l4.valid_members}/{l4.total_members}</div>
                      <div className="text-gray-400 text-[10px]">Valid Members</div>
                    </div>
                    <div>
                      <div className="text-[#0073b6] text-[16px] font-bold mb-1">{l4.commission_rate}%</div>
                      <div className="text-gray-400 text-[10px]">Commission</div>
                    </div>
                    <div>
                      <div className="text-[#0073b6] text-[16px] font-bold mb-1">{symbol}{Number(l4.total_deposits || 0).toFixed(2)}</div>
                      <div className="text-gray-400 text-[10px]">Total Deposit</div>
                    </div>
                    <div>
                      <div className="text-[#0073b6] text-[16px] font-bold mb-1">{symbol}{Number(l4.total_earnings).toFixed(2)}</div>
                      <div className="text-gray-400 text-[10px]">Total Earnings</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
