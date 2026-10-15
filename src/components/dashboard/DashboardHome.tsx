import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Coins,
  Crown,
  DollarSign,
  Eye,
  EyeOff,
  Flame,
  Layers,
  LineChart,
  Percent,
  Plus,
  Radio,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTradeStore } from "../../store/useTradeStore";
import { formatCrypto, formatPercent, formatTimestamp, formatUSD, formatHoldingAmount, formatAssetValueUSD } from "../../lib/utils";
import { Asset } from "../../types";
import { AssetIcon } from "../ui/AssetIcon";

const PORTFOLIO_COLORS = ["#00ffa3", "#6366f1", "#00e5ff", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6", "#14b8a6"];

export const DashboardHome: React.FC = () => {
  const {
    fiatBalance,
    assets,
    positions,
    transactions,
    signals,
    setActiveTab,
    setSelectedTradeAsset,
    openMoveMoneyModal,
  } = useTradeStore();

  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [selectedAssetCategory, setSelectedAssetCategory] = useState<"all" | "crypto" | "equity">("all");

  // Calculations
  const holdingsValue = assets.reduce((acc, a) => acc + a.holdingValueUSD, 0);
  const totalPortfolioValue = fiatBalance + holdingsValue;
  
  // Total unrealized P&L from open positions
  const openPositions = positions.filter((p) => p.status === "OPEN");
  const totalOpenPnL = openPositions.reduce((acc, p) => acc + p.pnlUSD, 0);
  const totalInvestedInTrades = openPositions.reduce((acc, p) => acc + p.amount, 0);
  const pnlPercent = totalInvestedInTrades > 0 ? (totalOpenPnL / totalInvestedInTrades) * 100 : 4.82;

  // Chart data for portfolio allocation
  const pieData = [
    { name: "USD Cash", value: Math.round(fiatBalance) },
    ...assets
      .filter((a) => a.holdingValueUSD > 0)
      .map((a) => ({
        name: a.symbol,
        value: Math.round(a.holdingValueUSD),
      })),
  ];

  const filteredAssets = assets.filter((a) => {
    if (selectedAssetCategory === "crypto") return a.category === "crypto";
    if (selectedAssetCategory === "equity") return a.category === "equity";
    return true;
  });

  const handleQuickTrade = (symbol: string) => {
    setSelectedTradeAsset(symbol);
    setActiveTab("trading");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Total Balance Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Balance Card */}
        <div className="lg:col-span-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e0e14] via-[#09090c] to-[#050505] border border-[#1c1c24] p-6 sm:p-8 shadow-2xl">
          {/* Ambient Lighting Background Accents */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-[#00ffa3]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#71717a] uppercase tracking-wider">
                    Total Estimated Balance
                  </span>
                  <button
                    onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                    className="text-[#71717a] hover:text-[#d4d4d8] transition-colors"
                    aria-label="Toggle balance visibility"
                  >
                    {isBalanceHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="mt-2 flex items-baseline gap-3">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                    {isBalanceHidden ? "••••••••••" : formatUSD(totalPortfolioValue)}
                  </h1>
                </div>

                {/* 24h Change Pill */}
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/25">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {totalPortfolioValue > 0 ? "+$2,840.50 (+3.12%)" : "$0.00 (0.00%)"}
                  </span>
                  <span className="text-xs text-[#71717a]">past 24 hours</span>
                </div>
              </div>

              {/* Action Buttons (Tablet/Desktop) */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={openMoveMoneyModal}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00ffa3] to-teal-400 hover:from-[#00ffa3]/90 hover:to-teal-300 text-black font-bold text-xs shadow-lg shadow-[#00ffa3]/20 transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4" />
                  <span>Move Money</span>
                </button>
              </div>
            </div>

            {/* Mobile Quick Action Buttons Grid */}
            <div className="grid grid-cols-4 gap-2 sm:hidden">
              <button
                onClick={() => setActiveTab("deposit")}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] hover:border-[#00ffa3]/40 hover:bg-[#14141a] transition-all group active:scale-95 text-center"
              >
                <div className="w-8 h-8 rounded-xl bg-[#00ffa3]/10 border border-[#00ffa3]/20 flex items-center justify-center text-[#00ffa3] mb-1.5 group-hover:scale-110 transition-transform">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-white group-hover:text-[#00ffa3] transition-colors">
                  Deposit
                </span>
              </button>

              <button
                onClick={() => setActiveTab("withdraw")}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] hover:border-[#00ffa3]/40 hover:bg-[#14141a] transition-all group active:scale-95 text-center"
              >
                <div className="w-8 h-8 rounded-xl bg-[#181820] border border-[#262633] flex items-center justify-center text-[#d4d4d8] mb-1.5 group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-white group-hover:text-[#00ffa3] transition-colors">
                  Withdraw
                </span>
              </button>

              <button
                onClick={() => setActiveTab("trading")}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] hover:border-[#00ffa3]/40 hover:bg-[#14141a] transition-all group active:scale-95 text-center"
              >
                <div className="w-8 h-8 rounded-xl bg-[#181820] border border-[#262633] flex items-center justify-center text-[#00ffa3] mb-1.5 group-hover:scale-110 transition-transform">
                  <LineChart className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-white group-hover:text-[#00ffa3] transition-colors">
                  Trade
                </span>
              </button>

              <button
                onClick={openMoveMoneyModal}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] hover:border-[#00ffa3]/40 hover:bg-[#14141a] transition-all group active:scale-95 text-center"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-1.5 group-hover:scale-110 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-white group-hover:text-[#00ffa3] transition-colors">
                  Convert
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Breakdown Donut Chart */}
        <div className="hidden lg:flex lg:col-span-4 rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white">Portfolio Allocation</h3>
              <p className="text-xs text-[#71717a]">Asset diversification breakdown</p>
            </div>
            <button
              onClick={() => setActiveTab("assets")}
              className="text-xs text-[#00ffa3] hover:text-[#00ffa3]/80 font-semibold flex items-center gap-0.5"
            >
              Details <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PORTFOLIO_COLORS[index % PORTFOLIO_COLORS.length]}
                      stroke="#0a0a0e"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => formatUSD(Number(val))}
                  contentStyle={{
                    backgroundColor: "#0c0c10",
                    borderColor: "#1c1c24",
                    borderRadius: "12px",
                    color: "#f5f5f5",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-[#71717a]">Holdings</span>
              <span className="text-sm font-bold text-white font-mono">{pieData.length} Assets</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#1c1c24]">
            {pieData.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PORTFOLIO_COLORS[idx % PORTFOLIO_COLORS.length] }}
                />
                <span className="truncate text-[#a1a1aa] font-medium">{item.name}</span>
                <span className="text-white font-mono font-semibold ml-auto">
                  {Math.round((item.value / totalPortfolioValue) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Main Grid: Top Assets & Market Watchlist */}
      <div className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Market Tickers & Holdings</h2>
            <p className="text-xs text-[#71717a]">Live prices simulated via CoinGecko & Yahoo Finance APIs</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-xs">
              <button
                onClick={() => setSelectedAssetCategory("all")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedAssetCategory === "all" ? "bg-[#181820] text-white" : "text-[#71717a] hover:text-[#d4d4d8]"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedAssetCategory("crypto")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedAssetCategory === "crypto" ? "bg-[#181820] text-white" : "text-[#71717a] hover:text-[#d4d4d8]"
                }`}
              >
                Crypto
              </button>
              <button
                onClick={() => setSelectedAssetCategory("equity")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedAssetCategory === "equity" ? "bg-[#181820] text-white" : "text-[#71717a] hover:text-[#d4d4d8]"
                }`}
              >
                Equities
              </button>
            </div>
          </div>
        </div>

        {/* Assets Table for Tablet/Desktop (md+) & Card-per-row for Mobile (<md) */}
        {/* 1. Desktop & Tablet Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1c1c24] text-[#71717a] font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-3">Asset</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">24h Change</th>
                <th className="pb-3">Your Holdings</th>
                <th className="pb-3">Trade</th>
                <th className="pb-3 text-right pr-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1c24]/60">
              {filteredAssets.map((asset) => {
                const isPositive = asset.change24h >= 0;

                return (
                  <tr
                    key={asset.symbol}
                    className="hover:bg-[#121217] transition-colors group cursor-pointer"
                    onClick={() => handleQuickTrade(asset.symbol)}
                  >
                    <td className="py-4 pl-3">
                      <div className="flex items-center gap-3">
                        <AssetIcon
                          symbol={asset.symbol}
                          name={asset.name}
                          size="md"
                          className="shadow-md"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-white group-hover:text-[#00ffa3] transition-colors">
                              {asset.name}
                            </span>
                            {asset.chainBadge && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold font-mono bg-amber-500/10 text-amber-300 border border-amber-500/25 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                {asset.chainBadge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#71717a] font-mono flex-wrap">
                            <span className="uppercase">{asset.symbol}</span>
                            {asset.subtitle && <span>· {asset.subtitle}</span>}
                            {asset.contractAddress && (
                              <span className="text-[#71717a]">{asset.contractAddress}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 font-mono font-bold text-sm text-white">
                      {formatUSD(asset.price)}
                    </td>

                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2 py-1 rounded-lg ${
                          isPositive
                            ? "text-[#00ffa3] bg-[#00ffa3]/10"
                            : "text-rose-400 bg-rose-500/10"
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {formatPercent(asset.change24h)}
                      </span>
                    </td>

                    <td className="py-4 font-mono">
                      <div>
                        <div className="font-bold text-white text-xs">
                          {formatHoldingAmount(asset.holdingAmount, asset.symbol)}
                        </div>
                        <div className="text-[11px] text-[#71717a]">
                          {asset.holdingValueUSD > 0
                            ? formatAssetValueUSD(asset.holdingValueUSD, asset.symbol)
                            : asset.symbol.toUpperCase() === "BTCBR"
                            ? "$0"
                            : "$0.00"}
                        </div>
                      </div>
                    </td>

                    <td className="py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickTrade(asset.symbol);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#14141a] hover:bg-[#00ffa3] hover:text-black text-[#d4d4d8] font-semibold text-xs transition-all shadow-sm border border-[#1c1c24] hover:border-transparent group-hover:border-[#00ffa3]/30"
                      >
                        Trade
                      </button>
                    </td>

                    <td className="py-4 text-right pr-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTradeAsset(asset.symbol);
                            setActiveTab("deposit");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#14141a] hover:bg-[#00ffa3] hover:text-black text-[#d4d4d8] font-semibold text-xs transition-all shadow-sm border border-[#1c1c24] hover:border-transparent"
                        >
                          Deposit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTradeAsset(asset.symbol);
                            setActiveTab("withdraw");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#14141a] hover:bg-[#00ffa3] hover:text-black text-[#d4d4d8] font-semibold text-xs transition-all shadow-sm border border-[#1c1c24] hover:border-transparent"
                        >
                          Withdraw
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 2. Mobile Card-per-row Layout (<md) */}
        <div className="block md:hidden space-y-3">
          {filteredAssets.map((asset) => {
            const isPositive = asset.change24h >= 0;

            return (
              <div
                key={asset.symbol}
                onClick={() => handleQuickTrade(asset.symbol)}
                className="p-4 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] active:border-[#00ffa3]/40 transition-all space-y-3 shadow-md"
              >
                {/* Header: Asset info & Current Price */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <AssetIcon
                      symbol={asset.symbol}
                      name={asset.name}
                      size="md"
                      className="shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-white">{asset.name}</span>
                        {asset.chainBadge && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold font-mono bg-amber-500/10 text-amber-300 border border-amber-500/25">
                            <span className="w-1 h-1 rounded-full bg-amber-400" />
                            {asset.chainBadge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#71717a] font-mono flex-wrap">
                        <span className="uppercase">{asset.symbol}</span>
                        {asset.subtitle && <span>· {asset.subtitle}</span>}
                        {asset.contractAddress && (
                          <span className="text-[#71717a]">{asset.contractAddress}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-white">
                      {formatUSD(asset.price)}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 font-bold text-[11px] px-1.5 py-0.5 rounded-md mt-0.5 ${
                        isPositive ? "text-[#00ffa3] bg-[#00ffa3]/10" : "text-rose-400 bg-rose-500/10"
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {formatPercent(asset.change24h)}
                    </span>
                  </div>
                </div>

                {/* Holdings summary row */}
                <div className="p-2.5 rounded-xl bg-[#09090c] border border-[#181820] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#71717a] font-medium">Your Holdings</span>
                  <div className="text-right font-mono">
                    <div className="text-white font-bold text-xs">
                      {formatHoldingAmount(asset.holdingAmount, asset.symbol)}
                    </div>
                    <div className="text-[11px] text-[#71717a]">
                      {asset.holdingValueUSD > 0
                        ? formatAssetValueUSD(asset.holdingValueUSD, asset.symbol)
                        : asset.symbol.toUpperCase() === "BTCBR"
                        ? "$0"
                        : "$0.00"}
                    </div>
                  </div>
                </div>

                {/* Mobile Actions: Deposit | Withdraw */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTradeAsset(asset.symbol);
                      setActiveTab("deposit");
                    }}
                    className="group/btn min-h-[40px] py-2 px-3 rounded-xl bg-[#14141a] hover:bg-[#00ffa3] hover:text-black text-[#d4d4d8] font-bold text-xs border border-[#22222e] transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-[#00ffa3] group-hover/btn:text-black transition-colors" />
                    <span>Deposit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTradeAsset(asset.symbol);
                      setActiveTab("withdraw");
                    }}
                    className="group/btn min-h-[40px] py-2 px-3 rounded-xl bg-[#14141a] hover:bg-[#00ffa3] hover:text-black text-[#d4d4d8] font-bold text-xs border border-[#22222e] transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#d4d4d8] group-hover/btn:text-black transition-colors" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Recent Transactions & AI Signals Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Transactions */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Activity</h3>
              <p className="text-xs text-[#71717a]">Deposits, withdrawals & execution receipts</p>
            </div>
            <button
              onClick={() => setActiveTab("trading")}
              className="text-xs text-[#00ffa3] hover:text-[#00ffa3]/80 font-semibold"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {transactions.slice(0, 4).map((tx) => {
              const isDeposit = tx.type === "deposit";
              const isWithdraw = tx.type === "withdraw";
              const isTrade = tx.type === "trade";

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] hover:border-[#272733] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                        isDeposit
                          ? "bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/25"
                          : isWithdraw
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                          : "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25"
                      }`}
                    >
                      {isDeposit && <ArrowDownLeft className="w-4 h-4" />}
                      {isWithdraw && <ArrowUpRight className="w-4 h-4" />}
                      {isTrade && <LineChart className="w-4 h-4" />}
                      {!isDeposit && !isWithdraw && !isTrade && <Zap className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-white">{tx.title}</div>
                      <div className="text-[10px] text-[#71717a] font-mono">
                        {formatTimestamp(tx.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xs font-bold font-mono ${
                        isDeposit
                          ? "text-[#00ffa3]"
                          : isWithdraw
                          ? "text-[#d4d4d8]"
                          : "text-cyan-400"
                      }`}
                    >
                      {isDeposit ? "+" : isWithdraw ? "-" : ""}
                      {formatUSD(tx.amountUSD)}
                    </div>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#181820] text-[#71717a]">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Quant Signal Spotlight */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#0e0e14] to-[#09090c] border border-[#1c1c24] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#00ffa3]/10 text-[#00ffa3]">
                  <Radio className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-white">AI Alpha Signals</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/25">
                PRO ACTIVE
              </span>
            </div>

            {signals[0] && (
              <div className="p-4 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{signals[0].symbol} Breakout</span>
                  <span className="text-xs font-extrabold text-[#00ffa3] font-mono">
                    {signals[0].confidence}% Confidence
                  </span>
                </div>

                <p className="text-xs text-[#d4d4d8] leading-relaxed">
                  {signals[0].rationale}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                  <div className="p-2 rounded-lg bg-[#070709] border border-[#1c1c24]">
                    <span className="text-[#71717a] block text-[10px]">Target Price</span>
                    <span className="text-[#00ffa3] font-bold">${signals[0].targetPrice.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#070709] border border-[#1c1c24]">
                    <span className="text-[#71717a] block text-[10px]">Stop Loss</span>
                    <span className="text-rose-400 font-bold">${signals[0].stopLossPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab("signals")}
            className="w-full mt-4 py-2.5 px-4 bg-[#14141a] hover:bg-[#1e1e26] text-[#d4d4d8] hover:text-white font-bold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-1.5 border border-[#1c1c24]"
          >
            <span>Explore All {signals.length} Institutional Signals</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
