import React, { useState, useRef, useEffect } from "react";
import {
  Activity,
  Bell,
  CheckCheck,
  ChevronDown,
  CreditCard,
  Crown,
  Download,
  Globe,
  Home,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  RotateCcw,
  Send,
  Shield,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import { useTradeStore } from "../../store/useTradeStore";
import { formatTimestamp, formatUSD } from "../../lib/utils";
import { useRouter } from "../../context/RouterContext";

const tabTitleMap: Record<string, string> = {

  dashboard: "Overview",
  trading: "Trade Terminal",
  deposit: "Deposit",
  withdraw: "Withdraw",
  assets: "Assets & Holdings",
  signals: "AI Quant Signals",
  "cold-storage": "Cold Storage",
  cards: "Apex Cards",
  investing: "Yield & Pools",
  subscribe: "PRO Tier",
  settings: "Settings & Security",
};

export const TopBar: React.FC = () => {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    openAuthModal,
    logout,
    openMoveMoneyModal,
    openWalletModal,
    activeTab,
    setActiveTab,
    toggleTabletSidebar,
  } = useTradeStore();

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getInitials = (name?: string, email?: string): string => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.trim().slice(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
      return email.trim().slice(0, 2).toUpperCase();
    }
    return "NC";
  };

  return (
    <header className="h-16 border-b border-[#18181e] bg-[#08080a]/95 backdrop-blur-2xl px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Logo on Mobile / Hamburger + Breadcrumb on Tablet & Desktop */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Mobile-only brand logo (clean minimal left cluster) */}
        <div
          className="flex md:hidden items-center gap-2 cursor-pointer active:scale-95 transition-transform"
          onClick={() => setActiveTab("dashboard")}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00ffa3] via-[#00dc82] to-[#00b0ff] p-[1px] flex items-center justify-center shadow-md shadow-[#00ffa3]/20">
            <div className="w-full h-full bg-[#08080c] rounded-[11px] flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#00ffa3]" />
            </div>
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white font-mono">APEX</span>
        </div>

        {/* Tablet Hamburger (below lg): triggers slide-out sidebar drawer */}
        <button
          onClick={toggleTabletSidebar}
          className="hidden md:flex lg:hidden p-2 rounded-xl text-[#a1a1aa] hover:text-white bg-[#0e0e12] hover:bg-[#14141a] border border-[#1c1c24] transition-colors"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Page Context Breadcrumb (Tablet & Desktop only) */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="text-[#71717a] hover:text-[#00ffa3] font-mono transition-colors"
          >
            APEX
          </button>
          <span className="text-[#3f3f46]">/</span>
          <span className="text-white font-bold text-xs tracking-tight">
            {tabTitleMap[activeTab] || "Overview"}
          </span>
        </div>
      </div>

      {/* Right Controls:
          - Mobile (<md): Notification Bell + Avatar ONLY (two clean minimal clusters)
          - Tablet/Desktop (md+): Quick Action + Web3 Wallet + Notification Bell + Avatar
      */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Admin Link (Shield Icon) */}
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#14141c] hover:bg-[#1e1e28] text-[#a1a1aa] hover:text-[#00ffa3] border border-[#22222e] hover:border-[#00ffa3]/30 text-xs font-bold transition-all"
          title="Admin Portal"
          aria-label="Admin Portal"
        >
          <Shield className="w-4 h-4 text-[#00ffa3]" />
        </button>

        {/* 1. Lightning / Quick Action button (Hidden on mobile < md) */}
        <button
          onClick={openMoveMoneyModal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-extrabold text-xs shadow-md shadow-[#00ffa3]/20 transition-all active:scale-95"
          title="Quick Actions (Deposit / Withdraw / Transfer)"
        >
          <Zap className="w-4 h-4 fill-black shrink-0" />
          <span className="font-bold tracking-tight">Quick Action</span>
        </button>

        {/* 2. Web3 Wallet button (Hidden on mobile < md) */}
        <button
          onClick={openWalletModal}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            user?.connectedWalletAddress
              ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20"
              : "bg-[#0e0e12] text-[#d4d4d8] border-[#1c1c24] hover:border-[#2a2a38] hover:text-white"
          }`}
          title={user?.connectedWalletAddress ? `Connected: ${user.connectedWalletAddress}` : "Connect Web3 Wallet"}
        >
          <Wallet className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="font-mono">
            {user?.connectedWalletAddress
              ? `${user.connectedWalletAddress.slice(0, 6)}...`
              : "Web3 Wallet"}
          </span>
        </button>

        {/* 3. Notification Bell with unread badge & dropdown (Universal) */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-[#a1a1aa] hover:text-white bg-[#0e0e12] hover:bg-[#14141a] border border-[#1c1c24] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00ffa3] text-black text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {isNotifOpen && (
            <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-auto mt-0 sm:mt-2 sm:w-96 rounded-2xl bg-[#0d0d10] border border-[#1c1c24] shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-[#1c1c24]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/25">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-[#71717a] hover:text-[#d4d4d8] transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#1c1c24]/60 py-2 space-y-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#71717a]">
                    No new notifications. Everything is up to date.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                        notif.read ? "bg-transparent opacity-70 hover:bg-[#14141a]" : "bg-[#14141a] border border-[#1c1c24]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-white">{notif.title}</span>
                        <span className="text-[10px] text-[#71717a] font-mono">
                          {formatTimestamp(notif.timestamp).split(",")[0]}
                        </span>
                      </div>
                      <p className="text-xs text-[#a1a1aa] mt-1 leading-snug">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Initials-only Avatar Menu (No Photo / Illustration) */}
        <div className="relative" ref={profileRef}>
          {isAuthenticated && user ? (
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-[#0e0e12] hover:bg-[#14141a] border border-[#1c1c24] transition-all"
              aria-label="User profile menu"
            >
              {/* Initials-only Circle */}
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-[#00ffa3] border border-[#00ffa3]/30 flex items-center justify-center font-mono font-bold text-xs shrink-0 select-none">
                {getInitials(user.name, user.email)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                  <span>{user.name}</span>
                  {user.tier === "PRO" && (
                    <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                  )}
                </div>
                <div className="text-[10px] text-[#00ffa3] font-mono font-medium">KYC Tier {user.kycLevel}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#71717a]" />
            </button>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="px-3.5 py-1.5 rounded-xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-bold text-xs transition-all shadow-md shadow-[#00ffa3]/20"
            >
              Sign In
            </button>
          )}

          {/* Profile Dropdown Menu */}
          {isProfileOpen && user && (
            <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-16 sm:top-auto mt-0 sm:mt-2 sm:w-64 rounded-2xl bg-[#0d0d10] border border-[#1c1c24] shadow-2xl p-2 z-50">
              <div className="p-3 border-b border-[#1c1c24]">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-[#00ffa3] border border-[#00ffa3]/30 flex items-center justify-center font-mono font-bold text-sm shrink-0 select-none">
                    {getInitials(user.name, user.email)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-[#a1a1aa] truncate font-mono">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/25">
                    KYC Tier {user.kycLevel}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#181820] text-amber-300 border border-amber-500/20">
                    Tier {user.tier}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#181820] text-[#d4d4d8] border border-[#272733]">
                    2FA {user.is2FAEnabled ? "Active" : "Off"}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    router.push("/");
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#d4d4d8] hover:text-white hover:bg-[#14141a] rounded-lg transition-colors text-left"
                >
                  <Globe className="w-3.5 h-3.5 text-[#00ffa3]" />
                  <span>Public Landing Page</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("settings");
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#d4d4d8] hover:text-white hover:bg-[#14141a] rounded-lg transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5 text-[#71717a]" />
                  <span>Account & Security</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("subscribe");
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors text-left"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Apex PRO Membership</span>
                </button>
              </div>

              <div className="pt-1 border-t border-[#1c1c24] space-y-0.5">
                <button
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = "/";
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#a1a1aa] hover:text-white hover:bg-[#14141a] rounded-lg transition-colors text-left"
                  title="Clear all stored local state and reset application"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#71717a]" />
                  <span>Reset All Local Storage</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsProfileOpen(false);
                    router.push("/login");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
