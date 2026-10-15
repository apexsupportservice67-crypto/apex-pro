import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  QrCode,
  ShieldCheck,
  Smartphone,
  Wallet,
  Zap,
} from "lucide-react";
import { useTradeStore } from "../../store/useTradeStore";
import { formatUSD } from "../../lib/utils";

type WithdrawStep = "FORM" | "2FA_MODAL" | "PROCESSING" | "SUCCESS";

export const WithdrawalView: React.FC = () => {
  const { fiatBalance, withdrawFiat, setActiveTab, addToast } = useTradeStore();

  const [step, setStep] = useState<WithdrawStep>("FORM");
  const [amount, setAmount] = useState<number>(0);
  const [cryptoAddress, setCryptoAddress] = useState<string>("");
  const [cryptoNetwork, setCryptoNetwork] = useState<string>("Ethereum (ERC-20)");
  const [twoFactorPin, setTwoFactorPin] = useState<string>("");
  const [lastTxId, setLastTxId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleQuickPercent = (pct: number) => {
    const calc = Math.floor((fiatBalance * pct) / 100);
    setAmount(calc);
    setErrorMessage(null);
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (amount <= 0) {
      setErrorMessage("Please enter an amount greater than $0.");
      return;
    }
    if (amount > fiatBalance) {
      setErrorMessage("Amount exceeds available USD cash balance.");
      return;
    }
    if (!cryptoAddress || cryptoAddress.length < 10) {
      setErrorMessage("Please provide a valid destination crypto wallet address.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setErrorMessage("Transaction could not be broadcast due to network congestion.");
    }, 800);
  };

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorPin.length < 6) {
      setErrorMessage("Please enter the 6-digit security code.");
      return;
    }

    setStep("PROCESSING");

    const destination = `${cryptoAddress.slice(0, 8)}... (${cryptoNetwork})`;

    try {
      const tx = await withdrawFiat(amount, destination);
      setLastTxId(tx.id);
      setTimeout(() => {
        setStep("SUCCESS");
      }, 1000);
    } catch (err: any) {
      setStep("FORM");
      setErrorMessage(err.message || "Withdrawal failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00ffa3] to-teal-400 text-black font-extrabold shadow-lg shadow-[#00ffa3]/20 mb-3">
          <ArrowUpRight className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Withdraw Funds
        </h1>
        <p className="text-xs text-[#71717a] mt-1">
          High-speed on-chain payout to verified crypto destinations.
        </p>
      </div>

      <div className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 sm:p-8 shadow-2xl relative">
        <AnimatePresence mode="wait">
          {/* STEP 1: WITHDRAW FORM */}
          {step === "FORM" && (
            <motion.form
              key="withdraw-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleProceed}
              className="space-y-6"
            >
              {/* Error Warning */}
              {errorMessage && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Amount Input with Live Balance validation */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-bold text-[#d4d4d8]">Withdrawal Amount</label>
                  <span className="text-[#71717a] font-mono">
                    Available: <strong className="text-[#00ffa3]">{formatUSD(fiatBalance)}</strong>
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717a] font-bold text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={fiatBalance}
                    required
                    value={amount || ""}
                    onChange={(e) => {
                      setAmount(parseFloat(e.target.value) || 0);
                      setErrorMessage(null);
                    }}
                    placeholder="2000"
                    className="w-full pl-9 pr-16 py-3.5 bg-[#0e0e12] border border-[#1c1c24] rounded-2xl text-xl font-mono font-bold text-white focus:outline-none focus:border-[#00ffa3]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#71717a] font-mono">
                    USD
                  </span>
                </div>

                {/* Percentage Shortcuts */}
                <div className="grid grid-cols-4 gap-2 mt-2.5">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleQuickPercent(pct)}
                      className="py-1.5 text-xs font-bold bg-[#0e0e12] hover:bg-[#181820] text-[#d4d4d8] rounded-xl border border-[#1c1c24] hover:border-[#262633] transition-all font-mono"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Crypto Destination Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#d4d4d8] mb-1">
                    Network
                  </label>
                  <select
                    value={cryptoNetwork}
                    onChange={(e) => setCryptoNetwork(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="Ethereum (ERC-20)">Ethereum Mainnet (ERC-20 USDC/USDT)</option>
                    <option value="Solana (SPL)">Solana High-Speed (SPL USDC)</option>
                    <option value="Arbitrum One">Arbitrum L2 (Low Gas)</option>
                    <option value="Bitcoin (Native SegWit)">Bitcoin Network (Native SegWit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#d4d4d8] mb-1">
                    Recipient Wallet Address
                  </label>
                  <input
                    type="text"
                    required
                    value={cryptoAddress}
                    onChange={(e) => setCryptoAddress(e.target.value)}
                    placeholder="0x71C... or Solana pubkey"
                    className="w-full px-3.5 py-2.5 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-xs font-mono text-white placeholder-[#71717a] focus:outline-none focus:border-[#00ffa3]"
                  />
                </div>
              </div>

              {/* Fee & Arrival Summary */}
              <div className="p-4 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-[#71717a]">
                  <span>Transfer Amount</span>
                  <span className="text-white font-bold">{formatUSD(amount)}</span>
                </div>
                <div className="flex justify-between text-[#71717a]">
                  <span>Processing Fee</span>
                  <span className="text-[#00ffa3] font-bold">$0.00 (Standard)</span>
                </div>
                <div className="flex justify-between text-[#71717a]">
                  <span>Estimated Arrival</span>
                  <span className="text-white font-bold">Within 15 minutes</span>
                </div>
                <div className="pt-2 border-t border-[#1c1c24] flex justify-between text-sm">
                  <span className="text-[#d4d4d8] font-bold">Remaining Available</span>
                  <span className="text-[#00ffa3] font-bold">
                    {formatUSD(Math.max(0, fiatBalance - amount))}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={amount <= 0 || amount > fiatBalance || isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-[#00ffa3] to-teal-400 hover:from-[#00ffa3]/90 hover:to-teal-300 text-black font-black rounded-2xl text-sm shadow-xl shadow-[#00ffa3]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Proceed</span>
                )}
              </button>
            </motion.form>
          )}

          {/* STEP 2: 2FA SECURITY PIN MODAL */}
          {step === "2FA_MODAL" && (
            <motion.form
              key="2fa-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleConfirm2FA}
              className="space-y-6 text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">2-Factor Authorization</h3>
                <p className="text-xs text-[#71717a] mt-1">
                  Enter the 6-digit verification code from your Google Authenticator or SMS
                </p>
              </div>

              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={twoFactorPin}
                  onChange={(e) => setTwoFactorPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="8 4 9 2 0 1"
                  className="w-full py-3 text-center tracking-[0.5em] text-2xl font-mono font-bold bg-[#0e0e12] border border-[#1c1c24] rounded-2xl text-white focus:outline-none focus:border-[#00ffa3]"
                />
                <p className="text-[11px] text-[#71717a] mt-2">Demo PIN: enter any 6 digits (e.g. 123456)</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("FORM")}
                  className="w-1/3 py-3 bg-[#14141a] hover:bg-[#1e1e26] text-[#d4d4d8] font-bold rounded-2xl text-xs transition-all border border-[#1c1c24]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={twoFactorPin.length < 6}
                  className="w-2/3 py-3 bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-bold rounded-2xl text-xs shadow-lg shadow-[#00ffa3]/20 transition-all disabled:opacity-50"
                >
                  Confirm & Transfer {formatUSD(amount)}
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 3: PROCESSING ANIMATION */}
          {step === "PROCESSING" && (
            <motion.div
              key="processing-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center space-y-4"
            >
              <div className="w-12 h-12 border-3 border-[#00ffa3] border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h4 className="text-base font-bold text-white">Transmitting On-Chain Settlement...</h4>
                <p className="text-xs text-[#71717a] mt-1">
                  Broadcasting cryptographic proof to blockchain network
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS RECEIPT */}
          {step === "SUCCESS" && (
            <motion.div
              key="success-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30 flex items-center justify-center shadow-xl shadow-[#00ffa3]/15">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-white tracking-tight">
                  Withdrawal Dispatched!
                </h3>
                <p className="text-xs text-[#71717a] mt-1">
                  Your funds are on their way to the designated receiving address.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] text-left text-xs font-mono space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Amount Sent:</span>
                  <span className="text-[#00ffa3] font-bold">{formatUSD(amount)}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[#71717a] shrink-0">Destination:</span>
                  <span className="text-white truncate max-w-[150px] xs:max-w-[180px] sm:max-w-[200px] text-right font-mono">
                    {cryptoAddress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Status:</span>
                  <span className="text-[#00ffa3] font-bold">COMPLETED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Remaining USD:</span>
                  <span className="text-white font-bold">{formatUSD(fiatBalance)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("dashboard")}
                  className="py-3 px-6 bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-bold rounded-xl text-xs transition-all shadow-lg"
                >
                  Return to Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("FORM");
                    setTwoFactorPin("");
                  }}
                  className="py-3 px-6 bg-[#14141a] hover:bg-[#1e1e26] text-[#d4d4d8] font-bold rounded-xl text-xs transition-all border border-[#1c1c24]"
                >
                  Make Another Withdrawal
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

