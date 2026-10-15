import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  Activity,
  AlertCircle,
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  CandlestickChart,
  CheckCircle2,
  ChevronDown,
  Flame,
  HelpCircle,
  Info,
  Layers,
  Maximize2,
  Percent,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useTradeStore } from "../../store/useTradeStore";
import { formatPercent, formatTimestamp, formatUSD } from "../../lib/utils";
import { Asset, OrderSide, OrderType, TradePosition } from "../../types";
import { AssetIcon } from "../ui/AssetIcon";

export const TradingTerminal: React.FC = () => {
  const {
    assets,
    positions,
    fiatBalance,
    selectedTradeAsset,
    setSelectedTradeAsset,
    placeTrade,
    closePosition,
    addToast,
  } = useTradeStore();

  const currentAsset = assets.find((a) => a.symbol === selectedTradeAsset) || assets[0];

  // Trading form state
  const [orderSide, setOrderSide] = useState<OrderSide>("BUY");
  const [orderType, setOrderType] = useState<OrderType>("MARKET");
  const [tradeAmountUSD, setTradeAmountUSD] = useState<number>(1000);
  const [leverage, setLeverage] = useState<number>(2); // 1x to 3x capped
  const [duration, setDuration] = useState<string>("Perpetual");
  const [limitPrice, setLimitPrice] = useState<number>(currentAsset.price);
  const [takeProfit, setTakeProfit] = useState<string>("");
  const [stopLoss, setStopLoss] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState<"OPEN" | "CLOSED" | "ALL" | "SWAPS">("OPEN");

  // Search filter for assets
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [assetSearchQuery, setAssetSearchQuery] = useState("");
  const [chartTimeframe, setChartTimeframe] = useState<string>("1H");
  const [isMobileOrderSheetOpen, setIsMobileOrderSheetOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Body scroll locking when mobile order sheet is open
  useEffect(() => {
    if (isMobileOrderSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOrderSheetOpen]);

  // Sync limit price when asset changes
  useEffect(() => {
    setLimitPrice(currentAsset.price);
  }, [currentAsset.symbol]);

  // Derived Trade calculations
  const effectiveCapital = tradeAmountUSD * leverage;
  const estimatedUnits = effectiveCapital / (orderType === "LIMIT" && limitPrice > 0 ? limitPrice : currentAsset.price);
  const liquidationPrice = orderSide === "BUY"
    ? currentAsset.price * (1 - 0.9 / leverage)
    : currentAsset.price * (1 + 0.9 / leverage);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tradeAmountUSD <= 0) {
      addToast("Invalid Amount", "Please enter an amount greater than $0.", "error");
      return;
    }
    if (tradeAmountUSD > fiatBalance) {
      addToast("Insufficient Balance", "Amount exceeds available USD cash.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await placeTrade({
        symbol: currentAsset.symbol,
        side: orderSide,
        orderType,
        amount: tradeAmountUSD,
        leverage,
        duration,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      });

      setIsMobileOrderSheetOpen(false);

      // Fire celebratory confetti!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err: any) {
      addToast("Order Error", err.message || "Failed to execute order.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPercent = (pct: number) => {
    const calculated = Math.floor((fiatBalance * pct) / 100);
    setTradeAmountUSD(Math.max(10, calculated));
  };

  // Filter positions
  const filteredPositions = positions.filter((p) => {
    if (activeHistoryTab === "OPEN") return p.status === "OPEN";
    if (activeHistoryTab === "CLOSED") return p.status === "CLOSED";
    return true;
  });

  const searchedAssets = assets.filter(
    (a) =>
      a.symbol.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(assetSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header / Asset Stats Bar */}
      <div className="rounded-2xl bg-[#0a0a0e] border border-[#1c1c24] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3 relative">
          {/* Asset Selector Dropdown Trigger */}
          <button
            onClick={() => setIsAssetPickerOpen(!isAssetPickerOpen)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0e0e12] hover:bg-[#181820] border border-[#1c1c24] hover:border-[#262633] transition-all text-left"
          >
            <AssetIcon
              symbol={currentAsset.symbol}
              name={currentAsset.name}
              size="sm"
            />
            <div>
              <div className="text-xs font-extrabold text-white flex items-center gap-1">
                <span>{currentAsset.symbol}/USD</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#71717a]" />
              </div>
              <div className="text-[10px] text-[#71717a] truncate">{currentAsset.name}</div>
            </div>
          </button>

          {/* Asset Picker Menu Dropdown */}
          {isAssetPickerOpen && (
            <div className="absolute top-14 left-0 w-72 rounded-2xl bg-[#09090c] border border-[#1c1c24] shadow-2xl p-3 z-50">
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717a]" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={assetSearchQuery}
                  onChange={(e) => setAssetSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#0e0e12] border border-[#1c1c24] rounded-lg text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#00ffa3]"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                {searchedAssets.map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => {
                      setSelectedTradeAsset(asset.symbol);
                      setIsAssetPickerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                      asset.symbol === currentAsset.symbol
                        ? "bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/30"
                        : "hover:bg-[#121217] text-[#d4d4d8]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AssetIcon
                        symbol={asset.symbol}
                        name={asset.name}
                        size="xs"
                      />
                      <div className="text-left">
                        <div className="font-bold text-white">{asset.symbol}</div>
                        <div className="text-[10px] text-[#71717a]">{asset.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-white">{formatUSD(asset.price)}</div>
                      <div className={`text-[10px] font-mono ${asset.change24h >= 0 ? "text-[#00ffa3]" : "text-rose-400"}`}>
                        {formatPercent(asset.change24h)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Price Tag */}
          <div className="border-l border-[#1c1c24] pl-3">
            <div className="text-lg font-extrabold text-white font-mono flex items-center gap-2">
              <span>{formatUSD(currentAsset.price)}</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  currentAsset.change24h >= 0
                    ? "bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/25"
                    : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                }`}
              >
                {formatPercent(currentAsset.change24h)}
              </span>
            </div>
          </div>
        </div>

        {/* 24h Stats Ribbon */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono">
          <div>
            <div className="text-[10px] text-[#71717a] uppercase font-semibold">24h High</div>
            <div className="text-[#f5f5f5] font-bold">${currentAsset.high24h.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#71717a] uppercase font-semibold">24h Low</div>
            <div className="text-[#f5f5f5] font-bold">${currentAsset.low24h.toLocaleString()}</div>
          </div>
          <div className="hidden sm:block">
            <div className="text-[10px] text-[#71717a] uppercase font-semibold">24h Volume</div>
            <div className="text-[#f5f5f5] font-bold">${(currentAsset.volume24h / 1e9).toFixed(2)}B</div>
          </div>
          <div className="hidden md:block">
            <div className="text-[10px] text-[#71717a] uppercase font-semibold">Execution Engine</div>
            <div className="text-[#00ffa3] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] animate-pulse" />
              Institutional 0ms
            </div>
          </div>
        </div>
      </div>

      {/* Main Terminal Body: Chart + Orderbook + Trade Execution Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Interactive Trading Chart & Orderbook */}
        <div className="lg:col-span-8 space-y-4">
          {/* Chart Container */}
          <div className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] overflow-hidden shadow-2xl flex flex-col h-[460px]">
            {/* Chart Toolbar */}
<div className="px-4 py-2.5 bg-[#0e0e12] border-b border-[#1c1c24] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
    {["1M", "5M", "15M", "1H", "4H", "1D", "1W"].map((tf) => (
      <button
        key={tf}
        onClick={() => setChartTimeframe(tf)}
        className={`px-2 py-1 rounded-lg font-bold transition-all shrink-0 ${
          chartTimeframe === tf
            ? "bg-[#181820] text-[#00ffa3] shadow-sm border border-[#262633]"
            : "text-[#71717a] hover:text-[#d4d4d8]"
        }`}
      >
        {tf}
      </button>
    ))}
  </div>

  <div className="flex items-center gap-3 text-[#71717a] text-[11px] font-mono">
    <span className="hidden lg:inline">Indicators: RSI (14), EMA (20/50/200), MACD</span>
    <span className="flex items-center gap-1.5 text-[#00ffa3] font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] animate-pulse" />
      <span className="hidden sm:inline">TradingView Real-Time Feed</span>
      <span className="sm:hidden">Live</span>
    </span>
  </div>
</div>
            {/* Embedded TradingView Iframe Widget */}
            <div className="flex-1 w-full bg-[#050505] relative overflow-hidden" ref={containerRef}>
              <iframe
                title="TradingView Interactive Terminal"
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(
                  currentAsset.tradingViewSymbol
                )}&interval=${chartTimeframe === "1D" ? "D" : chartTimeframe === "4H" ? "240" : "60"}&hidesidetoolbar=0&symboledit=0&saveimage=0&toolbarbg=050505&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%22mainSeriesProperties.candleStyle.upColor%22%3A%22%2300ffa3%22%2C%22mainSeriesProperties.candleStyle.downColor%22%3A%22%23f43f5e%22%2C%22mainSeriesProperties.candleStyle.drawWick%22%3Atrue%2C%22mainSeriesProperties.candleStyle.drawBorder%22%3Atrue%2C%22mainSeriesProperties.candleStyle.borderColor%22%3A%22%2300ffa3%22%2C%22mainSeriesProperties.candleStyle.borderUpColor%22%3A%22%2300ffa3%22%2C%22mainSeriesProperties.candleStyle.borderDownColor%22%3A%22%23f43f5e%22%2C%22mainSeriesProperties.candleStyle.wickUpColor%22%3A%22%2300ffa3%22%2C%22mainSeriesProperties.candleStyle.wickDownColor%22%3A%22%23f43f5e%22%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=apextrade.io`}
                className="w-full h-full border-0"
              />
            </div>
          </div>

          {/* Level 2 Orderbook Preview & Depth Strip */}
          <div className="rounded-2xl bg-[#0a0a0e] border border-[#1c1c24] p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#00ffa3]" />
                Level 2 Order Book Depth
              </span>
              <span className="text-[10px] text-[#71717a] font-mono">Spread: $0.10 (0.001%)</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px] font-mono">
              {/* Bids (Green) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[#71717a] text-[10px] uppercase font-bold">
                  <span>Bid Price ($)</span>
                  <span>Size ({currentAsset.symbol})</span>
                </div>
                {[
                  { price: currentAsset.price * 0.9998, size: 2.45, depth: 85 },
                  { price: currentAsset.price * 0.9995, size: 5.12, depth: 70 },
                  { price: currentAsset.price * 0.9990, size: 12.80, depth: 95 },
                ].map((bid, i) => (
                  <div key={i} className="relative flex justify-between py-0.5 px-2 rounded overflow-hidden">
                    <div
                      className="absolute inset-0 bg-[#00ffa3]/10"
                      style={{ width: `${bid.depth}%` }}
                    />
                    <span className="relative text-[#00ffa3] font-bold">${bid.price.toFixed(2)}</span>
                    <span className="relative text-[#d4d4d8]">{bid.size.toFixed(3)}</span>
                  </div>
                ))}
              </div>

              {/* Asks (Red) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[#71717a] text-[10px] uppercase font-bold">
                  <span>Ask Price ($)</span>
                  <span>Size ({currentAsset.symbol})</span>
                </div>
                {[
                  { price: currentAsset.price * 1.0002, size: 1.88, depth: 65 },
                  { price: currentAsset.price * 1.0006, size: 4.40, depth: 75 },
                  { price: currentAsset.price * 1.0011, size: 9.32, depth: 90 },
                ].map((ask, i) => (
                  <div key={i} className="relative flex justify-between py-0.5 px-2 rounded overflow-hidden">
                    <div
                      className="absolute inset-0 bg-rose-500/10"
                      style={{ width: `${ask.depth}%` }}
                    />
                    <span className="relative text-rose-400 font-bold">${ask.price.toFixed(2)}</span>
                    <span className="relative text-[#d4d4d8]">{ask.size.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Institutional Order Execution Form (Desktop/Tablet lg+) */}
        <div className="hidden lg:block lg:col-span-4 rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-5 sm:p-6 shadow-2xl">
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            {/* Long / Short Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#0e0e12] border border-[#1c1c24] rounded-2xl">
              <button
                type="button"
                onClick={() => setOrderSide("BUY")}
                className={`min-h-[44px] py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  orderSide === "BUY"
                    ? "bg-gradient-to-r from-[#00ffa3] to-teal-400 text-black shadow-lg shadow-[#00ffa3]/20"
                    : "text-[#71717a] hover:text-[#d4d4d8]"
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>BUY / LONG</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderSide("SELL")}
                className={`min-h-[44px] py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  orderSide === "SELL"
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                    : "text-[#71717a] hover:text-[#d4d4d8]"
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>SELL / SHORT</span>
              </button>
            </div>

            {/* Order Type Toggle */}
            <div className="flex p-1 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-xs">
              {(["MARKET", "LIMIT", "STOP_LOSS"] as OrderType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`flex-1 min-h-[36px] py-1.5 font-bold rounded-lg transition-all ${
                    orderType === type
                      ? "bg-[#181820] text-white shadow-sm border border-[#262633]"
                      : "text-[#71717a] hover:text-[#d4d4d8]"
                  }`}
                >
                  {type.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Limit Price Input (if applicable) */}
            {orderType !== "MARKET" && (
              <div>
                <label className="block text-xs font-bold text-[#d4d4d8] mb-1">
                  {orderType === "LIMIT" ? "Limit Price (USD)" : "Stop Trigger Price (USD)"}
                </label>
                <input
                  type="number"
                  step="any"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-sm font-mono text-white focus:outline-none focus:border-[#00ffa3]"
                />
              </div>
            )}

            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#d4d4d8]">Investment Margin</span>
                <span className="text-[#71717a] font-mono">
                  Avail: <strong className="text-[#00ffa3]">{formatUSD(fiatBalance)}</strong>
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a] font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  max={fiatBalance}
                  value={tradeAmountUSD || ""}
                  onChange={(e) => setTradeAmountUSD(parseFloat(e.target.value) || 0)}
                  placeholder="1000"
                  className="w-full min-h-[44px] pl-8 pr-16 py-2.5 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-[#00ffa3]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#71717a]">
                  USD
                </span>
              </div>

              {/* Quick % Buttons */}
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleQuickPercent(pct)}
                    className="min-h-[36px] py-1 text-[11px] font-bold bg-[#0e0e12] hover:bg-[#181820] text-[#d4d4d8] rounded-lg border border-[#1c1c24] hover:border-[#262633] transition-all font-mono"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Leverage Slider (Capped 1x - 3x as per requirement) */}
            <div className="p-3.5 rounded-2xl bg-[#0e0e12] border border-[#1c1c24]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1 text-[#d4d4d8] font-bold">
                  <span>Leverage Multiplier</span>
                  <span className="text-[10px] text-[#00ffa3] bg-[#00ffa3]/10 px-1.5 py-0.2 rounded border border-[#00ffa3]/20">
                    Safe Cap (1x - 3x)
                  </span>
                </div>
                <span className="text-sm font-black text-white font-mono">{leverage}x</span>
              </div>

              <input
                type="range"
                min="1"
                max="3"
                step="0.5"
                value={leverage}
                onChange={(e) => setLeverage(parseFloat(e.target.value))}
                className="w-full accent-[#00ffa3] h-2 bg-[#181820] rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-[#71717a] font-mono mt-1">
                <span>1x (Spot 1:1)</span>
                <span>2x (Standard)</span>
                <span>3x (Max Margin)</span>
              </div>
            </div>

            {/* Take Profit & Stop Loss */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#71717a] mb-1">Take Profit ($)</label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-2 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#00ffa3]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#71717a] mb-1">Stop Loss ($)</label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-2 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Order Summary Specs Breakdown */}
            <div className="p-3.5 rounded-2xl bg-[#070709] border border-[#1c1c24] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#71717a]">
                <span>Position Value</span>
                <span className="text-white font-bold">{formatUSD(effectiveCapital)}</span>
              </div>
              <div className="flex justify-between text-[#71717a]">
                <span>Estimated Size</span>
                <span className="text-white font-bold">
                  {estimatedUnits.toFixed(4)} {currentAsset.symbol}
                </span>
              </div>
              <div className="flex justify-between text-[#71717a]">
                <span>Est. Liq Price</span>
                <span className="text-amber-400 font-bold">${liquidationPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#71717a]">
                <span>Execution Fee</span>
                <span className="text-[#00ffa3] font-bold">$0.00 (PRO 0% Maker)</span>
              </div>
            </div>

            {/* Place Trade Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || tradeAmountUSD <= 0 || tradeAmountUSD > fiatBalance}
              className={`w-full min-h-[48px] py-3.5 px-4 font-black rounded-2xl text-sm shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${
                orderSide === "BUY"
                  ? "bg-gradient-to-r from-[#00ffa3] to-teal-400 hover:from-[#00ffa3]/90 hover:to-teal-300 text-black shadow-[#00ffa3]/20"
                  : "bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 text-white shadow-rose-500/20"
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    Place {orderSide === "BUY" ? "Long" : "Short"} Order ({leverage}x)
                  </span>
                  <Zap className="w-4 h-4 fill-current" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Floating Action Button / Quick Bar (lg:hidden) */}
      <div className="block lg:hidden rounded-2xl bg-[#0a0a0e] border border-[#1c1c24] p-4 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-[#71717a] font-mono">Current Price</div>
            <div className="font-mono font-bold text-white text-base">{formatUSD(currentAsset.price)}</div>
          </div>
          <button
            onClick={() => setIsMobileOrderSheetOpen(true)}
            className="flex-1 min-h-[48px] px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00ffa3] to-teal-400 text-black font-extrabold text-sm shadow-lg shadow-[#00ffa3]/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Open Order Panel</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Sheet Modal for Order Placement */}
      <AnimatePresence>
        {isMobileOrderSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOrderSheetOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Slide-Up Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative w-full max-h-[85vh] overflow-y-auto bg-[#0a0a0e] border-t border-[#1c1c24] rounded-t-3xl p-5 shadow-2xl z-10 space-y-4"
            >
              {/* Sheet Drag Pill & Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#1c1c24]">
                <div className="flex items-center gap-2.5">
                  <AssetIcon symbol={currentAsset.symbol} name={currentAsset.name} size="sm" />
                  <div>
                    <h3 className="font-bold text-sm text-white">Trade {currentAsset.name}</h3>
                    <span className="text-[11px] text-[#00ffa3] font-mono font-bold">{formatUSD(currentAsset.price)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileOrderSheetOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#14141a] text-[#71717a] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bottom Sheet Form */}
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {/* Long / Short Tabs */}
                <div className="grid grid-cols-2 p-1 bg-[#0e0e12] border border-[#1c1c24] rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setOrderSide("BUY")}
                    className={`min-h-[44px] py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      orderSide === "BUY"
                        ? "bg-gradient-to-r from-[#00ffa3] to-teal-400 text-black shadow-lg shadow-[#00ffa3]/20"
                        : "text-[#71717a] hover:text-[#d4d4d8]"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>BUY / LONG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderSide("SELL")}
                    className={`min-h-[44px] py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      orderSide === "SELL"
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                        : "text-[#71717a] hover:text-[#d4d4d8]"
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>SELL / SHORT</span>
                  </button>
                </div>

                {/* Order Type Toggle */}
                <div className="flex p-1 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-xs">
                  {(["MARKET", "LIMIT", "STOP_LOSS"] as OrderType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOrderType(type)}
                      className={`flex-1 min-h-[36px] py-1.5 font-bold rounded-lg transition-all ${
                        orderType === type
                          ? "bg-[#181820] text-white shadow-sm border border-[#262633]"
                          : "text-[#71717a] hover:text-[#d4d4d8]"
                      }`}
                    >
                      {type.replace("_", " ")}
                    </button>
                  ))}
                </div>

                {/* Limit Price Input */}
                {orderType !== "MARKET" && (
                  <div>
                    <label className="block text-xs font-bold text-[#d4d4d8] mb-1">
                      {orderType === "LIMIT" ? "Limit Price (USD)" : "Stop Trigger Price (USD)"}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-sm font-mono text-white focus:outline-none focus:border-[#00ffa3]"
                    />
                  </div>
                )}

                {/* Amount Input */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#d4d4d8]">Investment Margin</span>
                    <span className="text-[#71717a] font-mono">
                      Avail: <strong className="text-[#00ffa3]">{formatUSD(fiatBalance)}</strong>
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a] font-bold">$</span>
                    <input
                      type="number"
                      min="1"
                      max={fiatBalance}
                      value={tradeAmountUSD || ""}
                      onChange={(e) => setTradeAmountUSD(parseFloat(e.target.value) || 0)}
                      placeholder="1000"
                      className="w-full min-h-[44px] pl-8 pr-16 py-2.5 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-[#00ffa3]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#71717a]">
                      USD
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleQuickPercent(pct)}
                        className="min-h-[36px] py-1 text-[11px] font-bold bg-[#0e0e12] hover:bg-[#181820] text-[#d4d4d8] rounded-lg border border-[#1c1c24] font-mono"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leverage Slider */}
                <div className="p-3.5 rounded-2xl bg-[#0e0e12] border border-[#1c1c24]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1 text-[#d4d4d8] font-bold">
                      <span>Leverage Multiplier</span>
                      <span className="text-[10px] text-[#00ffa3] bg-[#00ffa3]/10 px-1.5 py-0.2 rounded">
                        Cap 1x - 3x
                      </span>
                    </div>
                    <span className="text-sm font-black text-white font-mono">{leverage}x</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.5"
                    value={leverage}
                    onChange={(e) => setLeverage(parseFloat(e.target.value))}
                    className="w-full accent-[#00ffa3] h-2 bg-[#181820] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Specs */}
                <div className="p-3.5 rounded-2xl bg-[#070709] border border-[#1c1c24] space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-[#71717a]">
                    <span>Position Value</span>
                    <span className="text-white font-bold">{formatUSD(effectiveCapital)}</span>
                  </div>
                  <div className="flex justify-between text-[#71717a]">
                    <span>Est. Liq Price</span>
                    <span className="text-amber-400 font-bold">${liquidationPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || tradeAmountUSD <= 0 || tradeAmountUSD > fiatBalance}
                  className={`w-full min-h-[48px] py-3.5 px-4 font-black rounded-2xl text-sm shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${
                    orderSide === "BUY"
                      ? "bg-gradient-to-r from-[#00ffa3] to-teal-400 text-black shadow-[#00ffa3]/20"
                      : "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-rose-500/20"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Place {orderSide === "BUY" ? "Long" : "Short"} Order ({leverage}x)</span>
                      <Zap className="w-4 h-4 fill-current" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trade History & Active Positions Section */}
      <div className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1c1c24]">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Active Positions & Orders</h3>
            <p className="text-xs text-[#71717a]">Real-time dynamic P&L tracking with instant execution settlement</p>
          </div>

          {/* History Tabs */}
          <div className="flex p-1 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-xs">
            <button
              onClick={() => setActiveHistoryTab("OPEN")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeHistoryTab === "OPEN"
                  ? "bg-[#181820] text-[#00ffa3] shadow-sm"
                  : "text-[#71717a] hover:text-[#d4d4d8]"
              }`}
            >
              Open ({positions.filter((p) => p.status === "OPEN").length})
            </button>
            <button
              onClick={() => setActiveHistoryTab("CLOSED")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeHistoryTab === "CLOSED"
                  ? "bg-[#181820] text-white shadow-sm"
                  : "text-[#71717a] hover:text-[#d4d4d8]"
              }`}
            >
              Closed Trades
            </button>
            <button
              onClick={() => setActiveHistoryTab("ALL")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeHistoryTab === "ALL"
                  ? "bg-[#181820] text-white shadow-sm"
                  : "text-[#71717a] hover:text-[#d4d4d8]"
              }`}
            >
              All Activity
            </button>
          </div>
        </div>

        {/* Positions Table (Desktop md+) */}
        <div className="hidden md:block overflow-x-auto">
          {filteredPositions.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#71717a]">
              No positions found under this filter. Open a trade to see live P&L.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1c1c24] text-[#71717a] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Position</th>
                  <th className="pb-3">Size / Units</th>
                  <th className="pb-3">Entry Price</th>
                  <th className="pb-3">Mark Price</th>
                  <th className="pb-3">Liq. Price</th>
                  <th className="pb-3">Unrealized P&L</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1c24]/60 font-mono">
                {filteredPositions.map((pos) => {
                  const isLong = pos.side === "BUY";
                  const isProfit = pos.pnlUSD >= 0;

                  return (
                    <tr key={pos.id} className="hover:bg-[#121217] transition-colors">
                      <td className="py-4 pl-2 font-sans">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                              isLong
                                ? "bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/25"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            }`}
                          >
                            {isLong ? "LONG" : "SHORT"} {pos.leverage}x
                          </span>
                          <div>
                            <div className="font-bold text-sm text-white">{pos.symbol}/USD</div>
                            <div className="text-[10px] text-[#71717a]">{pos.duration}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4">
                        <div className="text-white font-bold">{formatUSD(pos.amount * pos.leverage)}</div>
                        <div className="text-[11px] text-[#71717a]">
                          {pos.units} {pos.symbol}
                        </div>
                      </td>

                      <td className="py-4 text-[#d4d4d8]">${pos.entryPrice.toLocaleString()}</td>

                      <td className="py-4 text-white font-bold">
                        ${pos.currentPrice.toLocaleString()}
                      </td>

                      <td className="py-4 text-amber-400">
                        {pos.liquidationPrice > 0 ? `$${pos.liquidationPrice.toLocaleString()}` : "None"}
                      </td>

                      <td className="py-4">
                        <div className={`font-bold text-sm ${isProfit ? "text-[#00ffa3]" : "text-rose-400"}`}>
                          {isProfit ? "+" : ""}${pos.pnlUSD.toFixed(2)} ({isProfit ? "+" : ""}
                          {pos.pnlPercent.toFixed(2)}%)
                        </div>
                      </td>

                      <td className="py-4 text-right pr-2 font-sans">
                        {pos.status === "OPEN" ? (
                          <button
                            onClick={() => closePosition(pos.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#14141a] hover:bg-rose-500 hover:text-white text-[#d4d4d8] font-bold text-xs transition-all shadow-sm border border-[#1c1c24]"
                          >
                            Close Position
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#0e0e12] text-[#71717a] border border-[#1c1c24]">
                            SETTLED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Positions Cards (<md) */}
        <div className="block md:hidden space-y-3">
          {filteredPositions.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#71717a]">
              No positions found under this filter. Open a trade to see live P&L.
            </div>
          ) : (
            filteredPositions.map((pos) => {
              const isLong = pos.side === "BUY";
              const isProfit = pos.pnlUSD >= 0;

              return (
                <div key={pos.id} className="p-4 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{pos.symbol}/USD</span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            isLong
                              ? "bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/25"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {isLong ? "LONG" : "SHORT"} {pos.leverage}x
                        </span>
                      </div>
                      <span className="text-[10px] text-[#71717a] font-mono">{pos.duration}</span>
                    </div>

                    <div className="text-right">
                      <div className={`font-bold font-mono text-sm ${isProfit ? "text-[#00ffa3]" : "text-rose-400"}`}>
                        {isProfit ? "+" : ""}${pos.pnlUSD.toFixed(2)}
                      </div>
                      <span className="text-[10px] font-mono text-[#71717a]">
                        ({isProfit ? "+" : ""}{pos.pnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#181820] text-xs font-mono">
                    <div className="p-2 rounded-xl bg-[#09090c] border border-[#181820]">
                      <span className="text-[10px] text-[#71717a] block">Position Size</span>
                      <span className="text-white font-bold text-[11px] block">{formatUSD(pos.amount * pos.leverage)}</span>
                      <span className="text-[#71717a] text-[10px] block">{pos.units} {pos.symbol}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#09090c] border border-[#181820]">
                      <span className="text-[10px] text-[#71717a] block">Entry / Mark</span>
                      <span className="text-white font-bold text-[11px] block">${pos.entryPrice.toLocaleString()}</span>
                      <span className="text-[#00ffa3] text-[10px] block">Now: ${pos.currentPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {pos.status === "OPEN" && (
                    <button
                      onClick={() => closePosition(pos.id)}
                      className="w-full min-h-[44px] py-2.5 rounded-xl bg-[#14141a] hover:bg-rose-500 hover:text-white text-[#d4d4d8] font-bold text-xs border border-[#22222e] transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      <span>Close Position</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
