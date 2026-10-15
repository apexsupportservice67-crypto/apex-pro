import React, { useState } from "react";
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  ChevronRight,
  Filter,
  PieChart as PieIcon,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useTradeStore } from "../../store/useTradeStore";
import { formatPercent, formatUSD, formatHoldingAmount, formatAssetValueUSD } from "../../lib/utils";
import { Asset } from "../../types";
import { AssetIcon } from "../ui/AssetIcon";

export const AssetsView: React.FC = () => {
  const { assets, fiatBalance, setActiveTab, setSelectedTradeAsset, openMoveMoneyModal } = useTradeStore();
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "crypto" | "equity" | "held">("all");

  const totalHoldingUSD = assets.reduce((acc, a) => acc + a.holdingValueUSD, 0);
  const netWorth = fiatBalance + totalHoldingUSD;

  const filtered = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === "crypto") return asset.category === "crypto";
    if (selectedFilter === "equity") return asset.category === "equity";
    if (selectedFilter === "held") return asset.holdingAmount > 0;
    return true;
  });

  const handleTradeAsset = (symbol: string) => {
    setSelectedTradeAsset(symbol);
    setActiveTab("trading");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Portfolio Top Bar */}
      <div className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-[#71717a] uppercase tracking-wider">
            Total Net Worth
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono mt-1">
            {formatUSD(netWorth)}
          </h1>
          <p className="text-xs text-[#71717a] mt-1">
            {assets.filter((a) => a.holdingAmount > 0).length} Assets in Custody • Cash Reserve:{" "}
            <strong className="text-[#00ffa3] font-mono">{formatUSD(fiatBalance)}</strong>
          </p>
        </div>

<div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
  <button
    onClick={() => setActiveTab("deposit")}
    className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-bold text-xs rounded-xl shadow-lg shadow-[#00ffa3]/20 transition-all"
  >
    <ArrowDownLeft className="w-4 h-4 shrink-0" />
    <span>Deposit</span>
  </button>
  <button
    onClick={() => setActiveTab("withdraw")}
    className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 bg-[#14141a] hover:bg-[#1e1e26] text-[#d4d4d8] font-bold text-xs rounded-xl transition-all border border-[#1c1c24]"
  >
    <ArrowUpRight className="w-4 h-4 shrink-0" />
    <span>Withdraw</span>
  </button>
  <button
    onClick={openMoveMoneyModal}
    className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 bg-[#0e0e12] hover:bg-[#181820] border border-[#1c1c24] text-[#d4d4d8] font-bold text-xs rounded-xl transition-all"
  >
    <Zap className="w-4 h-4 text-[#00ffa3] shrink-0" />
    <span>Transfer</span>
  </button>
</div>
      </div>

      {/* Asset Table Container */}
      <div className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
            <input
              type="text"
              placeholder="Search assets, symbols..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#00ffa3]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex p-1 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-xs">
            {(["all", "held", "crypto", "equity"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                  selectedFilter === filter
                    ? "bg-[#181820] text-white shadow-sm border border-[#262633]"
                    : "text-[#71717a] hover:text-[#d4d4d8]"
                }`}
              >
                {filter === "held" ? "My Holdings" : filter}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Desktop & Tablet Table (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1c1c24] text-[#71717a] font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-3">Asset</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">24h Change</th>
                <th className="pb-3">Holdings</th>
                <th className="pb-3">Total Value</th>
                <th className="pb-3 text-right pr-3">Quick Trade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1c24]/60 font-sans">
              {filtered.map((asset) => {
                const isPositive = asset.change24h >= 0;

                return (
                  <tr
                    key={asset.symbol}
                    className="hover:bg-[#0e0e12]/80 transition-colors group cursor-pointer"
                    onClick={() => handleTradeAsset(asset.symbol)}
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
                      {asset.holdingAmount > 0 ? (
                        <span className="text-[#d4d4d8] font-bold">
                          {formatHoldingAmount(asset.holdingAmount, asset.symbol)}
                        </span>
                      ) : (
                        <span className="text-[#52525b]">
                          {asset.symbol.toUpperCase() === "BTCBR" ? "0 BTCBR" : "0.00"}
                        </span>
                      )}
                    </td>

                    <td className="py-4 font-mono">
                      {asset.holdingValueUSD > 0 ? (
                        <span className="text-[#00ffa3] font-bold text-sm">
                          {formatAssetValueUSD(asset.holdingValueUSD, asset.symbol)}
                        </span>
                      ) : (
                        <span className="text-[#52525b]">
                          {asset.symbol.toUpperCase() === "BTCBR" ? "$0" : "$0.00"}
                        </span>
                      )}
                    </td>

                    <td className="py-4 text-right pr-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTradeAsset(asset.symbol);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#14141a] hover:bg-[#00ffa3] hover:text-black text-[#d4d4d8] font-semibold text-xs transition-all shadow-sm border border-[#1c1c24] group-hover:bg-[#00ffa3] group-hover:text-black group-hover:border-transparent"
                      >
                        Trade {asset.symbol}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 2. Mobile Card-per-row Layout (<md) */}
        <div className="block md:hidden space-y-3">
          {filtered.map((asset) => {
            const isPositive = asset.change24h >= 0;

            return (
              <div
                key={asset.symbol}
                onClick={() => handleTradeAsset(asset.symbol)}
                className="p-4 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] active:border-[#00ffa3]/40 transition-all space-y-3 shadow-md"
              >
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

                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-[#181820] text-xs">
                  <div className="p-2 rounded-xl bg-[#09090c] border border-[#181820]">
                    <span className="text-[10px] text-[#71717a] block">Holdings Amount</span>
                    <span className="font-mono text-white font-semibold text-[11px] block truncate">
                      {formatHoldingAmount(asset.holdingAmount, asset.symbol)}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#09090c] border border-[#181820]">
                    <span className="text-[10px] text-[#71717a] block">Holdings Value</span>
                    <span className="font-mono text-[#00ffa3] font-bold text-[11px] block">
                      {asset.holdingValueUSD > 0
                        ? formatAssetValueUSD(asset.holdingValueUSD, asset.symbol)
                        : asset.symbol.toUpperCase() === "BTCBR"
                        ? "$0"
                        : "$0.00"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTradeAsset(asset.symbol);
                  }}
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-[#14141a] hover:bg-[#00ffa3] hover:text-black text-white font-bold text-xs border border-[#22222e] transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4 text-[#00ffa3]" />
                  <span>Trade {asset.symbol}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
