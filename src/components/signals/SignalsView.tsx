import React from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Flame,
  Radio,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useTradeStore } from "../../store/useTradeStore";
import { formatUSD } from "../../lib/utils";
import { AssetIcon } from "../ui/AssetIcon";

export const SignalsView: React.FC = () => {
  const { signals, setSelectedTradeAsset, setActiveTab, addToast } = useTradeStore();

  const handleExecuteSignal = (symbol: string) => {
    setSelectedTradeAsset(symbol);
    setActiveTab("trading");
    addToast("Signal Preloaded", `Prepared trade setup for ${symbol}. Review parameters in terminal.`, "info");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-[#00ffa3]/15 text-[#00ffa3]">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-[#00ffa3] uppercase tracking-wider">
              Quant & AI Alpha Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Institutional Trade Signals
          </h1>
          <p className="text-xs text-[#71717a] mt-1">
            Real-time algorithmic breakout detection with high statistical edge and multi-timeframe confirmation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00ffa3] animate-pulse" />
            Live Feed (89.4% Winrate)
          </span>
        </div>
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {signals.map((signal) => {
          const isStrongBuy = signal.action === "STRONG_BUY";
          const isBuy = signal.action === "BUY";
          const isSell = signal.action === "SELL" || signal.action === "STRONG_SELL";

          return (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-[#262633] transition-all group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <AssetIcon
                      symbol={signal.symbol}
                      name={signal.name}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-[#00ffa3] transition-colors">
                        {signal.name} ({signal.symbol})
                      </h3>
                      <div className="text-[11px] text-[#71717a] font-mono">
                        Timeframe: {signal.timeframe} • {signal.timestamp}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-xl uppercase tracking-wider ${
                      isStrongBuy
                        ? "bg-[#00ffa3] text-black shadow-md shadow-[#00ffa3]/20"
                        : isBuy
                        ? "bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30"
                        : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {signal.action.replace("_", " ")}
                  </span>
                </div>

                {/* Confidence Bar */}
                <div className="mt-4 p-3 rounded-2xl bg-[#0e0e12] border border-[#1c1c24]">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#71717a] font-medium">Algorithmic Confidence</span>
                    <span className="text-[#00ffa3] font-bold font-mono">{signal.confidence}%</span>
                  </div>
                  <div className="w-full bg-[#181820] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#00ffa3] to-teal-400 h-full rounded-full"
                      style={{ width: `${signal.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Rationale */}
                <p className="text-xs text-[#d4d4d8] mt-3 leading-relaxed">
                  {signal.rationale}
                </p>

                {/* Indicator Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {signal.indicators.map((ind, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#0e0e12] border border-[#1c1c24] text-[#71717a]"
                    >
                      {ind}
                    </span>
                  ))}
                </div>

                {/* Key Price Levels */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-[#0e0e12] border border-[#1c1c24]">
                    <span className="text-[10px] text-[#71717a] block uppercase font-bold">Entry Zone</span>
                    <span className="text-[#d4d4d8] font-bold">${signal.entryPrice.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0e0e12] border border-[#1c1c24]">
                    <span className="text-[10px] text-[#00ffa3] block uppercase font-bold">Target</span>
                    <span className="text-[#00ffa3] font-bold">${signal.targetPrice.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0e0e12] border border-[#1c1c24]">
                    <span className="text-[10px] text-rose-500 block uppercase font-bold">Stop Loss</span>
                    <span className="text-rose-400 font-bold">${signal.stopLossPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleExecuteSignal(signal.symbol)}
                className="w-full py-3 px-4 bg-[#14141a] hover:bg-[#00ffa3] hover:text-black text-[#d4d4d8] font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 group-hover:bg-[#00ffa3] group-hover:text-black shadow-md border border-[#1c1c24] group-hover:border-transparent"
              >
                <span>Execute Signal Trade</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
