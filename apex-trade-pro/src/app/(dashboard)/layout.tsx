import React, { useEffect } from "react";
import { Sidebar } from "../../components/layout/Sidebar";
import { TopBar } from "../../components/layout/TopBar";
import { MobileNav } from "../../components/layout/MobileNav";
import { SupportChatBubble } from "../../components/support/SupportChatBubble";
import { useTradeStore } from "../../store/useTradeStore";
import { useRouter } from "../../context/RouterContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, tickPrices, fetchLiveCoinGeckoPrices, addToast } = useTradeStore();

  // Session Authentication Check:
  // If not authenticated, redirect unauthenticated users to /login
  useEffect(() => {
    if (!isAuthenticated) {
      addToast("Authentication Required", "Please sign in to access the trading terminal & dashboard.", "warning");
      router.replace("/login");
    }
  }, [isAuthenticated, router, addToast]);

  // Initial CoinGecko live price fetch & recurring polling
  useEffect(() => {
    fetchLiveCoinGeckoPrices();
    const liveFetchInterval = setInterval(() => {
      fetchLiveCoinGeckoPrices();
    }, 45000);
    return () => clearInterval(liveFetchInterval);
  }, [fetchLiveCoinGeckoPrices]);

  // Market live price tick jitter loop
  useEffect(() => {
    const interval = setInterval(() => {
      tickPrices();
    }, 4500);
    return () => clearInterval(interval);
  }, [tickPrices]);

  if (!isAuthenticated) {
    // Show smooth loading state while redirecting
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#050505] text-[#f5f5f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00ffa3] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#71717a] font-mono">Verifying institutional session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-[#f5f5f5] font-sans antialiased selection:bg-[#00ffa3]/20 selection:text-[#00ffa3]">
      {/* Desktop Fixed/Sticky Sidebar */}
      <Sidebar />

      {/* Main Column: Pinned Top Navigation + Scrollable Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Navigation */}
        <TopBar />

        {/* Main Content Viewport (Scrolls Independently) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 md:p-6 lg:p-8 pb-24 md:pb-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileNav />

      {/* Floating Support Chat Bubble */}
      <SupportChatBubble />
    </div>
  );
}
