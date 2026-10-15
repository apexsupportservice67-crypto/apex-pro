import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Hash,
  Info,
  Layers,
  Shield,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "../../context/RouterContext";
import { useTradeStore } from "../../store/useTradeStore";
import { useVerificationStore } from "../../store/useVerificationStore";
import { verificationService } from "../../services/verificationService";
import { VerificationPendingCard } from "../verification/VerificationPendingCard";
import { formatUSD, formatHoldingAmount, formatBTCBRAmount, formatAssetValueUSD } from "../../lib/utils";
import { AssetIcon } from "../ui/AssetIcon";
import {
  CRYPTO_DEPOSIT_CONFIG,
  DEFAULT_CRYPTO_TOKEN,
  CryptoTokenConfig,
  NetworkConfig,
  BTCBR_DIGIT_OPTIONS,
  BTCBRDigitOption,
} from "./cryptoDepositConfig";

export const DepositView: React.FC = () => {
  const router = useRouter();
  const {
    user,
    fiatBalance,
    assets,
    depositFiat,
    depositAsset,
    setActiveTab,
    addToast,
    selectedTradeAsset,
    setSelectedTradeAsset,
  } = useTradeStore();

  const {
    pendingRequestId,
    currentRequest,
    lastApprovedToken,
    setPendingRequest,
    clearPendingRequest,
  } = useVerificationStore();

  // Screen flow:
  // "step1" -> "Make a deposit"
  // "step2" -> "Crypto deposit" (Vertical 4-step tracker)
  // "confirm" -> "Deposit confirmation" (amount input & execution)
  // "pending_verification" -> Waiting for Admin verification
  // "success" -> Receipt screen
  const [currentScreen, setCurrentScreen] = useState<
    "step1" | "step2" | "confirm" | "pending_verification" | "success"
  >(() => {
    if (pendingRequestId && currentRequest?.status === "pending") {
      return "pending_verification";
    }
    return "step1";
  });


  // Selection states
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string>("");
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>("");
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState<boolean>(false);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState<boolean>(false);

  const tokenDropdownRef = useRef<HTMLDivElement>(null);
  const networkDropdownRef = useRef<HTMLDivElement>(null);

  const [copied, setCopied] = useState<boolean>(false);
  const [depositAmountUSD, setDepositAmountUSD] = useState<number>(500);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastTxHash, setLastTxHash] = useState<string>("");

  // BTCBR Specific Deposit Length & Whole Number state
  const [selectedBtcbrDigits, setSelectedBtcbrDigits] = useState<16 | 20 | 26 | 35>(20);
  const [btcbrCustomAmount, setBtcbrCustomAmount] = useState<string>("20,635,836,836,835,365,732");
  const [btcbrCopied, setBtcbrCopied] = useState<boolean>(false);

  const handleSelectBtcbrDigits = (digits: 16 | 20 | 26 | 35) => {
    setSelectedBtcbrDigits(digits);
    const opt = BTCBR_DIGIT_OPTIONS.find((o) => o.digits === digits);
    if (opt) {
      setBtcbrCustomAmount(opt.defaultAmount);
      setDepositAmountUSD(opt.approxUSD);
    }
  };

  const handleBtcbrAmountChange = (val: string) => {
    // Strip everything except digits to guarantee whole number integer
    const digitsOnly = val.split(".")[0].replace(/[^\d]/g, "");
    if (!digitsOnly) {
      setBtcbrCustomAmount("");
      return;
    }
    // Format with commas, strictly whole number without decimal places
    const formatted = digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setBtcbrCustomAmount(formatted);
  };

  const handleCopyBtcbrAmount = (amt: string) => {
    if (amt) {
      navigator.clipboard.writeText(amt);
      setBtcbrCopied(true);
      addToast("BTCBR amount copied to clipboard!", "success");
      setTimeout(() => setBtcbrCopied(false), 2500);
    }
  };

  // Click outside listener to close dropdowns reliably
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        tokenDropdownRef.current &&
        !tokenDropdownRef.current.contains(target)
      ) {
        setIsTokenDropdownOpen(false);
      }
      if (
        networkDropdownRef.current &&
        !networkDropdownRef.current.contains(target)
      ) {
        setIsNetworkDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync initial asset if navigated with a specific asset in store
  useEffect(() => {
    if (selectedTradeAsset) {
      const match = Object.keys(CRYPTO_DEPOSIT_CONFIG).find(
        (k) => k.toLowerCase() === selectedTradeAsset.toLowerCase()
      );
      if (match) {
        setSelectedTokenSymbol(match);
        const config = CRYPTO_DEPOSIT_CONFIG[match];
        const defaultNet =
          config.networks.find((n) => n.recommended) || config.networks[0];
        if (defaultNet) {
          setSelectedNetworkId(defaultNet.id);
        }
      }
    }
  }, [selectedTradeAsset]);

  // Current token and network configurations
  const tokenConfig: CryptoTokenConfig | undefined = selectedTokenSymbol
    ? CRYPTO_DEPOSIT_CONFIG[selectedTokenSymbol]
    : undefined;

  const networkConfig: NetworkConfig | undefined =
    tokenConfig?.networks.find((n) => n.id === selectedNetworkId) ||
    tokenConfig?.networks.find((n) => n.recommended) ||
    tokenConfig?.networks[0];

  const handleSelectToken = (symbol: string) => {
    setSelectedTokenSymbol(symbol);
    setSelectedTradeAsset(symbol);
    setIsTokenDropdownOpen(false);

    const config = CRYPTO_DEPOSIT_CONFIG[symbol];
    if (config?.networks?.length) {
      const rec = config.networks.find((n) => n.recommended) || config.networks[0];
      setSelectedNetworkId(rec.id);
    } else {
      setSelectedNetworkId("");
    }
  };

  const handleSelectNetwork = (netId: string) => {
    setSelectedNetworkId(netId);
    setIsNetworkDropdownOpen(false);
  };

  const handleCopyAddress = (address: string) => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      addToast("Deposit address copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleExecuteDeposit = async () => {
    const isBTCBR = selectedTokenSymbol === "BTCBR";

    if (!isBTCBR && (!depositAmountUSD || depositAmountUSD < 100)) {
      addToast("Minimum Deposit", "Minimum deposit amount is $100.", "error");
      return;
    }
    if (!isBTCBR && depositAmountUSD > 300000) {
      addToast("Maximum Deposit", "Maximum deposit limit is $300,000 per transaction.", "error");
      return;
    }
    if (isBTCBR && !btcbrCustomAmount) {
      addToast("Invalid Amount", "Please select or specify a valid BTCBR amount.", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const btcbrOpt = BTCBR_DIGIT_OPTIONS.find((o) => o.digits === selectedBtcbrDigits) || BTCBR_DIGIT_OPTIONS[1];
      const finalBtcbrAmount = isBTCBR ? (btcbrCustomAmount || btcbrOpt.defaultAmount) : undefined;
      const requestAmountUSD = isBTCBR ? (btcbrOpt.approxUSD || 1500) : depositAmountUSD;
      const requestType = isBTCBR ? "Crypto Deposit Verification (BTCBR)" : "Crypto Deposit Verification";
      const requestAsset = isBTCBR ? "BTCBR" : (tokenConfig?.symbol || "USDT");
      const requestProtocol = networkConfig?.protocol || (isBTCBR ? "BSC" : "TRC-20");

      const res = await verificationService.createRequest({
        userId: user?.id || "usr_trader",
        userName: user?.name || "Apex Trader",
        userEmail: user?.email || "trader@apextrade.io",
        userTier: user?.tier || "PRO",
        type: requestType,
        amountUSD: requestAmountUSD,
        asset: requestAsset,
        protocol: requestProtocol,
        depositAddress: networkConfig?.address || "",
        btcbrDigits: isBTCBR ? selectedBtcbrDigits : undefined,
        btcbrAmount: finalBtcbrAmount,
        tokenAmount: finalBtcbrAmount,
      });

      setPendingRequest({
        id: res.id,
        userId: user?.id || "usr_trader",
        userName: user?.name || "Apex Trader",
        userEmail: user?.email || "trader@apextrade.io",
        userTier: user?.tier || "PRO",
        type: requestType,
        amountUSD: requestAmountUSD,
        asset: requestAsset,
        protocol: requestProtocol,
        depositAddress: networkConfig?.address || "",
        btcbrDigits: isBTCBR ? selectedBtcbrDigits : undefined,
        btcbrAmount: finalBtcbrAmount,
        tokenAmount: finalBtcbrAmount,
        status: "pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        expiresAt: res.expiresAt || Date.now() + 25 * 60 * 1000,
      });

      setCurrentScreen("pending_verification");
      addToast(
        "Verification Request Created",
        `Request ${res.id} queued for administrator review.`,
        "info"
      );
    } catch (err: any) {
      addToast("Deposit Failed", err.message || "Failed to process deposit", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setActiveTab("dashboard");
  };

  // Stepper condition checks for Screen 2
  const isStep1Complete = !!selectedTokenSymbol && !!tokenConfig;
  const isStep2Complete = isStep1Complete && !!selectedNetworkId && !!networkConfig;
  const isStep3Active = isStep2Complete;
  const isContinueEnabled =
    isStep1Complete &&
    isStep2Complete &&
    (selectedTokenSymbol === "BTCBR" ? !!btcbrCustomAmount : depositAmountUSD >= 100);

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-6 px-3 sm:px-4">
      {/* Centered Modal Container using platform's native dark neutral styling */}
      <div className="w-full max-w-[480px] rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] shadow-2xl overflow-hidden relative text-white">
        <AnimatePresence mode="wait">
          {/* ========================================================================= */}
          {/* SCREEN 1: "Make a deposit" */}
          {/* ========================================================================= */}
          {currentScreen === "step1" && (
            <motion.div
              key="screen-1"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="p-6 sm:p-7 space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Make a deposit
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-[#71717a] hover:text-white p-1 rounded-xl transition-colors -mr-1 -mt-1"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instruction line */}
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed -mt-3">
                To make a deposit, choose your preferred method, and click on the continue button.
              </p>

              {/* Payment options: Crypto only (Fixed single option, no alternatives) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#d4d4d8]">
                  Payment options
                </label>
                <div className="w-full px-4 py-3.5 rounded-2xl bg-[#0e0e12] border border-[#00ffa3]/50 text-white font-bold text-sm flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#00ffa3]/20 flex items-center justify-center text-[#00ffa3]">
                      <Wallet className="w-3.5 h-3.5" />
                    </div>
                    <span>Crypto</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#00ffa3] shadow-[0_0_8px_#00ffa3]" />
                </div>
              </div>

              {/* Limits Information: Minimum ($100) and Maximum ($300,000) with dotted line */}
              <div className="space-y-3 pt-1 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-[#d4d4d8]">
                  <span className="shrink-0 font-medium text-[#a1a1aa]">Minimum deposit</span>
                  <div className="flex-1 border-b border-dotted border-[#2a2a36] mx-3" />
                  <span className="shrink-0 font-bold text-white font-mono">$100</span>
                </div>

                <div className="flex items-center justify-between text-[#d4d4d8]">
                  <span className="shrink-0 font-medium text-[#a1a1aa]">Maximum deposit</span>
                  <div className="flex-1 border-b border-dotted border-[#2a2a36] mx-3" />
                  <span className="shrink-0 font-bold text-white font-mono">$300,000</span>
                </div>
              </div>

              {/* Continue Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedTokenSymbol) {
                      handleSelectToken(DEFAULT_CRYPTO_TOKEN);
                    }
                    setCurrentScreen("step2");
                  }}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#00ffa3] to-teal-400 hover:from-[#00ffa3]/90 hover:to-teal-300 text-black font-black text-sm sm:text-base transition-all shadow-lg shadow-[#00ffa3]/20 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 2: "Crypto deposit" with vertical step tracker */}
          {/* ========================================================================= */}
          {currentScreen === "step2" && (
            <motion.div
              key="screen-2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="p-6 sm:p-7 space-y-5"
            >
              {/* Header with Back Arrow & Close */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("step1")}
                    className="text-[#a1a1aa] hover:text-white transition-colors p-1 -ml-1 rounded-lg"
                    title="Back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    Crypto deposit
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="text-[#71717a] hover:text-white p-1 rounded-xl transition-colors -mr-1"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instruction line */}
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed -mt-2">
                To proceed, select your token and network, make payment to the address shown and click on the continue button.
              </p>

              {/* Vertical Numbered Step Tracker (1, 2, 3, 4) */}
              <div className="relative space-y-5 pt-1">
                {/* Background Connecting Line on the Left */}
                <div className="absolute left-[11px] top-4 bottom-7 w-[2px] bg-[#1c1c24] z-0" />
                {/* Active connecting line portion */}
                <div
                  className="absolute left-[11px] top-4 w-[2px] bg-[#00ffa3] z-0 transition-all duration-300"
                  style={{
                    height: !isStep1Complete
                      ? "0px"
                      : !isStep2Complete
                      ? "65px"
                      : "calc(100% - 2.25rem)",
                  }}
                />

                {/* ------------------------------------------------------------- */}
                {/* STEP 1: Select token to deposit */}
                {/* ------------------------------------------------------------- */}
                <div className={`relative flex items-start gap-3.5 transition-all ${isTokenDropdownOpen ? "z-30" : "z-10"}`}>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 transition-all ${
                      isStep1Complete
                        ? "bg-[#00ffa3] text-black shadow-md shadow-[#00ffa3]/25"
                        : "bg-[#00ffa3] text-black"
                    }`}
                  >
                    {isStep1Complete ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "1"}
                  </div>

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <label className="block text-xs sm:text-sm font-bold text-white">
                      Select token to deposit
                    </label>

                    {/* Token Dropdown */}
                    <div ref={tokenDropdownRef} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsTokenDropdownOpen(!isTokenDropdownOpen);
                          setIsNetworkDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-3 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] hover:border-[#2a2a36] text-left flex items-center justify-between transition-colors group"
                      >
                        {isStep1Complete ? (
                          <div className="flex items-center gap-2.5 min-w-0">
                            <AssetIcon
                              symbol={tokenConfig.symbol}
                              name={tokenConfig.name}
                              size="sm"
                              className="shrink-0"
                            />
                            <span className="font-bold text-sm text-white truncate">
                              {tokenConfig.name}
                            </span>
                            <span className="text-xs font-mono text-[#71717a]">
                              ({tokenConfig.symbol})
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-[#71717a] font-medium">
                            Select token
                          </span>
                        )}

                        <ChevronDown
                          className={`w-4 h-4 text-[#71717a] group-hover:text-white transition-transform ${
                            isTokenDropdownOpen ? "rotate-180 text-[#00ffa3]" : ""
                          }`}
                        />
                      </button>

                      {/* Token Dropdown List */}
                      <AnimatePresence>
                        {isTokenDropdownOpen && (
                          <motion.div
                            key="token-dropdown-menu"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl bg-[#121218] border border-[#22222e] p-1.5 shadow-2xl max-h-56 overflow-y-auto space-y-1"
                          >
                            {Object.values(CRYPTO_DEPOSIT_CONFIG).map((tok) => {
                              const isSelected = tok.symbol === selectedTokenSymbol;
                              return (
                                <button
                                  key={tok.symbol}
                                  type="button"
                                  onClick={() => handleSelectToken(tok.symbol)}
                                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all ${
                                    isSelected
                                      ? "bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30"
                                      : "hover:bg-[#181824] text-[#d4d4d8]"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <AssetIcon symbol={tok.symbol} name={tok.name} size="sm" />
                                    <div className="min-w-0">
                                      <span className="font-bold text-xs text-white">
                                        {tok.name}
                                      </span>
                                      <span className="text-[11px] font-mono text-[#71717a] ml-1.5">
                                        ({tok.symbol})
                                      </span>
                                      {tok.chainBadge && (
                                        <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/10 text-amber-300">
                                          {tok.chainBadge}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-[#00ffa3]" />}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* STEP 2: Select network */}
                {/* ------------------------------------------------------------- */}
                <div className={`relative flex items-start gap-3.5 transition-all ${isNetworkDropdownOpen ? "z-20" : "z-0"}`}>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 transition-all ${
                      isStep2Complete
                        ? "bg-[#00ffa3] text-black shadow-md shadow-[#00ffa3]/25"
                        : isStep1Complete
                        ? "bg-[#00ffa3] text-black"
                        : "bg-[#14141a] text-[#71717a] border border-[#1c1c24]"
                    }`}
                  >
                    {isStep2Complete ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "2"}
                  </div>

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <label className="block text-xs sm:text-sm font-bold text-white">
                      Select network
                    </label>

                    {/* Network Dropdown */}
                    <div ref={networkDropdownRef} className="relative">
                      {isStep1Complete && tokenConfig ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsNetworkDropdownOpen(!isNetworkDropdownOpen);
                            setIsTokenDropdownOpen(false);
                          }}
                          className="w-full px-3.5 py-3 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] hover:border-[#2a2a36] text-left flex items-center justify-between transition-colors group"
                        >
                          <span className="font-bold text-sm text-white truncate">
                            {networkConfig ? networkConfig.protocol : "Select network"}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-[#71717a] group-hover:text-white transition-transform ${
                              isNetworkDropdownOpen ? "rotate-180 text-[#00ffa3]" : ""
                            }`}
                          />
                        </button>
                      ) : (
                        <div className="w-full px-3.5 py-3 rounded-2xl bg-[#0e0e12]/60 border border-[#181820] text-left text-sm text-[#52525b] font-medium cursor-not-allowed">
                          Select token to deposit
                        </div>
                      )}

                      {/* Network Dropdown Menu */}
                      <AnimatePresence>
                        {isNetworkDropdownOpen && tokenConfig && (
                          <motion.div
                            key="network-dropdown-menu"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl bg-[#121218] border border-[#22222e] p-1.5 shadow-2xl max-h-48 overflow-y-auto space-y-1"
                          >
                            {tokenConfig.networks.map((net) => {
                              const isSelected = net.id === selectedNetworkId;
                              return (
                                <button
                                  key={net.id}
                                  type="button"
                                  onClick={() => handleSelectNetwork(net.id)}
                                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all ${
                                    isSelected
                                      ? "bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30"
                                      : "hover:bg-[#181824] text-[#d4d4d8]"
                                  }`}
                                >
                                  <div>
                                    <div className="font-bold text-xs text-white">
                                      {net.protocol}
                                    </div>
                                    <div className="text-[10px] text-[#71717a] font-mono">
                                      {net.name} • {net.estArrival}
                                    </div>
                                  </div>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-[#00ffa3]" />}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* STEP 3: Deposit details */}
                {/* ------------------------------------------------------------- */}
                <div className="relative z-10 flex items-start gap-3.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 transition-all ${
                      isStep3Active
                        ? "bg-[#00ffa3] text-black shadow-md shadow-[#00ffa3]/25"
                        : "bg-[#14141a] text-[#71717a] border border-[#1c1c24]"
                    }`}
                  >
                    3
                  </div>

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <label className="block text-xs sm:text-sm font-bold text-white">
                      Deposit details
                    </label>

                    {isStep3Active && networkConfig ? (
                      <div className="p-3.5 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] flex items-center justify-between gap-2.5">
                        <span className="font-mono text-xs text-white break-all select-all font-bold leading-relaxed">
                          {networkConfig.address}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAddress(networkConfig.address)}
                          className={`p-2.5 rounded-xl transition-all shrink-0 ${
                            copied
                              ? "bg-[#00ffa3] text-black shadow-md shadow-[#00ffa3]/20"
                              : "bg-[#14141a] hover:bg-[#1e1e26] text-[#a1a1aa] hover:text-white border border-[#22222e]"
                          }`}
                          title="Copy Address"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="h-12 rounded-2xl bg-[#0e0e12]/60 border border-[#181820]" />
                    )}
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* STEP 4: Intended Deposit Amount & Confirmation (BTCBR Digit Selector vs standard Crypto) */}
                {/* ------------------------------------------------------------- */}
                {isStep3Active && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 flex items-start gap-3.5 pt-1"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#14141a] text-[#00ffa3] border border-[#00ffa3]/40 flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5">
                      4
                    </div>

                    <div className="flex-1 space-y-3 min-w-0">
                      {selectedTokenSymbol === "BTCBR" ? (
                        /* BTCBR Specific Digit Length Selector Flow */
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="block text-xs sm:text-sm font-bold text-white">
                              Select BTCBR Deposit Length
                            </label>
                          </div>

                          {/* 4 Selectable Digit Length Cards (16, 20, 26, 35 Digits) */}
                          <div className="grid grid-cols-2 gap-2">
                            {BTCBR_DIGIT_OPTIONS.map((opt) => {
                              const isSelected = selectedBtcbrDigits === opt.digits;
                              return (
                                <button
                                  key={opt.digits}
                                  type="button"
                                  onClick={() => handleSelectBtcbrDigits(opt.digits)}
                                  className={`p-2.5 sm:p-3 rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between group ${
                                    isSelected
                                      ? "bg-[#141d1a] border-[#00ffa3] shadow-md shadow-[#00ffa3]/15 ring-1 ring-[#00ffa3]/50"
                                      : "bg-[#0e0e12] border-[#1c1c24] hover:border-[#2e2e3a] hover:bg-[#121218]"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <Hash className={`w-3.5 h-3.5 ${isSelected ? "text-[#00ffa3]" : "text-[#71717a]"}`} />
                                      <span className={`text-xs font-bold ${isSelected ? "text-[#00ffa3]" : "text-white"}`}>
                                        {opt.label}
                                      </span>
                                    </div>
                                    <div
                                      className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                                        isSelected
                                          ? "border-[#00ffa3] bg-[#00ffa3] text-black"
                                          : "border-[#3f3f46] bg-[#14141a]"
                                      }`}
                                    >
                                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                  </div>

                                  <div className="mt-2 space-y-0.5">
                                    <div className="text-[11px] font-mono font-extrabold text-[#d4d4d8] group-hover:text-white truncate">
                                      {opt.defaultAmount}
                                    </div>
                                    <div className="text-[9px] text-[#71717a] font-sans">
                                      {opt.tierBadge}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Selected BTCBR Amount Display Box with Copy and Edit Option */}
                          <div className="p-3.5 rounded-2xl bg-[#09090d] border border-[#1e1e28] space-y-2.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#a1a1aa] font-semibold flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-[#00ffa3]" />
                                <span>Selected {selectedBtcbrDigits}-Digit Allocation:</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyBtcbrAmount(btcbrCustomAmount)}
                                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                                  btcbrCopied
                                    ? "bg-[#00ffa3] text-black border-[#00ffa3]"
                                    : "bg-[#14141a] hover:bg-[#1e1e26] text-[#00ffa3] border-[#00ffa3]/30"
                                }`}
                              >
                                {btcbrCopied ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-2.5 h-2.5" />
                                    <span>Copy Amount</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="relative">
                              <input
                                type="text"
                                value={btcbrCustomAmount}
                                onChange={(e) => handleBtcbrAmountChange(e.target.value)}
                                placeholder="e.g. 20,635,836,836,835,365,732"
                                className="w-full pl-3.5 pr-16 py-2.5 bg-[#0e0e14] border border-[#222230] rounded-xl text-xs sm:text-sm font-extrabold font-mono text-[#00ffa3] focus:outline-none focus:border-[#00ffa3] tracking-wide"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-[#71717a] pointer-events-none">
                                BTCBR
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Standard Crypto Deposit Flow */
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="block text-xs sm:text-sm font-bold text-white">
                              Deposit Amount (USD Equivalent)
                            </label>
                            <span className="text-[10px] font-mono text-[#71717a]">
                              Min $100 • Max $300k
                            </span>
                          </div>

                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-[#71717a] text-sm">
                              $
                            </span>
                            <input
                              type="number"
                              min="100"
                              max="300000"
                              value={depositAmountUSD || ""}
                              onChange={(e) => setDepositAmountUSD(parseFloat(e.target.value) || 0)}
                              placeholder="500"
                              className="w-full pl-8 pr-3 py-2.5 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-sm font-extrabold font-mono text-white focus:outline-none focus:border-[#00ffa3]"
                            />
                          </div>

                          {/* Quick Presets */}
                          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                            {[100, 500, 2500, 10000].map((amt) => (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => setDepositAmountUSD(amt)}
                                className={`py-1.5 rounded-lg text-[11px] font-mono font-bold border transition-all ${
                                  depositAmountUSD === amt
                                    ? "bg-[#00ffa3] text-black border-[#00ffa3] shadow-sm shadow-[#00ffa3]/20"
                                    : "bg-[#0e0e12] hover:bg-[#181820] text-[#a1a1aa] border-[#1c1c24]"
                                }`}
                              >
                                ${amt.toLocaleString()}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Bottom Action Area: Full-width Confirm Button (Directly triggers Verification Waiting Flow) */}
              <div className="pt-3">
                <button
                  type="button"
                  disabled={!isContinueEnabled || isProcessing}
                  onClick={handleExecuteDeposit}
                  className={`w-full py-3.5 px-5 rounded-2xl font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
                    isContinueEnabled && !isProcessing
                      ? "bg-gradient-to-r from-[#00ffa3] to-teal-400 hover:from-[#00ffa3]/90 hover:to-teal-300 text-black shadow-lg shadow-[#00ffa3]/20 cursor-pointer active:scale-[0.99]"
                      : "bg-[#181820] text-[#52525b] border border-[#22222e] cursor-not-allowed"
                  }`}
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {selectedTokenSymbol === "BTCBR"
                          ? `Confirm ${selectedBtcbrDigits}-Digit BTCBR Deposit`
                          : "Confirm"}
                      </span>
                      <Zap className="w-4 h-4 fill-current" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 3: DEPOSIT CONFIRMATION AMOUNT & EXECUTION */}
          {/* ========================================================================= */}
          {currentScreen === "confirm" && (
            <motion.div
              key="screen-3"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="p-6 sm:p-7 space-y-5"
            >
              {/* Header with Back Arrow & Close */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("step2")}
                    className="text-[#a1a1aa] hover:text-white transition-colors p-1 -ml-1 rounded-lg"
                    title="Back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    Confirm Deposit
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="text-[#71717a] hover:text-white p-1 rounded-xl transition-colors -mr-1"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selected Crypto Summary Card */}
              <div className="p-4 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-[#71717a]">Asset & Protocol</span>
                  <span className="text-white font-bold">
                    {tokenConfig?.name} ({networkConfig?.protocol})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#71717a]">Vault Address</span>
                  <span className="text-[#00ffa3] truncate max-w-[200px] text-right font-mono font-semibold">
                    {networkConfig?.address}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#71717a]">Est. Settlement</span>
                  <span className="text-white font-bold">{networkConfig?.estArrival}</span>
                </div>
              </div>

              {/* Amount Input (Min $100 / Max $300,000) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-[#d4d4d8]">
                    Intended Deposit Amount (USD Equivalent)
                  </label>
                  <span className="text-[11px] font-mono text-[#71717a]">
                    Min $100 • Max $300k
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-[#71717a] text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    min="100"
                    max="300000"
                    value={depositAmountUSD || ""}
                    onChange={(e) => setDepositAmountUSD(parseFloat(e.target.value) || 0)}
                    placeholder="500"
                    className="w-full pl-9 pr-4 py-3 bg-[#0e0e12] border border-[#1c1c24] rounded-2xl text-base font-extrabold font-mono text-white focus:outline-none focus:border-[#00ffa3]"
                  />
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[100, 500, 2500, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmountUSD(amt)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                        depositAmountUSD === amt
                          ? "bg-[#00ffa3] text-black border-[#00ffa3] shadow-md shadow-[#00ffa3]/20"
                          : "bg-[#0e0e12] hover:bg-[#181820] text-[#a1a1aa] border-[#1c1c24]"
                      }`}
                    >
                      ${amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessing || depositAmountUSD < 100}
                  onClick={handleExecuteDeposit}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#00ffa3] to-teal-400 hover:from-[#00ffa3]/90 hover:to-teal-300 text-black font-black text-sm sm:text-base transition-all shadow-lg shadow-[#00ffa3]/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Confirm & Submit for Verification</span>
                      <Zap className="w-4 h-4 fill-current" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 3.5: PENDING VERIFICATION AWAITING ADMIN APPROVAL */}
          {/* ========================================================================= */}
          {currentScreen === "pending_verification" && pendingRequestId && (
            <motion.div
              key="screen-pending-verification"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-1"
            >
              <VerificationPendingCard
                requestId={pendingRequestId}
                onClose={() => {
                  clearPendingRequest();
                  setCurrentScreen("step1");
                }}
                onApprovedRedirect={() => {
                  setCurrentScreen("success");
                }}
              />
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 4: SUCCESS RECEIPT (DEPOSIT CONFIRMED) */}
          {/* ========================================================================= */}

          {currentScreen === "success" && (
            <motion.div
              key="screen-4"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="p-6 sm:p-7 text-center space-y-5"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30 flex items-center justify-center shadow-lg shadow-[#00ffa3]/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30">
                  ADMIN APPROVED & SETTLED
                </span>
                <h2 className="text-xl font-extrabold text-white tracking-tight mt-2">
                  Deposit Confirmed
                </h2>
                <p className="text-xs text-[#a1a1aa] mt-1">
                  Your on-chain deposit has been verified by the administrator and credited to your portfolio.
                </p>
              </div>

              {/* Summary Details */}
              <div className="p-4 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] text-left text-xs font-mono space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[#71717a]">Asset & Protocol:</span>
                  <span className="text-white font-bold">
                    {tokenConfig?.name} ({networkConfig?.protocol})
                  </span>
                </div>
                {selectedTokenSymbol === "BTCBR" && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#71717a]">Deposit Length:</span>
                    <span className="text-[#00ffa3] font-bold">
                      {selectedBtcbrDigits} Digits
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#71717a]">Credited Amount:</span>
                  <span className="text-[#00ffa3] font-bold text-sm">
                    {selectedTokenSymbol === "BTCBR"
                      ? `${btcbrCustomAmount} BTCBR`
                      : formatUSD(depositAmountUSD)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#71717a]">Status:</span>
                  <span className="text-[#00ffa3] font-semibold">Verified & Available</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#1c1c24]">
                  <span className="text-[#71717a]">Total Net Worth:</span>
                  <span className="text-white font-black text-sm">
                    {formatUSD(fiatBalance + assets.reduce((acc, a) => acc + a.holdingValueUSD, 0))}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (pendingRequestId) params.set("requestId", pendingRequestId);
                    if (lastApprovedToken) params.set("token", lastApprovedToken);
                    const q = params.toString() ? `?${params.toString()}` : "";
                    router.push(`/new-page${q}`);
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#00ffa3] to-teal-400 hover:from-[#00ffa3]/90 hover:to-teal-300 text-black font-extrabold rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-[#00ffa3]/20 flex items-center justify-center gap-1.5"
                >
                  <Shield className="w-4 h-4" />
                  <span>Access Protected Page</span>
                </button>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("trading")}
                    className="flex-1 py-2.5 px-3 bg-[#14141a] hover:bg-[#1e1e26] text-white font-bold rounded-xl text-xs transition-all border border-[#1c1c24]"
                  >
                    Live Terminal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearPendingRequest();
                      setCurrentScreen("step1");
                      setIsProcessing(false);
                    }}
                    className="flex-1 py-2.5 px-3 bg-[#14141a] hover:bg-[#1e1e26] text-[#a1a1aa] hover:text-white font-bold rounded-xl text-xs transition-all border border-[#1c1c24]"
                  >
                    Deposit Again
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
