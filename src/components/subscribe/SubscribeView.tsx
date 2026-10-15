import React from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import {
  Check,
  CheckCircle2,
  Crown,
  Flame,
  Radio,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useTradeStore } from "../../store/useTradeStore";

export const SubscribeView: React.FC = () => {
  const { user, upgradeToPro, addToast } = useTradeStore();

  const handleUpgrade = () => {
    upgradeToPro();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
    });
  };

  const isPro = user?.tier === "PRO";

  const tiers = [
    {
      id: "BASIC",
      name: "Apex Standard",
      price: "$0",
      period: "forever",
      desc: "Core trading terminal and standard market analytics.",
      features: [
        "Spot & Margin Trading up to 2x",
        "Standard Order Execution",
        "Basic Chart Indicators (RSI/MACD)",
        "0.10% Taker / 0.05% Maker Fee",
        "Community Discord Support",
      ],
      isPopular: false,
    },
    {
      id: "PRO",
      name: "Apex Institutional PRO",
      price: "$99",
      period: "per month",
      desc: "Sub-millisecond execution, AI alpha signals & zero maker fees.",
      features: [
        "0.00% Zero Maker Fees (Lifetime Promo)",
        "Full 3x Institutional Margin Leverage",
        "Exclusive Quant & AI Alpha Signals Feed",
        "Level 2 Orderbook Deep Liquidity View",
        "Multi-Sig Cold Storage 24h Vault Access",
        "Apex Black Obsidian Metal Visa Card (3.5% Cashback)",
        "Dedicated VIP Account Manager & Direct FIX API",
      ],
      isPopular: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30 text-xs font-bold">
          <Crown className="w-4 h-4 text-[#00ffa3]" />
          <span>Membership Tiers</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Supercharge Your Edge with Apex PRO
        </h1>
        <p className="text-xs sm:text-sm text-[#71717a] max-w-xl mx-auto">
          Get ultra-low latency execution, proprietary quant trading signals, and zero maker fees across all pairs.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tiers.map((tier) => {
          const isSelected = tier.id === "PRO" ? isPro : !isPro;

          return (
            <div
              key={tier.id}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative shadow-2xl transition-all ${
                tier.isPopular
                  ? "bg-[#0d0d12] border-2 border-[#00ffa3]/40 shadow-2xl shadow-[#00ffa3]/5"
                  : "bg-[#0a0a0e] border border-[#1c1c24] text-[#d4d4d8]"
              }`}
            >
              {tier.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#00ffa3] text-black shadow-md">
                  Most Popular for Serious Traders
                </span>
              )}

              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                    <p className="text-xs text-[#71717a] mt-1">{tier.desc}</p>
                  </div>
                  {tier.id === "PRO" && <Crown className="w-6 h-6 text-[#00ffa3]" />}
                </div>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-mono">{tier.price}</span>
                  <span className="text-xs text-[#71717a] font-medium">/{tier.period}</span>
                </div>

                <div className="mt-6 space-y-3 pt-6 border-t border-[#1c1c24]">
                  <span className="text-[11px] uppercase font-bold text-[#71717a] tracking-wider">
                    Included Features:
                  </span>
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          tier.isPopular ? "text-[#00ffa3]" : "text-[#71717a]"
                        }`}
                      />
                      <span className="text-[#d4d4d8]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                {tier.id === "PRO" ? (
                  isPro ? (
                    <div className="w-full py-3 text-center text-xs font-bold text-[#00ffa3] bg-[#00ffa3]/10 border border-[#00ffa3]/30 rounded-2xl">
                      ✓ Active PRO Membership
                    </div>
                  ) : (
                    <button
                      onClick={handleUpgrade}
                      className="w-full py-3.5 px-4 bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-black rounded-2xl text-sm shadow-xl shadow-[#00ffa3]/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 fill-black" />
                      <span>Upgrade to Apex PRO (Instant Demo)</span>
                    </button>
                  )
                ) : (
                  <div className="w-full py-3 text-center text-xs font-bold text-[#71717a] bg-[#0e0e12] rounded-2xl border border-[#1c1c24]">
                    Included by Default
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
