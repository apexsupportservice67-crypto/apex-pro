import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CreditCard,
  Eye,
  EyeOff,
  Flame,
  Globe2,
  Lock,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Snowflake,
  Sparkles,
  Zap,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useTradeStore } from "../../store/useTradeStore";
import { formatUSD } from "../../lib/utils";
import { DebitCard } from "../../types";

export const CardsView: React.FC = () => {
  const { cards, toggleFreezeCard, updateCardLimit, orderNewCard, user } = useTradeStore();
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || "");
  const [showCardNumber, setShowCardNumber] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingType, setProcessingType] = useState<"PHYSICAL" | "VIRTUAL">("PHYSICAL");
  const [processingStep, setProcessingStep] = useState<string>("Authenticating account credentials...");

  // Keep selected card synced if list changes
  const activeCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const handleRequestCard = async (type: "PHYSICAL" | "VIRTUAL") => {
    setProcessingType(type);
    setIsProcessing(true);
    setProcessingStep("Verifying institutional account tier...");

    await new Promise((r) => setTimeout(r, 450));
    setProcessingStep(`Issuing encrypted ${type === "PHYSICAL" ? "Black Metal Obsidian" : "Digital Cloud"} EMV token...`);

    await new Promise((r) => setTimeout(r, 550));
    setProcessingStep("Registering cardholder with Visa Institutional Network...");

    await new Promise((r) => setTimeout(r, 400));
    orderNewCard(type);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-[#00ffa3]/15 text-[#00ffa3]">
              <CreditCard className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-[#00ffa3] uppercase tracking-wider">
              Apex Obsidian Visa Cards
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Institutional Debit & Spending
          </h1>
          <p className="text-xs text-[#71717a] mt-1">
            Spend fiat or crypto instantly anywhere Visa is accepted with 3.5% auto-reinvested cashback.
          </p>
        </div>

        {cards.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRequestCard("VIRTUAL")}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl bg-[#14141a] hover:bg-[#1e1e26] text-[#d4d4d8] font-bold text-xs transition-all border border-[#1c1c24] disabled:opacity-50"
            >
              + New Virtual
            </button>
            <button
              onClick={() => handleRequestCard("PHYSICAL")}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              + Order Metal Card
            </button>
          </div>
        )}
      </div>

      {/* Processing Request Modal Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0e0e14] border border-[#22222e] rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6"
            >
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-[#00ffa3]/20 border-t-[#00ffa3] animate-spin" />
                <CreditCard className="w-7 h-7 text-[#00ffa3]" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white">Processing Card Request</h3>
                <p className="text-xs text-[#71717a] mt-1.5 font-mono">
                  Cardholder: <span className="text-white font-bold">{user?.name || "Account Holder"}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#09090c] border border-[#1c1c24] text-left space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-[#00ffa3]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#00ffa3]" />
                  <span className="font-semibold">{processingStep}</span>
                </div>
                <div className="w-full bg-[#181820] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#00ffa3] h-full rounded-full animate-pulse w-3/4" />
                </div>
              </div>

              <p className="text-[11px] text-[#71717a]">
                Issuing your {processingType === "PHYSICAL" ? "Black Obsidian Metal" : "Pro Digital Virtual"} Visa card with instant contactless enablement.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State: No Cards Yet */}
      {cards.length === 0 ? (
        <div className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-8 sm:p-12 shadow-2xl text-center space-y-8">
          {/* Card Silhouette Graphic */}
          <div className="relative mx-auto max-w-sm h-48 sm:h-52 rounded-2xl border-2 border-dashed border-[#262633] bg-gradient-to-b from-[#121218]/50 to-[#07070a]/80 p-6 flex flex-col justify-between text-left overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#71717a]">
                <div className="w-7 h-7 rounded-lg bg-[#181822] flex items-center justify-center text-xs font-bold text-[#52525b]">
                  ▲
                </div>
                <span className="font-mono text-xs tracking-wider">APEX OBSIDIAN</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1c1c24] text-[#71717a]">
                NOT ISSUED
              </span>
            </div>

            <div className="w-8 h-6 rounded bg-[#1c1c26] border border-[#2a2a38] flex items-center justify-center">
              <div className="w-4 h-3 border border-[#3f3f46] rounded-sm" />
            </div>

            <div>
              <div className="text-sm font-mono tracking-widest text-[#3f3f46]">
                •••• •••• •••• ••••
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-[#52525b]">
                <span>{user?.name ? user.name.toUpperCase() : "YOUR NAME"}</span>
                <span>••/••</span>
                <span className="font-sans font-bold italic">VISA</span>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              No cards yet
            </h2>
            <p className="text-xs text-[#71717a] leading-relaxed">
              You haven't requested an Apex Obsidian card yet. Request an institutional card below to unlock instant global Visa spending and 3.5% auto-reinvested cashback.
            </p>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#00ffa3]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>3.5% Cashback</span>
              </div>
              <p className="text-[11px] text-[#71717a]">
                Auto-reinvested into BTC or cash on every swipe.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Worldwide Visa</span>
              </div>
              <p className="text-[11px] text-[#71717a]">
                Zero foreign transaction fees in 180+ countries.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>EMV Security</span>
              </div>
              <p className="text-[11px] text-[#71717a]">
                Instant 1-tap card freeze and dynamic spending limits.
              </p>
            </div>
          </div>

          {/* Action Request Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
            <button
              onClick={() => handleRequestCard("PHYSICAL")}
              disabled={isProcessing}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-extrabold text-xs shadow-lg shadow-[#00ffa3]/10 transition-all cursor-pointer disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>Order Metal Card</span>
            </button>
            <button
              onClick={() => handleRequestCard("VIRTUAL")}
              disabled={isProcessing}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#14141a] hover:bg-[#1e1e26] text-white font-bold text-xs border border-[#22222e] transition-all cursor-pointer disabled:opacity-50"
            >
              <Smartphone className="w-4 h-4 text-[#00ffa3]" />
              <span>New Virtual Card</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Cards Display View */
        activeCard && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: 3D-styled Sleek Card Visual */}
            <div className="lg:col-span-6 space-y-4">
              <div
                className={`relative h-56 sm:h-64 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-hidden transition-all duration-300 border ${
                  activeCard.isFrozen
                    ? "bg-[#0e0e12] border-[#1c1c24] opacity-60 grayscale"
                    : activeCard.type === "PHYSICAL"
                    ? "bg-gradient-to-tr from-[#121218] via-[#09090c] to-[#040406] border-[#262633] text-white"
                    : "bg-gradient-to-tr from-[#0a1815] via-[#08100e] to-[#040605] border-[#00ffa3]/30 text-white"
                }`}
              >
                {/* Glossy overlay effect */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#00ffa3] flex items-center justify-center text-black font-black text-xs">
                      ▲
                    </div>
                    <span className="font-extrabold text-sm tracking-wider">APEX OBSIDIAN</span>
                  </div>

                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md">
                    {activeCard.type}
                  </span>
                </div>

                {/* EMV Chip & Contactless */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-8 rounded-md bg-gradient-to-br from-amber-400 to-yellow-600 border border-amber-300/40 shadow-inner flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-1 w-6 h-4 border border-amber-700/50" />
                  </div>
                  <div className="text-xs text-[#71717a]">)))</div>
                </div>

                {/* Card Number & Expiry */}
                <div>
                  <div className="text-lg sm:text-xl font-mono tracking-widest font-bold">
                    {showCardNumber ? (activeCard.fullCardNumber || "4155 8829 3912 8829") : activeCard.cardNumber}
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-[#71717a] uppercase block">Cardholder</span>
                      <span className="font-bold">{activeCard.cardHolder}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#71717a] uppercase block">Expires</span>
                      <span className="font-bold">
                        {activeCard.expMonth}/{activeCard.expYear}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#71717a] uppercase block">CVV</span>
                      <span className="font-bold">{showCardNumber ? activeCard.cvv : "•••"}</span>
                    </div>
                    <div className="font-sans font-black italic text-base tracking-tighter">
                      VISA
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Card Selector Buttons */}
              <div className="flex gap-2 flex-wrap">
                {cards.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCardId(c.id);
                    }}
                    className={`flex-1 min-w-[140px] p-3 rounded-2xl border text-left text-xs transition-all ${
                      activeCard.id === c.id
                        ? "bg-[#14141a] border-[#00ffa3]/40 text-[#00ffa3]"
                        : "bg-[#0a0a0e] border-[#1c1c24] text-[#71717a] hover:text-[#d4d4d8]"
                    }`}
                  >
                    <div className="font-bold text-white">{c.type} Card</div>
                    <div className="text-[11px] font-mono text-[#71717a] mt-0.5">{c.cardNumber}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Card Controls & Cashback Rewards */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Card Security Controls</h3>
                  <button
                    onClick={() => setShowCardNumber(!showCardNumber)}
                    className="flex items-center gap-1 text-xs text-[#00ffa3] hover:text-[#00ffa3]/80 font-semibold cursor-pointer"
                  >
                    {showCardNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showCardNumber ? "Hide Details" : "Show Details"}</span>
                  </button>
                </div>

                {/* Freeze Toggle */}
                <div className="p-4 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        activeCard.isFrozen
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                          : "bg-[#14141a] text-[#71717a]"
                      }`}
                    >
                      <Snowflake className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {activeCard.isFrozen ? "Card is Frozen" : "Card Active & Ready"}
                      </div>
                      <div className="text-[11px] text-[#71717a]">
                        Temporarily lock transactions and ATM withdrawals
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFreezeCard(activeCard.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      activeCard.isFrozen
                        ? "bg-cyan-500 text-black"
                        : "bg-[#14141a] hover:bg-[#1e1e26] text-[#d4d4d8] border border-[#1c1c24]"
                    }`}
                  >
                    {activeCard.isFrozen ? "Unfreeze" : "Freeze Card"}
                  </button>
                </div>

                {/* Spending Limit Adjuster */}
                <div className="p-4 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#d4d4d8]">Monthly Spending Limit</span>
                    <span className="font-mono font-bold text-[#00ffa3] text-sm">
                      {formatUSD(activeCard.spendingLimitUSD)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={activeCard.spendingLimitUSD}
                    onChange={(e) => updateCardLimit(activeCard.id, parseInt(e.target.value))}
                    className="w-full accent-[#00ffa3] h-1.5 bg-[#181820] rounded-lg cursor-pointer"
                  />

                  <div className="flex justify-between text-[11px] text-[#71717a] font-mono">
                    <span>Spent this cycle: {formatUSD(activeCard.currentSpentUSD)}</span>
                    <span>Available: {formatUSD(activeCard.spendingLimitUSD - activeCard.currentSpentUSD)}</span>
                  </div>
                </div>

                {/* Cashback Perks */}
                <div className="p-4 rounded-2xl bg-[#00ffa3]/5 border border-[#00ffa3]/20 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#00ffa3]">
                      <Sparkles className="w-4 h-4 text-[#00ffa3]" />
                      <span>{activeCard.cashbackTier} Tier</span>
                    </div>
                    <p className="text-[11px] text-[#71717a] mt-0.5">
                      Auto-earns {activeCard.cashbackRatePercent}% cashback on all retail & trading fees
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs text-[#71717a]">Total Earned</div>
                    <div className="text-sm font-bold text-[#00ffa3]">+$418.50 USD</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

