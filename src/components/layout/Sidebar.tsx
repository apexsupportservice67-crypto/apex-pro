import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  Flame,
  Globe,
  HardDrive,
  LayoutDashboard,
  LineChart,
  Lock,
  PieChart,
  Radio,
  Settings,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useTradeStore } from "../../store/useTradeStore";
import { NavigationTab } from "../../types";
import { useRouter } from "../../context/RouterContext";

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    toggleSidebar,
    isTabletSidebarOpen,
    setTabletSidebarOpen,
    user,
    openWalletModal,
    signals,
  } = useTradeStore();

  React.useEffect(() => {
    if (isTabletSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isTabletSidebarOpen]);

  const mainItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "trading", label: "Trade Terminal", icon: LineChart, badge: "LIVE" },
    { id: "assets", label: "Assets & Portfolio", icon: PieChart },
  ];

  const serviceItems: NavItem[] = [
    { id: "deposit", label: "Deposit Funds", icon: ArrowDownLeft },
    { id: "withdraw", label: "Withdraw", icon: ArrowUpRight },
    { id: "signals", label: "AI Signals", icon: Radio, badge: `${signals.length}`, badgeColor: "bg-[#00ffa3]/10 text-[#00ffa3] border-[#00ffa3]/25" },
    { id: "cold-storage", label: "Cold Storage", icon: Lock, badge: "Vault" },
    { id: "cards", label: "Apex Cards", icon: CreditCard },
  ];

  const earnItems: NavItem[] = [
    { id: "investing", label: "Earn & Staking", icon: Flame, badge: "Up to 8.8%" },
    { id: "subscribe", label: "Apex PRO Tier", icon: Crown, badge: user?.tier === "PRO" ? "ACTIVE" : "UPGRADE", badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  ];

  const handleNavClick = (id: NavigationTab) => {
    setActiveTab(id);
    setTabletSidebarOpen(false);
  };

  const renderNavGroup = (title: string, items: NavItem[], isDrawer = false) => (
    <div className="mb-5">
      {(!isSidebarCollapsed || isDrawer) && (
        <div className="px-3.5 mb-2 text-[10px] font-bold tracking-wider text-[#71717a] uppercase">
          {title}
        </div>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={isSidebarCollapsed && !isDrawer ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                isActive
                  ? "bg-[#141419] text-[#00ffa3] border border-[#272733] shadow-sm shadow-black"
                  : "text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#121217] border border-transparent"
              } ${isSidebarCollapsed && !isDrawer ? "justify-center px-2" : ""}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? "text-[#00ffa3]" : "text-[#71717a] group-hover:text-[#e4e4e7]"
                }`}
              />

              {(!isSidebarCollapsed || isDrawer) && (
                <span className="flex-1 text-left truncate tracking-tight">{item.label}</span>
              )}

              {(!isSidebarCollapsed || isDrawer) && item.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                    item.badgeColor || "bg-[#18181f] text-[#d4d4d8] border-[#272732]"
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Active Indicator Accent */}
              {isActive && (
                <motion.div
                  layoutId={isDrawer ? "drawerActiveIndicator" : "sidebarActiveIndicator"}
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00ffa3] rounded-r-full shadow-[0_0_8px_#00ffa3]"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed/Pinned Sidebar (lg+ only) */}
      <aside
        className={`hidden lg:flex flex-col border-r border-[#18181e] bg-[#08080a]/95 backdrop-blur-2xl h-screen sticky top-0 shrink-0 overflow-y-auto custom-scrollbar transition-all duration-300 z-30 ${
          isSidebarCollapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#18181e]">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00ffa3] via-[#00dc82] to-[#00b0ff] p-[1px] flex items-center justify-center shadow-lg shadow-[#00ffa3]/20">
                <div className="w-full h-full bg-[#08080c] rounded-[11px] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-[#00ffa3]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold tracking-tight text-white">APEX</span>
                  <span className="text-[10px] font-bold text-[#00ffa3] bg-[#00ffa3]/10 px-1 py-0.2 rounded border border-[#00ffa3]/25">
                    TRADE
                  </span>
                </div>
                <p className="text-[10px] text-[#71717a] font-mono -mt-0.5">PRO TERMINAL</p>
              </div>
            </div>
          ) : (
            <div
              className="w-8 h-8 mx-auto rounded-xl bg-gradient-to-tr from-[#00ffa3] via-[#00dc82] to-[#00b0ff] p-[1px] flex items-center justify-center cursor-pointer shadow-lg shadow-[#00ffa3]/20"
              onClick={() => setActiveTab("dashboard")}
            >
              <div className="w-full h-full bg-[#08080c] rounded-[11px] flex items-center justify-center">
                <Activity className="w-4 h-4 text-[#00ffa3]" />
              </div>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-[#14141a] transition-colors"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {renderNavGroup("Main", mainItems)}
          {renderNavGroup("Services", serviceItems)}
          {renderNavGroup("Earn & Membership", earnItems)}

          {/* Web3 Quick Action in sidebar */}
          <div className="pt-2 border-t border-[#18181e]">
            <button
              onClick={openWalletModal}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                user?.connectedWalletAddress
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"
                  : "text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#121217] border border-[#1c1c24]"
              } ${isSidebarCollapsed ? "justify-center px-2" : ""}`}
              title="Connect Web3 Wallet"
            >
              <Wallet className="w-4 h-4 text-indigo-400 shrink-0" />
              {!isSidebarCollapsed && (
                <span className="flex-1 text-left truncate">
                  {user?.connectedWalletAddress
                    ? `${user.connectedWalletAddress.slice(0, 6)}...${user.connectedWalletAddress.slice(-4)}`
                    : "Connect Web3 Wallet"}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Footer Settings & Status */}
        <div className="p-3 border-t border-[#18181e] space-y-1">
          <button
            onClick={() => router.push("/")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-[#a1a1aa] hover:text-[#00ffa3] hover:bg-[#121217] border border-transparent ${
              isSidebarCollapsed ? "justify-center px-2" : ""
            }`}
            title="Public Landing Page"
          >
            <Globe className="w-4 h-4 shrink-0 text-[#00ffa3]" />
            {!isSidebarCollapsed && <span className="flex-1 text-left">Landing Page</span>}
          </button>


          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "settings"
                ? "bg-[#181820] text-white border border-[#272733]"
                : "text-[#a1a1aa] hover:text-white hover:bg-[#121217] border border-transparent"
            } ${isSidebarCollapsed ? "justify-center px-2" : ""}`}
            title="Settings"
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span className="flex-1 text-left">Settings & Security</span>}
          </button>

          {!isSidebarCollapsed && (
            <div className="mt-2 p-2.5 rounded-xl bg-[#0e0e12] border border-[#1c1c24] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ffa3] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ffa3]"></span>
                </span>
                <span className="text-[11px] font-medium text-[#a1a1aa]">Engine Online</span>
              </div>
              <span className="text-[10px] font-mono text-[#00ffa3] bg-[#00ffa3]/10 px-1.5 py-0.5 rounded border border-[#00ffa3]/20">
                0.02ms
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Slide-out Drawer with Overlay (Below lg / Tablet & Mobile triggered by hamburger) */}
      <AnimatePresence>
        {isTabletSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setTabletSidebarOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Slide-out Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-[#09090c] border-r border-[#1c1c24] flex flex-col shadow-2xl z-10"
            >
              {/* Drawer Header */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-[#18181e]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00ffa3] via-[#00dc82] to-[#00b0ff] p-[1px] flex items-center justify-center shadow-lg shadow-[#00ffa3]/20">
                    <div className="w-full h-full bg-[#08080c] rounded-[11px] flex items-center justify-center">
                      <Activity className="w-4 h-4 text-[#00ffa3]" />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-white font-mono">APEX TERMINAL</span>
                    <p className="text-[10px] text-[#71717a] font-mono">INSTITUTIONAL SUITE</p>
                  </div>
                </div>

                <button
                  onClick={() => setTabletSidebarOpen(false)}
                  className="p-2 rounded-xl text-[#71717a] hover:text-white bg-[#14141a] border border-[#22222c] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
                {renderNavGroup("Main", mainItems, true)}
                {renderNavGroup("Services", serviceItems, true)}
                {renderNavGroup("Earn & Membership", earnItems, true)}

                <div className="pt-2 border-t border-[#18181e]">
                  <button
                    onClick={() => {
                      openWalletModal();
                      setTabletSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      user?.connectedWalletAddress
                        ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"
                        : "text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#121217] border border-[#1c1c24]"
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="flex-1 text-left truncate">
                      {user?.connectedWalletAddress
                        ? `${user.connectedWalletAddress.slice(0, 6)}...${user.connectedWalletAddress.slice(-4)}`
                        : "Connect Web3 Wallet"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[#18181e] space-y-2">
                <button
                  onClick={() => {
                    router.push("/");
                    setTabletSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#a1a1aa] hover:text-[#00ffa3] hover:bg-[#121217]"
                >
                  <Globe className="w-4 h-4 text-[#00ffa3]" />
                  <span>Public Landing Page</span>
                </button>

                <button
                  onClick={() => handleNavClick("settings")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                    activeTab === "settings"
                      ? "bg-[#181820] text-white border border-[#272733]"
                      : "text-[#a1a1aa] hover:text-white"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings & Security</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
