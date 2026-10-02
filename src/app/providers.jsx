"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import { PWAProvider } from "@/components/PWAProvider";
import { useFetchData } from "@/hooks/useApi";

import { usePathname } from "next/navigation";

function AppLoader({ children }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { isLoading } = useFetchData("/settings", ["platform-settings"], {
    enabled: mounted,
  });

  const isAuthPage = pathname === "/" || pathname?.startsWith("/auth");

  if (isAuthPage) {
    return children;
  }

  if (!mounted || isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#0073b6] rounded-full animate-spin"></div>
      </div>
    );
  }

  return children;
}

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PWAProvider>
        <AppLoader>
          {children}
        </AppLoader>
      </PWAProvider>
    </QueryClientProvider>
  );
}
