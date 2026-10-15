import React, { useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Globe2,
  Layers,
  Lock,
  Percent,
  Plus,
  Minus,
  Radio,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { Link, useRouter } from "../context/RouterContext";
import { useTradeStore } from "../store/useTradeStore";
import { AssetIcon } from "../components/ui/AssetIcon";
import { formatUSD, formatPercent } from "../lib/utils";

export default function PublicLandingPage() {
  const router = useRouter();
  const { assets, isAuthenticated, setSelectedTradeAsset, setActiveTab } = useTradeStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const topCrypto = assets.filter((a) => a.category === "crypto").slice(0, 4);
  const topStocks = assets.filter((a) => a.category === "equity").slice(0, 4);

  const handleTradeAsset = (symbol: string) => {
    setSelectedTradeAsset(symbol);
    setActiveTab("trading");
    router.push("/dashboard");
  };

  const faqs = [
    {
      q: "What markets can I trade on Apex?",
      a: "Apex provides seamless multi-asset execution across major cryptocurrencies (BTC, ETH, SOL, SUI, AVAX) and premier global equities (AAPL, NVDA, TSLA, MSFT, AMZN) from a single consolidated account.",
    },
    {
      q: "How does the $10,000 demo trading liquidity work?",
      a: "When you create your account on the registration page, we instantly provision your portfolio with $10,000 USD in simulated demo liquidity, allowing you to test order execution, AI quant signals, and leverage risk-free.",
    },
    {
      q: "How are my assets safeguarded in Cold Storage?",
      a: "Apex implements multi-party computation (MPC) and multi-signature threshold cryptography. 95%+ of client assets reside in isolated offline vaults requiring 24-hour timelock validation for withdrawals.",
    },
    {
      q: "What is the fee structure on Apex?",
      a: "Apex features 0.00% maker fees and a maximum of 0.02% taker fees on crypto pairs, with zero commission on standard equity spot trades. Pro members enjoy 50% discount on all trade execution.",
    },
    {
      q: "Can I connect my self-custody Web3 wallet?",
      a: "Yes. You can connect MetaMask, Phantom, Coinbase Wallet, or WalletConnect to settle trades directly on-chain and move funds frictionlessly without custodial lockup.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] selection:bg-[#00ffa3]/20 selection:text-[#00ffa3]">
      {/* 1. Global Announcement / Ticker Bar */}
      <div className="hidden lg:block bg-[#08080c] border-b border-[#181820] py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ffa3] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ffa3]"></span>
            </span>
            <span className="text-[11px] font-bold text-[#00ffa3] uppercase tracking-wider">Live Liquidity</span>
            <span className="text-white/40">|</span>
            <span className="text-[11px] text-[#a1a1aa]">Aggregated Depth: $148.4M USD</span>
          </div>

          <div className="flex items-center gap-6 shrink-0 font-mono text-[11px]">
            {assets.slice(0, 5).map((asset) => (
              <button
                key={asset.symbol}
                onClick={() => handleTradeAsset(asset.symbol)}
                className="flex items-center gap-1.5 hover:text-[#00ffa3] transition-colors"
              >
                <span className="font-bold text-white">{asset.symbol}</span>
                <span className="text-[#a1a1aa]">{formatUSD(asset.price)}</span>
                <span
                  className={
                    asset.change24h >= 0 ? "text-[#00ffa3] font-semibold" : "text-rose-400 font-semibold"
                  }
                >
                  {formatPercent(asset.change24h)}
                </span>
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0 text-[#a1a1aa] text-[11px]">
            <Radio className="w-3.5 h-3.5 text-[#00ffa3]" />
            <span>Sub-millisecond matching engine online</span>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#050505]/85 backdrop-blur-xl border-b border-[#14141a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#00ffa3] via-[#00dc82] to-[#00b0ff] p-[1px] flex items-center justify-center shadow-lg shadow-[#00ffa3]/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#08080c] rounded-[11px] flex items-center justify-center">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#00ffa3]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1.5 font-mono">
                APEX <span className="hidden md:inline-block text-[#00ffa3] font-sans font-medium text-xs px-1.5 py-0.5 rounded bg-[#00ffa3]/10 border border-[#00ffa3]/30">MARKETS</span>
              </span>
              <span className="hidden md:block text-[10px] text-[#71717a] tracking-widest uppercase font-mono">Institutional Suite</span>
            </div>
          </Link>

          {/* Center Links */}
          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#a1a1aa]">
            <a href="#markets" className="hover:text-white transition-colors">
              Markets
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#terminal" className="hover:text-white transition-colors">
              Terminal
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Security
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Auth Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black text-xs font-bold transition-all shadow-lg shadow-[#00ffa3]/20 hover:shadow-[#00ffa3]/30 whitespace-nowrap"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-2.5 sm:px-4 py-2 text-xs font-semibold text-[#d4d4d8] hover:text-white hover:bg-[#14141a] rounded-xl transition-all whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black text-xs font-bold transition-all shadow-lg shadow-[#00ffa3]/20 hover:scale-[1.02] whitespace-nowrap"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-[#00ffa3]/10 via-[#00e5ff]/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#6366f1]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0e0e14] border border-[#1f1f2a] text-xs text-[#a1a1aa] mb-8 shadow-xl">
              <span className="px-2 py-0.5 rounded-full bg-[#00ffa3]/15 text-[#00ffa3] text-[10px] font-bold tracking-wider uppercase border border-[#00ffa3]/30">
                Apex v3.4 Live
              </span>
              <span className="text-[#e4e4e7] font-medium">Cross-Asset Algorithmic Execution Terminal</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#71717a]" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6">
              Institutional Multi-Asset <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffa3] via-[#00e5ff] to-white">
                Trading & Liquidity
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-[#a1a1aa] max-w-2xl mx-auto mb-10 leading-relaxed">
              Trade major cryptocurrencies and premier global equities with sub-millisecond execution, AI quant signals, institutional cold storage vaults, and zero custodial delay.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                href="/signup"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-extrabold text-sm transition-all shadow-xl shadow-[#00ffa3]/25 hover:scale-105 active:scale-95"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Open Trading Account</span>
              </Link>

              <Link
                href="/signup"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#0e0e14] hover:bg-[#15151e] border border-[#1f1f2a] text-white font-bold text-sm transition-all hover:border-[#2f2f3e]"
              >
                <Sparkles className="w-4 h-4 text-[#00ffa3]" />
                <span>1-Click Demo</span>
              </Link>
            </div>

            {/* Micro Trust Indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[#71717a]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ffa3]" />
                <span>$0 Commission Equities</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ffa3]" />
                <span>0.00% Crypto Maker Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ffa3]" />
                <span>MPC Cold Storage Vaults</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ffa3]" />
                <span>Web3 Wallet Integration</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live Markets Table Section */}
      <section id="markets" className="py-16 bg-[#08080c] border-y border-[#14141a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#00ffa3] uppercase tracking-wider">Spot & Derivatives</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Real-Time Market Prices
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00ffa3] hover:underline"
            >
              <span>Explore All 24+ Listed Assets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crypto Card */}
            <div className="bg-[#0c0c12] border border-[#181822] rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-4 mb-3 border-b border-[#181822]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00ffa3]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Digital Assets / Crypto</span>
                </div>
                <span className="text-[11px] text-[#71717a]">24h Volume: $89.2M</span>
              </div>

              <div className="space-y-2">
                {topCrypto.map((asset) => (
                  <div
                    key={asset.symbol}
                    onClick={() => handleTradeAsset(asset.symbol)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#101018] hover:bg-[#161622] border border-transparent hover:border-[#222230] cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <AssetIcon symbol={asset.symbol} name={asset.name} size="md" />
                      <div>
                        <div className="font-bold text-sm text-white group-hover:text-[#00ffa3] transition-colors flex items-center gap-2">
                          <span>{asset.name}</span>
                          <span className="text-[10px] font-mono text-[#71717a] px-1.5 py-0.5 rounded bg-[#181822]">
                            {asset.symbol}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#71717a] font-mono">Vol: ${((asset.volume24h || 1200000) / 1000000).toFixed(1)}M</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-white">{formatUSD(asset.price)}</div>
                      <div
                        className={`text-xs font-mono font-semibold ${
                          asset.change24h >= 0 ? "text-[#00ffa3]" : "text-rose-400"
                        }`}
                      >
                        {formatPercent(asset.change24h)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stocks Card */}
            <div className="bg-[#0c0c12] border border-[#181822] rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-4 mb-3 border-b border-[#181822]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00e5ff]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Global Equities & Tech</span>
                </div>
                <span className="text-[11px] text-[#71717a]">24h Volume: $59.2M</span>
              </div>

              <div className="space-y-2">
                {topStocks.map((asset) => (
                  <div
                    key={asset.symbol}
                    onClick={() => handleTradeAsset(asset.symbol)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#101018] hover:bg-[#161622] border border-transparent hover:border-[#222230] cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <AssetIcon symbol={asset.symbol} name={asset.name} size="md" />
                      <div>
                        <div className="font-bold text-sm text-white group-hover:text-[#00ffa3] transition-colors flex items-center gap-2">
                          <span>{asset.name}</span>
                          <span className="text-[10px] font-mono text-[#71717a] px-1.5 py-0.5 rounded bg-[#181822]">
                            {asset.symbol}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#71717a] font-mono">Vol: ${((asset.volume24h || 950000) / 1000000).toFixed(1)}M</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-white">{formatUSD(asset.price)}</div>
                      <div
                        className={`text-xs font-mono font-semibold ${
                          asset.change24h >= 0 ? "text-[#00ffa3]" : "text-rose-400"
                        }`}
                      >
                        {formatPercent(asset.change24h)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Features Grid Section */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold text-[#00ffa3] uppercase tracking-wider">Engineered for Precision</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
            Built for Traders Who Demand Execution Speed
          </h2>
          <p className="text-sm text-[#a1a1aa] mt-3">
            Every feature on Apex is designed to provide high-frequency liquidity, automated intelligence, and complete balance sovereignty.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Feature 1: AI Quant Signals */}
          <div className="bg-[#0a0a0e] border border-[#1c1c24] rounded-3xl p-8 hover:border-[#00ffa3]/40 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#00ffa3]/10 border border-[#00ffa3]/30 flex items-center justify-center text-[#00ffa3] mb-6 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00ffa3] transition-colors">
              AI Quantitative Signals
            </h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed mb-4">
              Algorithmic scanners evaluate order books, institutional flows, and RSI divergences to generate automated Buy/Sell signals with 88%+ historic backtested precision.
            </p>
            <div className="p-3 rounded-xl bg-[#0e0e14] border border-[#1f1f2a] text-[11px] font-mono text-[#00ffa3]">
              ✦ Live breakout alert on BTC/USDT (94% confidence)
            </div>
          </div>

          {/* Feature 2: Cold Storage Vaults */}
          <div className="bg-[#0a0a0e] border border-[#1c1c24] rounded-3xl p-8 hover:border-[#00ffa3]/40 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff] mb-6 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00e5ff] transition-colors">
              Institutional Cold Storage
            </h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed mb-4">
              Lock surplus capital in isolated air-gapped cryptographic vaults with customizable timelocks and multi-factor biometric approval keys.
            </p>
            <div className="p-3 rounded-xl bg-[#0e0e14] border border-[#1f1f2a] text-[11px] font-mono text-[#00e5ff]">
              ✦ 24h Timelock • MPC Threshold Validation
            </div>
          </div>

          {/* Feature 3: Staking & Yield */}
          <div className="bg-[#0a0a0e] border border-[#1c1c24] rounded-3xl p-8 hover:border-[#00ffa3]/40 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#6366f1]/10 border border-[#6366f1]/30 flex items-center justify-center text-[#6366f1] mb-6 group-hover:scale-110 transition-transform">
              <Percent className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#818cf8] transition-colors">
              High-Yield Liquid Staking
            </h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed mb-4">
              Earn real-time staking rewards on ETH, SOL, and USDC with automated compounding and zero lockup penalty on liquid reward redemption.
            </p>
            <div className="p-3 rounded-xl bg-[#0e0e14] border border-[#1f1f2a] text-[11px] font-mono text-[#818cf8]">
              ✦ Up to 8.4% APY • Auto-compounding daily
            </div>
          </div>
        </div>
      </section>

      {/* 6. Terminal Interactive Teaser */}
      <section id="terminal" className="py-16 bg-[#08080c] border-y border-[#14141a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0c0c12] border border-[#1f1f2a] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden relative">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
              <div>
                <span className="text-[11px] font-bold text-[#00ffa3] uppercase tracking-wider font-mono">
                  PRO TRADING ENGINE
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                  Cross-Asset Interactive Terminal
                </h3>
                <p className="text-xs text-[#a1a1aa] mt-1 max-w-lg">
                  Place Limit, Market, and Stop-Loss orders with up to 20x cross-margin leverage and real-time execution depth.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black text-xs font-bold transition-all shadow-lg shadow-[#00ffa3]/20"
                >
                  <span>Launch Live Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Terminal Preview Graphic */}
            <div className="bg-[#07070a] border border-[#181822] rounded-2xl p-4 font-mono text-xs overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#181822]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-white font-bold text-xs flex items-center gap-2">
                    <span>BTC/USD Perpetual</span>
                    <span className="text-[#00ffa3] bg-[#00ffa3]/10 px-2 py-0.5 rounded text-[10px]">LIVE</span>
                  </span>
                </div>
                <div className="text-[#71717a] text-[11px]">Latency: 1.2ms • Matching Engine: OK</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#0e0e14] border border-[#1a1a24] col-span-2">
                  <div className="flex items-center justify-between mb-3 text-[11px] text-[#71717a]">
                    <span>ORDER BOOK DEPTH</span>
                    <span className="text-[#00ffa3]">SPREAD: $0.50 (0.0005%)</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-rose-400">
                      <span>96,480.00</span>
                      <span>1.452 BTC</span>
                      <span className="text-[#71717a]">$140,088</span>
                    </div>
                    <div className="flex justify-between text-rose-400">
                      <span>96,450.50</span>
                      <span>2.891 BTC</span>
                      <span className="text-[#71717a]">$278,838</span>
                    </div>
                    <div className="flex justify-between text-[#00ffa3] font-bold text-sm py-1 border-y border-[#222230]">
                      <span>96,420.00 ↗</span>
                      <span>LAST PRICE</span>
                      <span className="text-white">$96,420.00</span>
                    </div>
                    <div className="flex justify-between text-[#00ffa3]">
                      <span>96,410.00</span>
                      <span>3.120 BTC</span>
                      <span className="text-[#71717a]">$300,799</span>
                    </div>
                    <div className="flex justify-between text-[#00ffa3]">
                      <span>96,380.00</span>
                      <span>4.780 BTC</span>
                      <span className="text-[#71717a]">$460,696</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0e0e14] border border-[#1a1a24] flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-[#71717a] uppercase font-bold">1-Click Fast Order</span>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => handleTradeAsset("BTC")}
                        className="py-2.5 rounded-lg bg-[#00ffa3] text-black font-bold text-xs"
                      >
                        Buy / Long
                      </button>
                      <button
                        onClick={() => handleTradeAsset("BTC")}
                        className="py-2.5 rounded-lg bg-rose-500 text-white font-bold text-xs"
                      >
                        Sell / Short
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-[#71717a] mt-4 pt-3 border-t border-[#181822]">
                    Simulated execution with instant fill guarantee.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Security & Trust Stats */}
      <section id="security" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="p-6 rounded-2xl bg-[#0a0a0e] border border-[#1c1c24]">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono mb-1">$4.8B+</div>
            <div className="text-xs text-[#a1a1aa]">Quarterly Trading Volume</div>
          </div>
          <div className="p-6 rounded-2xl bg-[#0a0a0e] border border-[#1c1c24]">
            <div className="text-3xl sm:text-4xl font-black text-[#00ffa3] font-mono mb-1">&lt; 1.2ms</div>
            <div className="text-xs text-[#a1a1aa]">Order Matching Latency</div>
          </div>
          <div className="p-6 rounded-2xl bg-[#0a0a0e] border border-[#1c1c24]">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono mb-1">120,000+</div>
            <div className="text-xs text-[#a1a1aa]">Active Registered Traders</div>
          </div>
          <div className="p-6 rounded-2xl bg-[#0a0a0e] border border-[#1c1c24]">
            <div className="text-3xl sm:text-4xl font-black text-[#00e5ff] font-mono mb-1">99.999%</div>
            <div className="text-xs text-[#a1a1aa]">Platform SLA Uptime</div>
          </div>
        </div>
      </section>

      {/* 8. FAQ Accordion */}
      <section id="faq" className="py-20 bg-[#08080c] border-t border-[#14141a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold text-[#00ffa3] uppercase tracking-wider">Help & Knowledge</span>
            <h2 className="text-3xl font-black text-white tracking-tight mt-1">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#0c0c12] border border-[#1c1c24] rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white hover:text-[#00ffa3] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="text-[#71717a] ml-4 shrink-0">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-xs text-[#a1a1aa] leading-relaxed border-t border-[#181822]/60 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Bottom Call to Action */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-tr from-[#00ffa3]/15 via-[#00dc82]/10 to-transparent border border-[#00ffa3]/30 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Ready to Upgrade Your Execution?
            </h2>
            <p className="text-sm text-[#a1a1aa] mb-8">
              Open your free account in under 60 seconds with instant access to AI quant signals and live terminals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-extrabold text-sm transition-all shadow-xl shadow-[#00ffa3]/30 hover:scale-105 text-center"
              >
                Create Free Account
              </Link>
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0a0a0e] hover:bg-[#14141a] border border-[#1c1c24] text-white font-bold text-sm transition-all text-center"
              >
                Launch Institutional Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-[#050505] border-t border-[#14141a] py-12 text-xs text-[#71717a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#00ffa3]/10 border border-[#00ffa3]/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#00ffa3]" />
            </div>
            <span className="font-bold text-white font-mono">APEX MARKETS INC.</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-white transition-colors">
              Register
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <a href="#security" className="hover:text-white transition-colors">
              Security
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
