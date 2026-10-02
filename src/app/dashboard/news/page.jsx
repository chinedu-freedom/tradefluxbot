"use client";

import { ArrowLeft, Bell, ChevronRight, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFetchData } from "@/hooks/useApi";

export default function NewsPage() {
  const { data, isLoading, error } = useFetchData("/news", ["news-public"]);
  
  const newsItems = data?.news || [];

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto  [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="bg-[#111827] px-4 pt-4 pb-4 shadow-sm z-10 sticky top-0 flex items-center justify-between gap-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors shrink-0 cursor-pointer">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-white/90 text-[18px] font-bold tracking-tight leading-none mb-1">News & Updates</h1>
            <p className="text-gray-400 text-[10px] leading-none">Stay informed with the latest announcements</p>
          </div>
        </div>
        <button className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors shadow-sm relative shrink-0 cursor-pointer">
          <Bell size={14} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-3 max-w-[480px] mx-auto w-full flex-1 ">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-amber-500" />
            <p className="text-sm font-medium">Loading news...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-400">
            <p className="text-sm font-medium">Failed to load news</p>
          </div>
        ) : newsItems.length > 0 ? (
          newsItems.map((news) => (
            <Link href={`/dashboard/news/${news.id}`} key={news.id} className="block bg-[#111827] rounded-[16px] p-[16px] border border-white/5 shadow-md hover:bg-white/5 transition-colors cursor-pointer">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-900/30 text-amber-400">
                  {news.category || "General"}
                </span>
                <div className="flex items-center gap-1 text-gray-400 text-[9px]">
                  <Calendar size={10} />
                  <span>{new Date(news.published_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-3">
                {news.image && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-white/5">
                    <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-white/90 font-bold text-[14px] leading-tight mb-1.5 line-clamp-2">
                    {news.title}
                  </h2>
                  <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-2 mb-3">
                    {news.description}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-2">
                <div className="text-[10px] text-gray-400 font-medium">{news.views} views</div>
                <div className="flex items-center text-[#0073b6] text-[10px] font-bold">
                  Read Full Article <ChevronRight size={12} className="ml-0.5" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-400">No news available</p>
          </div>
        )}
      </div>
    </div>
  );
}
