"use client";

import { ArrowLeft, Calendar, Tag, Share2, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useFetchData } from "@/hooks/useApi";

export default function NewsArticlePage() {
  const params = useParams();
  const { data, isLoading, error } = useFetchData(params?.id ? `/news/${params.id}` : null, ["news-public", params?.id]);

  const article = data?.news;

  const { data: settingsRes } = useFetchData("/settings", ["platform-settings"]);
  const siteName = settingsRes?.settings?.site_name || "TradeFluxBot";

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] overflow-y-auto  [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="bg-[#111827] px-4 pt-4 pb-3 flex justify-between items-center shadow-sm z-10 sticky top-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/news" className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:bg-white/10 transition-colors cursor-pointer">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-white/90 text-[15px] font-bold">Article</h1>
        </div>
        <button className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors shadow-sm cursor-pointer">
          <Share2 size={14} />
        </button>
      </div>

      <div className="px-4 pt-4 pb-4 max-w-[480px] mx-auto w-full flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#0073b6]" />
            <p className="text-sm font-medium">Loading article...</p>
          </div>
        ) : error || !article ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-400 bg-[#111827] rounded-[16px] border border-white/5 shadow-sm">
            <p className="text-sm font-medium">Article not found</p>
            <Link href="/dashboard/news" className="mt-4 text-[#0073b6] text-xs font-bold underline cursor-pointer">
              Return to News
            </Link>
          </div>
        ) : (
          <div className="bg-[#111827] rounded-[16px] p-[20px] border border-white/5 shadow-sm">
            {/* Meta */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-900/20 text-amber-400 flex items-center gap-1">
                <Tag size={8} /> {article.category || "General"}
              </span>
              <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-white/5 text-gray-400 flex items-center gap-1">
                <Calendar size={8} /> {new Date(article.published_at).toLocaleDateString()}
              </span>
              <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-white/5 text-gray-400 flex items-center gap-1 ml-auto">
                {article.views} views
              </span>
            </div>

            {/* Title */}
            <h1 className="text-white/90 font-extrabold text-[18px] leading-snug mb-5">
              {article.title}
            </h1>

            {/* Featured Image Placeholder */}
            {article.image ? (
              <div className="w-full h-[180px] rounded-xl mb-6 shadow-sm overflow-hidden flex items-center justify-center bg-white/5">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-[140px] bg-gradient-to-r from-[#00629b] to-[#0f172a] rounded-xl mb-6 shadow-inner relative overflow-hidden flex items-center justify-center border border-white/5">
                <div className="absolute inset-0 bg-black/20"></div>
                <span className="text-white/50 text-[10px] font-bold tracking-widest uppercase z-10 flex items-center gap-2">
                  <ImageIcon size={14} /> {siteName} News
                </span>
              </div>
            )}

            {/* Content */}
            <div className="text-gray-400 text-[13px] leading-relaxed whitespace-pre-wrap">
              {article.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
