import React, { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Crown,
  Flame,
  LayoutDashboard,
  LineChart,
  Lock,
  Menu,
  PieChart,
  Radio,
  Settings,
  Wallet,
  X,
} from "lucide-react";
import { useTradeStore } from "../../store/useTradeStore";
import { NavigationTab } from "../../types";

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, openWalletModal, user } = useTradeStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  React.useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const mainTabs: { id: NavigationTab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "trading", label: "Trade", icon: LineChart },
    { id: "deposit", label: "Deposit", icon: ArrowDownLeft },
    { id: "assets", label: "Assets", icon: PieChart },
  ];

  const drawerTabs: { id: NavigationTab; label: string; icon: React.ElementType; desc: string }[] = [
    { id: "withdraw", label: "Withdraw Funds", icon: ArrowUpRight, desc: "Fast wire & crypto out" },
    { id: "signals", label: "AI Trading Signals", icon: Radio, desc: "90%+ Winrate alpha" },
    { id: "cold-storage", label: "Cold Storage Vault", icon: Lock, desc: "Multi-sig timelock" },
    { id: "cards", label: "Apex Debit Cards", icon: CreditCard, desc: "3.5% crypto cashback" },
    { id: "investing", label: "Earn & Staking", icon: Flame, desc: "Up to 8.8% APY pools" },
    { id: "subscribe", label: "Apex PRO Tier", icon: Crown, desc: "Zero maker fees" },
    { id: "settings", label: "Security & Settings", icon: Settings, desc: "2FA, KYC & keys" },
  ];

  return (
    <>
      {/* Bottom Sticky Tab Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 bg-[#08080a]/95 backdrop-blur-2xl border-t border-[#18181e] flex items-center justify-around px-2 pt-1 pb-[max(env(safe-area-inset-bottom),0.5rem)] z-40">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[44px] py-1.5 px-2 rounded-xl transition-all ${
                isActive ? "text-[#00ffa3] font-bold" : "text-[#71717a] hover:text-[#d4d4d8]"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-[#00ffa3] scale-105" : "text-[#71717a]"}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setIsDrawerOpen(true)}
          className={`flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[44px] py-1.5 px-2 rounded-xl transition-all ${
            isDrawerOpen ? "text-[#00ffa3] font-bold" : "text-[#71717a] hover:text-[#d4d4d8]"
          }`}
        >
          <Menu className={`w-5 h-5 ${isDrawerOpen ? "text-[#00ffa3]" : "text-[#71717a]"}`} />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </nav>

      {/* Mobile Services Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end md:hidden">
          <div className="bg-[#0c0c0f] border-t border-[#1c1c24] rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c24]">
              <span className="text-base font-bold text-white">All Platform Services</span>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-xl bg-[#14141a] text-[#71717a] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => {
                  openWalletModal();
                  setIsDrawerOpen(false);
                }}
                className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all text-left ${
                  user?.connectedWalletAddress
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-sm"
                    : "bg-[#121216] border-[#1c1c24] text-[#d4d4d8] hover:bg-[#181820]"
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl ${
                    user?.connectedWalletAddress
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "bg-[#181820] text-indigo-400"
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">
                    {user?.connectedWalletAddress
                      ? `${user.connectedWalletAddress.slice(0, 6)}...${user.connectedWalletAddress.slice(-4)}`
                      : "Connect Web3 Wallet"}
                  </div>
                  <div className="text-xs text-[#71717a] truncate">
                    {user?.connectedWalletAddress
                      ? "Wallet connected & active"
                      : "Link EVM or Solana address"}
                  </div>
                </div>
              </button>

              {drawerTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsDrawerOpen(false);
                    }}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all text-left ${
                      isActive
                        ? "bg-[#00ffa3]/10 border-[#00ffa3]/30 text-[#00ffa3]"
                        : "bg-[#121216] border-[#1c1c24] text-[#d4d4d8] hover:bg-[#181820]"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl ${
                        isActive
                          ? "bg-[#00ffa3]/20 text-[#00ffa3]"
                          : "bg-[#181820] text-[#a1a1aa]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">{tab.label}</div>
                      <div className="text-xs text-[#71717a]">{tab.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
