import React, { useState } from "react";

interface AssetIconProps {
  symbol: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  className?: string;
}

// Reputable public CDN image URLs for Crypto and Equities
const ASSET_LOGOS: Record<string, { url?: string; domain?: string; bg?: string }> = {
  // Cryptocurrencies (CoinGecko / TrustWallet / CryptoIcons)
  BTC: {
    url: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    bg: "bg-[#f7931a]/15",
  },
  ETH: {
    url: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    bg: "bg-[#627eea]/15",
  },
  SOL: {
    url: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    bg: "bg-[#14f195]/15",
  },
  AVAX: {
    url: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
    bg: "bg-[#e84142]/15",
  },
  SUI: {
    url: "https://assets.coingecko.com/coins/images/26375/small/sui-ocean-square.png",
    bg: "bg-[#2a82e4]/15",
  },
  USDC: {
    url: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    bg: "bg-[#2775ca]/15",
  },
  USDT: {
    url: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    bg: "bg-[#26a17b]/15",
  },
  XRP: {
    url: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
    bg: "bg-[#23292f]/50",
  },
  DOGE: {
    url: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
    bg: "bg-[#c2a633]/15",
  },
  ADA: {
    url: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
    bg: "bg-[#0033ad]/15",
  },
  LINK: {
    url: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
    bg: "bg-[#375bd2]/15",
  },
  DOT: {
    url: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
    bg: "bg-[#e6007a]/15",
  },
  NEAR: {
    url: "https://assets.coingecko.com/coins/images/10365/small/near.png",
    bg: "bg-white/10",
  },
  BNB: {
    url: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    bg: "bg-[#f3ba2f]/15",
  },
  BABYDOGE: {
    url: "https://assets.coingecko.com/coins/images/16125/small/Baby_Doge_Coin_New_Logo.png",
    bg: "bg-[#f5a623]/15",
  },
  "BABY DOGE COIN": {
    url: "https://assets.coingecko.com/coins/images/16125/small/Baby_Doge_Coin_New_Logo.png",
    bg: "bg-[#f5a623]/15",
  },
  USDTZ: {
    url: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    bg: "bg-[#26a17b]/15",
  },
  BTCBR: {
    bg: "bg-[#18181f]",
  },
  MATIC: {
    url: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
    bg: "bg-[#8247e5]/15",
  },
  POL: {
    url: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
    bg: "bg-[#8247e5]/15",
  },
  ARB: {
    url: "https://assets.coingecko.com/coins/images/16547/small/arbitrum_logo.png",
    bg: "bg-[#28a0f0]/15",
  },
  OP: {
    url: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
    bg: "bg-[#ff0420]/15",
  },

  // Equities / Stocks (Clearbit / Parqet / Official Logo Domains)
  AAPL: {
    url: "https://logo.clearbit.com/apple.com",
    domain: "apple.com",
    bg: "bg-white/10",
  },
  NVDA: {
    url: "https://logo.clearbit.com/nvidia.com",
    domain: "nvidia.com",
    bg: "bg-[#76b900]/15",
  },
  TSLA: {
    url: "https://logo.clearbit.com/tesla.com",
    domain: "tesla.com",
    bg: "bg-[#e82127]/15",
  },
  MSFT: {
    url: "https://logo.clearbit.com/microsoft.com",
    domain: "microsoft.com",
    bg: "bg-[#00a4ef]/15",
  },
  AMZN: {
    url: "https://logo.clearbit.com/amazon.com",
    domain: "amazon.com",
    bg: "bg-[#ff9900]/15",
  },
  GOOGL: {
    url: "https://logo.clearbit.com/google.com",
    domain: "google.com",
    bg: "bg-[#4285f4]/15",
  },
  GOOG: {
    url: "https://logo.clearbit.com/google.com",
    domain: "google.com",
    bg: "bg-[#4285f4]/15",
  },
  META: {
    url: "https://logo.clearbit.com/meta.com",
    domain: "meta.com",
    bg: "bg-[#0081fb]/15",
  },
  SPY: {
    url: "https://logo.clearbit.com/ssga.com",
    domain: "ssga.com",
    bg: "bg-[#005587]/15",
  },
  QQQ: {
    url: "https://logo.clearbit.com/invesco.com",
    domain: "invesco.com",
    bg: "bg-[#002f6c]/15",
  },
  USD: {
    url: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    bg: "bg-[#00ffa3]/15",
  },
};

// High-fidelity fallback vector SVGs for instantaneous rendering without any latency
const SVG_ICONS: Record<string, React.ReactNode> = {
  BTC: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path
        fill="#FFF"
        d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.535 2.146-4.152.986-5.325.694l.95-3.81c1.173.293 4.929.872 4.375 3.116zm.536-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.977.244 4.113.7 3.61 2.733z"
      />
    </svg>
  ),
  ETH: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <g fill="#FFF" fillRule="nonzero">
        <path fillOpacity=".6" d="M16.498 4v8.87l7.497 3.35z" />
        <path d="M16.498 4L9 16.22l7.498-3.35z" />
        <path fillOpacity=".6" d="M16.498 21.968v6.027L24 17.616z" />
        <path d="M16.498 27.995v-6.028L9 17.616z" />
        <path fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z" />
        <path fillOpacity=".6" d="M9 16.22l7.498 4.353v-7.701z" />
      </g>
    </svg>
  ),
  BNB: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
      <path
        fill="#FFF"
        d="M12.11 13.62l3.89-3.89 3.89 3.89 2.27-2.27L16 5.24 9.84 11.35l2.27 2.27zm-6.87 2.38l2.27-2.27 2.27 2.27-2.27 2.27-2.27-2.27zm6.87 2.38l3.89 3.89 3.89-3.89 2.27 2.27L16 26.76l-6.16-6.11 2.27-2.27zm11.51-2.38l2.27-2.27 2.27 2.27-2.27 2.27-2.27-2.27zM16 12.87l3.13 3.13L16 19.13l-3.13-3.13L16 12.87z"
      />
    </svg>
  ),
  BABYDOGE: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#F5A623" />
      <circle cx="12" cy="13" r="2.2" fill="#201509" />
      <circle cx="20" cy="13" r="2.2" fill="#201509" />
      <circle cx="12.6" cy="12.4" r="0.7" fill="#FFF" />
      <circle cx="20.6" cy="12.4" r="0.7" fill="#FFF" />
      <ellipse cx="16" cy="19.5" rx="4.5" ry="3.2" fill="#FFF" />
      <polygon points="16,18 14.2,16.5 17.8,16.5" fill="#201509" />
      <path d="M14.5 19.5c.5.8 1.5.8 2 0 .5.8 1.5.8 2 0" stroke="#201509" strokeWidth="1" fill="none" />
    </svg>
  ),
  USDTZ: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <path
        fill="#FFF"
        d="M17.9 14.5v-2.2h4.5V9.6H9.6v2.7h4.5v2.2c-4.4.2-7.7 1.3-7.7 2.6 0 1.5 4.3 2.7 9.6 2.7s9.6-1.2 9.6-2.7c0-1.3-3.3-2.4-7.7-2.6zm0 4c-3.7-.2-6.5-.8-6.5-1.5s2.8-1.3 6.5-1.5v3zm-3.8 0v-3c3.7.2 6.5.8 6.5 1.5s-2.8 1.3-6.5 1.5z"
      />
      <circle cx="23" cy="23" r="6" fill="#F3BA2F" />
      <text x="23" y="26" fontSize="7" fontWeight="bold" fill="#000" textAnchor="middle" fontFamily="sans-serif">Z</text>
    </svg>
  ),
  BTCBR: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="15" fill="#232328" stroke="#33333d" strokeWidth="1" />
      <text x="16" y="19.5" fontSize="8.5" fontWeight="900" fill="#a1a1aa" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.3">BTC</text>
      <g transform="translate(18, 18)">
        <rect width="13" height="13" rx="3.5" fill="#0a0a0d" stroke="#f3ba2f" strokeWidth="0.8" />
        <g transform="translate(1.5, 1.5) scale(0.31)" fill="#F3BA2F">
          <path d="M12.11 13.62l3.89-3.89 3.89 3.89 2.27-2.27L16 5.24 9.84 11.35l2.27 2.27zm-6.87 2.38l2.27-2.27 2.27 2.27-2.27 2.27-2.27-2.27zm6.87 2.38l3.89 3.89 3.89-3.89 2.27 2.27L16 26.76l-6.16-6.11 2.27-2.27zm11.51-2.38l2.27-2.27 2.27 2.27-2.27 2.27-2.27-2.27zM16 12.87l3.13 3.13L16 19.13l-3.13-3.13L16 12.87z" />
        </g>
      </g>
    </svg>
  ),
  SOL: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#000" />
      <path
        d="M8.2 21.6c.2-.2.5-.3.8-.3h13.8c.5 0 .8.6.5.9l-2.4 2.4c-.2.2-.5.3-.8.3H6.3c-.5 0-.8-.6-.5-.9l2.4-2.4zm14.6-6.4c-.2-.2-.5-.3-.8-.3H8.2c-.5 0-.8.6-.5.9l2.4 2.4c.2.2.5.3.8.3h13.8c.5 0 .8-.6.5-.9l-2.4-2.4zm-14.6-6.4c.2-.2.5-.3.8-.3h13.8c.5 0 .8.6.5.9l-2.4 2.4c-.2.2-.5.3-.8.3H6.3c-.5 0-.8-.6-.5-.9l2.4-2.4z"
        fill="url(#solGrad)"
      />
      <defs>
        <linearGradient id="solGrad" x1="6" y1="24" x2="24" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFA3" />
          <stop offset="0.5" stopColor="#00DC82" />
          <stop offset="1" stopColor="#9945FF" />
        </linearGradient>
      </defs>
    </svg>
  ),
  AAPL: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#18181f" />
      <path
        fill="#FFF"
        d="M18.78 11.23c.7-.85 1.17-2.03 1.04-3.23-1.01.04-2.22.68-2.94 1.52-.64.73-1.2 1.93-1.05 3.09 1.13.09 2.27-.55 2.95-1.38zm1.48 5.76c.03 2.68 2.37 3.58 2.4 3.59-.02.06-.37 1.28-1.23 2.54-.74 1.09-1.52 2.18-2.73 2.2-1.2.02-1.58-.71-2.96-.71-1.37 0-1.8.69-2.94.73-1.18.04-2.07-1.18-2.82-2.26-1.54-2.22-2.71-6.28-1.13-9.03.78-1.36 2.18-2.22 3.7-2.24 1.15-.02 2.24.77 2.94.77.7 0 2.03-.96 3.42-.82.58.02 2.22.24 3.27 1.77-.09.05-1.95 1.14-1.92 3.46z"
      />
    </svg>
  ),
  NVDA: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#76B900" />
      <path
        fill="#FFF"
        d="M14.85 20.35c-2.48-.22-4.44-2.27-4.44-4.78 0-2.65 2.15-4.8 4.8-4.8 2.28 0 4.19 1.58 4.67 3.7h2.06c-.52-3.23-3.32-5.7-6.73-5.7-3.76 0-6.8 3.04-6.8 6.8 0 3.76 3.04 6.8 6.8 6.8 2.88 0 5.37-1.78 6.39-4.32h-2.15c-.88 1.4-2.48 2.3-4.6 2.3z"
      />
    </svg>
  ),
  TSLA: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#E82127" />
      <path
        fill="#FFF"
        d="M16 9.5c2.6 0 5.1.5 7.1 1.4l.6-2.1C21.4 7.7 18.8 7.2 16 7.2s-5.4.5-7.7 1.6l.6 2.1c2-1 4.5-1.4 7.1-1.4zm0 4.8c1.8 0 3.6.4 5.1 1l.5-1.9c-1.7-.7-3.6-1.1-5.6-1.1s-3.9.4-5.6 1.1l.5 1.9c1.5-.6 3.3-1 5.1-1zm-1.1 3.5h2.2v8.2h-2.2v-8.2z"
      />
    </svg>
  ),
  AVAX: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#E84142" />
      <path
        fill="#FFF"
        d="M14.6 9.8c.6-1.1 2.2-1.1 2.8 0l6.9 12.4c.6 1.1-.2 2.5-1.4 2.5h-3.6c-.6 0-1.1-.3-1.4-.8l-3.3-6.1-2.1 3.8h3.3c.6 0 1 .4 1 1s-.4 1-1 1H9.1c-1.2 0-2-1.4-1.4-2.5l6.9-11.3z"
      />
    </svg>
  ),
  SUI: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#2A82E4" />
      <path
        fill="#FFF"
        d="M16 6c-1.5 2.5-5 7.6-5 11.5 0 2.8 2.2 5 5 5s5-2.2 5-5C21 13.6 17.5 8.5 16 6zm0 18.5c-3.9 0-7-3.1-7-7 0-3.6 2.8-7.8 5-10.8l2-2.7 2 2.7c2.2 3 5 7.2 5 10.8 0 3.9-3.1 7-7 7z"
      />
    </svg>
  ),
  USDC: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#2775CA" />
      <path
        fill="#FFF"
        d="M16 6C10.5 6 6 10.5 6 16s4.5 10 10 10 10-4.5 10-10S21.5 6 16 6zm1.3 14.7c-1.5 0-2.3-.7-2.4-1.7h1.6c.1.4.4.6.9.6.5 0 .8-.3.8-.7 0-.5-.4-.6-1.1-.8l-.5-.2c-1.3-.4-1.8-1-1.8-2 0-1.3 1-2.2 2.5-2.2.3 0 .7.1 1 .2v-1.3h1.2v1.4c.9.2 1.6.8 1.7 1.7h-1.5c-.1-.4-.4-.7-.8-.7-.5 0-.8.3-.8.6 0 .4.3.6 1 .8l.5.2c1.4.4 2 1.1 2 2.1-.1 1.4-1 2.3-2.6 2.3-.4 0-.8-.1-1.1-.2v1.5h-1.2v-1.5c-.5-.1-.7-.1-.7-.1z"
      />
    </svg>
  ),
  USDT: (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <path
        fill="#FFF"
        d="M17.9 14.5v-2.2h4.5V9.6H9.6v2.7h4.5v2.2c-4.4.2-7.7 1.3-7.7 2.6 0 1.5 4.3 2.7 9.6 2.7s9.6-1.2 9.6-2.7c0-1.3-3.3-2.4-7.7-2.6zm0 4c-3.7-.2-6.5-.8-6.5-1.5s2.8-1.3 6.5-1.5v3zm-3.8 0v-3c3.7.2 6.5.8 6.5 1.5s-2.8 1.3-6.5 1.5z"
      />
    </svg>
  ),
};

export const AssetIcon: React.FC<AssetIconProps> = ({
  symbol,
  name,
  size = "md",
  className = "",
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const cleanSymbol = symbol.toUpperCase().trim();

  // Determine pixel / tailwind dimensions
  const sizeMap: Record<string, { box: string; text: string }> = {
    xs: { box: "w-5 h-5", text: "text-[9px]" },
    sm: { box: "w-7 h-7", text: "text-[10px]" },
    md: { box: "w-9 h-9", text: "text-xs" },
    lg: { box: "w-10 h-10", text: "text-sm" },
    xl: { box: "w-12 h-12", text: "text-base" },
  };

  const selectedSize = typeof size === "string" ? sizeMap[size] || sizeMap.md : sizeMap.md;
  const config = ASSET_LOGOS[cleanSymbol];

  // If we have an inline SVG available and either image failed or instant rendering is desired:
  const svgIcon = SVG_ICONS[cleanSymbol];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden shrink-0 border border-[#1c1c24] select-none ${selectedSize.box} ${
        config?.bg || "bg-[#0e0e12]"
      } ${className}`}
      title={name || symbol}
    >
      {!imageFailed && config?.url ? (
        <img
          src={config.url}
          alt={name || symbol}
          className="w-full h-full object-contain p-1 rounded-xl transition-opacity duration-200"
          loading="lazy"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : svgIcon ? (
        <div className="w-full h-full p-1 flex items-center justify-center">
          {svgIcon}
        </div>
      ) : (
        /* Graceful Fallback Letter Avatar */
        <span className={`font-extrabold text-white font-mono tracking-tight ${selectedSize.text}`}>
          {cleanSymbol.slice(0, 3)}
        </span>
      )}
    </div>
  );
};
