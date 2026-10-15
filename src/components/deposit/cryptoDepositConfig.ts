export interface NetworkConfig {
  id: string;
  name: string;
  protocol: string;
  address: string;
  memoTag?: string;
  minDeposit: string;
  estArrival: string;
  confirmations: number;
  recommended?: boolean;
}

export interface CryptoTokenConfig {
  symbol: string;
  name: string;
  chainBadge?: string;
  contractAddress?: string;
  iconBg?: string;
  networks: NetworkConfig[];
  minDepositUSD: number;
  maxDepositUSD: number;
}

export const CRYPTO_DEPOSIT_CONFIG: Record<string, CryptoTokenConfig> = {
  BNB: {
    symbol: "BNB",
    name: "Binance coin",
    chainBadge: "BSC",
    minDepositUSD: 100,
    maxDepositUSD: 300000,
    networks: [
      {
        id: "bnb-bsc",
        name: "BNB Smart Chain (BEP-20)",
        protocol: "BSC",
        address: "0x36DD761f067BD5b30f3eAA0DB7D956a36f660C81",
        minDeposit: "0.15 BNB",
        estArrival: "~1-2 mins",
        confirmations: 15,
        recommended: true,
      },
      {
        id: "bnb-bep2",
        name: "BNB Beacon Chain (BEP-2)",
        protocol: "BEP-2",
        address: "bnb136dd761f067bd5b30f3eaa0db7d956a36f660c",
        memoTag: "1098432",
        minDeposit: "0.15 BNB",
        estArrival: "~1 min",
        confirmations: 1,
      },
    ],
  },
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    minDepositUSD: 100,
    maxDepositUSD: 300000,
    networks: [
      {
        id: "eth-erc20",
        name: "Ethereum Mainnet (ERC-20)",
        protocol: "ERC-20",
        address: "0x657F2e9588ED1e01cc9411fdef4FFA06ca9b35f3",
        minDeposit: "0.03 ETH",
        estArrival: "~2-5 mins",
        confirmations: 12,
        recommended: true,
      },
      {
        id: "eth-arbitrum",
        name: "Arbitrum One (L2)",
        protocol: "Arbitrum",
        address: "0x657F2e9588ED1e01cc9411fdef4FFA06ca9b35f3",
        minDeposit: "0.01 ETH",
        estArrival: "~1 min",
        confirmations: 30,
      },
      {
        id: "eth-base",
        name: "Base Network (L2)",
        protocol: "Base",
        address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        minDeposit: "0.01 ETH",
        estArrival: "~1 min",
        confirmations: 30,
      },
      {
        id: "eth-optimism",
        name: "OP Mainnet (Optimism)",
        protocol: "Optimism",
        address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        minDeposit: "0.01 ETH",
        estArrival: "~1 min",
        confirmations: 30,
      },
    ],
  },
  BTC: {
    symbol: "BTC",
    name: "Bitcoin",
    minDepositUSD: 100,
    maxDepositUSD: 300000,
    networks: [
      {
        id: "btc-native",
        name: "Bitcoin Native SegWit",
        protocol: "BTC (SegWit)",
        address: "bc1q3xfrhw0zxfj0hx490uklysh5vvrsg4d49442sq",
        minDeposit: "0.0015 BTC",
        estArrival: "~10-30 mins",
        confirmations: 2,
        recommended: true,
      },
      {
        id: "btc-taproot",
        name: "Bitcoin Taproot",
        protocol: "BTC (Taproot)",
        address: "bc1p3xfrhw0zxfj0hx490uklysh5vvrsg4d49442sq",
        minDeposit: "0.0015 BTC",
        estArrival: "~10-30 mins",
        confirmations: 2,
      },
      {
        id: "btc-lightning",
        name: "Lightning Network",
        protocol: "Lightning",
        address: "lnbc100u1p3xfrhw0zxfj0hx490uklysh5vvrsg4d49442sq",
        minDeposit: "0.0001 BTC",
        estArrival: "Instant (<5s)",
        confirmations: 1,
      },
    ],
  },
  USDTZ: {
    symbol: "USDTZ",
    name: "USDTZ",
    chainBadge: "BSC",
    minDepositUSD: 100,
    maxDepositUSD: 300000,
    networks: [
      {
        id: "usdtz-bep20",
        name: "BNB Smart Chain (BEP-20)",
        protocol: "BSC",
        address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        minDeposit: "100 USDTz",
        estArrival: "~1-2 mins",
        confirmations: 15,
        recommended: true,
      },
      {
        id: "usdtz-erc20",
        name: "Ethereum (ERC-20)",
        protocol: "ERC-20",
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        minDeposit: "100 USDTz",
        estArrival: "~3-5 mins",
        confirmations: 12,
      },
      {
        id: "usdtz-polygon",
        name: "Polygon PoS",
        protocol: "Polygon",
        address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        minDeposit: "100 USDTz",
        estArrival: "~2 mins",
        confirmations: 64,
      },
    ],
  },
  BTCBR: {
    symbol: "BTCBR",
    name: "Bitcoin BR",
    chainBadge: "BSC",
    contractAddress: "(0x0cF8...F262)",
    minDepositUSD: 100,
    maxDepositUSD: 300000,
    networks: [
      {
        id: "btcbr-bep20",
        name: "BNB Smart Chain (BEP-20)",
        protocol: "BSC",
        address: "0x0cF8e180350253271f4b917CcFB0aC4f62524d77",
        minDeposit: "1,000,000,000 BTCBR",
        estArrival: "~1-2 mins",
        confirmations: 15,
        recommended: true,
      },
      {
        id: "btcbr-polygon",
        name: "Polygon Network",
        protocol: "Polygon",
        address: "0x0cF8e180350253271f4b917CcFB0aC4f62524d77",
        minDeposit: "1,000,000,000 BTCBR",
        estArrival: "~2 mins",
        confirmations: 64,
      },
    ],
  },
  BabyDoge: {
    symbol: "BabyDoge",
    name: "BabyDoge",
    chainBadge: "BSC",
    minDepositUSD: 100,
    maxDepositUSD: 300000,
    networks: [
      {
        id: "babydoge-bep20",
        name: "BNB Smart Chain (BEP-20)",
        protocol: "BSC",
        address: "0xc748673057861a797275CD8A068AbB95A902e8de",
        minDeposit: "10,000,000,000 BabyDoge",
        estArrival: "~1-2 mins",
        confirmations: 15,
        recommended: true,
      },
      {
        id: "babydoge-erc20",
        name: "Ethereum (ERC-20)",
        protocol: "ERC-20",
        address: "0xAC57De9C1b09FeC648E93EB98875B212Ca0b467f",
        minDeposit: "25,000,000,000 BabyDoge",
        estArrival: "~3-5 mins",
        confirmations: 12,
      },
    ],
  },
  SOL: {
    symbol: "SOL",
    name: "Solana",
    minDepositUSD: 100,
    maxDepositUSD: 300000,
    networks: [
      {
        id: "sol-native",
        name: "Solana Mainnet (SPL)",
        protocol: "Solana",
        address: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
        minDeposit: "0.5 SOL",
        estArrival: "~30 secs",
        confirmations: 32,
        recommended: true,
      },
    ],
  },
  AVAX: {
    symbol: "AVAX",
    name: "Avalanche",
    minDepositUSD: 100,
    maxDepositUSD: 300000,
    networks: [
      {
        id: "avax-cchain",
        name: "Avalanche C-Chain",
        protocol: "Avalanche",
        address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        minDeposit: "3.5 AVAX",
        estArrival: "~1-2 mins",
        confirmations: 12,
        recommended: true,
      },
    ],
  },
  SUI: {
    symbol: "SUI",
    name: "Sui Network",
    minDepositUSD: 100,
    maxDepositUSD: 300000,
    networks: [
      {
        id: "sui-mainnet",
        name: "Sui Mainnet",
        protocol: "Sui",
        address: "0x9189b808945657F2e9588ED1e01cc9411fdef4FFA06ca9b35f3",
        minDeposit: "50 SUI",
        estArrival: "~30 secs",
        confirmations: 1,
        recommended: true,
      },
    ],
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    minDepositUSD: 100,
    maxDepositUSD: 300000,
    networks: [
      {
        id: "usdc-erc20",
        name: "Ethereum (ERC-20)",
        protocol: "ERC-20",
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        minDeposit: "100 USDC",
        estArrival: "~2-5 mins",
        confirmations: 12,
        recommended: true,
      },
      {
        id: "usdc-sol",
        name: "Solana (SPL)",
        protocol: "Solana",
        address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        minDeposit: "100 USDC",
        estArrival: "~30 secs",
        confirmations: 32,
      },
      {
        id: "usdc-polygon",
        name: "Polygon (PoS)",
        protocol: "Polygon",
        address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        minDeposit: "100 USDC",
        estArrival: "~2 mins",
        confirmations: 64,
      },
    ],
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    minDepositUSD: 100,
    maxDepositUSD: 300000,
    networks: [
      {
        id: "usdt-trc20",
        name: "TRON (TRC-20)",
        protocol: "TRC-20",
        address: "TYDzpK9b588ED1e01cc9411fdef4FFA06ca9b35",
        minDeposit: "100 USDT",
        estArrival: "~2 mins",
        confirmations: 20,
        recommended: true,
      },
      {
        id: "usdt-erc20",
        name: "Ethereum (ERC-20)",
        protocol: "ERC-20",
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        minDeposit: "100 USDT",
        estArrival: "~2-5 mins",
        confirmations: 12,
      },
      {
        id: "usdt-bep20",
        name: "BNB Smart Chain (BEP-20)",
        protocol: "BSC",
        address: "0x55d398326f99059fF775485246999027B3197955",
        minDeposit: "100 USDT",
        estArrival: "~1-2 mins",
        confirmations: 15,
      },
    ],
  },
};

export const DEFAULT_CRYPTO_TOKEN = "BNB";

export interface BTCBRDigitOption {
  digits: 16 | 20 | 26 | 35;
  label: string;
  defaultAmount: string;
  approxUSD: number;
  description: string;
  tierBadge?: string;
}

export const BTCBR_DIGIT_OPTIONS: BTCBRDigitOption[] = [
  {
    digits: 16,
    label: "16 Digits",
    defaultAmount: "14,826,973,927,802",
    approxUSD: 500,
    description: "Standard 16-digit allocation",
    tierBadge: "Standard",
  },
  {
    digits: 20,
    label: "20 Digits",
    defaultAmount: "20,635,836,836,835,365,732",
    approxUSD: 1500,
    description: "High-yield 20-digit allocation",
    tierBadge: "Popular",
  },
  {
    digits: 26,
    label: "26 Digits",
    defaultAmount: "26,849,173,920,481,739,204,819,372",
    approxUSD: 5000,
    description: "Institutional 26-digit vault allocation",
    tierBadge: "Vault",
  },
  {
    digits: 35,
    label: "35 Digits",
    defaultAmount: "35,918,472,940,182,749,201,847,294,018,274,912",
    approxUSD: 25000,
    description: "Maximum 35-digit sovereign allocation",
    tierBadge: "Maximum",
  },
];

