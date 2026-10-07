import Script from "next/script";
import "./globals.css";

export async function generateMetadata() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://tradefluxbot-backend-5gbk.onrender.com/api";
    if (apiBase && apiBase.startsWith("http")) {
      const res = await fetch(`${apiBase}/settings`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        const siteName = data?.settings?.site_name || "TradeFluxBot";
        const siteTitle = data?.settings?.site_title || "TradeFluxBot - Crypto Mining & Trading Platform";
        return {
          title: siteName,
          description: siteTitle,
          manifest: "/manifest.json",
          icons: {
            icon: "/logo.png",
            shortcut: "/logo.png",
            apple: "/logo.png",
          },
          appleWebApp: {
            capable: true,
            statusBarStyle: "default",
            title: siteName,
          },
        };
      }
    }
  } catch (error) {
    // Ignore error and fallback to default
  }
  return {
    title: "TradeFluxBot",
    description: "TradeFluxBot - Crypto Mining & Trading Platform",
    manifest: "/manifest.json",
    icons: {
      icon: "/logo.png",
      shortcut: "/logo.png",
      apple: "/logo.png",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "TradeFluxBot",
    },
  };
}

import { Providers } from "./providers";
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased translate-no-popup font-sans"
    >
      <head>
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="lazyOnload" />
        <Script id="google-translate-init" strategy="lazyOnload">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, 'google_translate_element');
            }
          `}
        </Script>
        <style>{`
          /* Hide Google Translate Tooltips and Popups */
          .goog-te-banner-frame.skiptranslate { display: none !important; }
          body { top: 0px !important; }
          #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
          .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
