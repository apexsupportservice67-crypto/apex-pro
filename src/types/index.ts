export type NavigationTab =
  | "dashboard"
  | "trading"
  | "deposit"
  | "withdraw"
  | "assets"
  | "signals"
  | "cold-storage"
  | "cards"
  | "investing"
  | "wallet"
  | "subscribe"
  | "settings";

export type AssetCategory = "crypto" | "equity" | "forex";

export interface Asset {
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  sparkline: number[];
  holdingAmount: number;
  holdingValueUSD: number;
  iconBg: string;
  tradingViewSymbol: string;
  chainBadge?: string;
  contractAddress?: string;
  subtitle?: string;
  coingeckoId?: string;
}

export type OrderType = "MARKET" | "LIMIT" | "STOP_LOSS";
export type OrderSide = "BUY" | "SELL"; // or LONG / SHORT

export interface TradePosition {
  id: string;
  symbol: string;
  assetName: string;
  side: OrderSide;
  orderType: OrderType;
  amount: number; // in USD invested
  units: number; // calculated crypto/stock units
  entryPrice: number;
  currentPrice: number;
  leverage: number; // 1 to 3
  duration: string; // "Perpetual", "24h", "1w"
  pnlUSD: number;
  pnlPercent: number;
  status: "OPEN" | "CLOSED";
  openTime: number;
  closeTime?: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
  liquidationPrice: number;
}

export type TransactionType = "deposit" | "withdraw" | "trade" | "swap" | "stake" | "vault_transfer";
export type TransactionStatus = "completed" | "processing" | "pending" | "failed";

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  asset: string;
  amount: number;
  amountUSD: number;
  status: TransactionStatus;
  timestamp: number;
  method?: string;
  destination?: string;
  txHash?: string;
  feeUSD: number;
}

export interface TradeSignal {
  id: string;
  symbol: string;
  name: string;
  action: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";
  timeframe: string;
  entryPrice: number;
  targetPrice: number;
  stopLossPrice: number;
  confidence: number; // e.g. 92
  rationale: string;
  indicators: string[];
  timestamp: string;
}

export interface ColdVault {
  id: string;
  name: string;
  balanceUSD: number;
  assets: { symbol: string; amount: number; valueUSD: number }[];
  status: "LOCKED" | "UNLOCKING" | "UNLOCKED";
  unlockInitiatedAt?: number;
  timelockHoursTotal: number;
  timelockHoursRemaining: number;
  multisigRequired: number;
  multisigSigned: number;
}

export interface DebitCard {
  id: string;
  cardNumber: string;
  fullCardNumber?: string;
  cardHolder: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  type: "VIRTUAL" | "PHYSICAL";
  isFrozen: boolean;
  spendingLimitUSD: number;
  currentSpentUSD: number;
  cashbackTier: string;
  cashbackRatePercent: number;
}

export interface StakingPool {
  id: string;
  symbol: string;
  name: string;
  apy: number;
  minStake: number;
  lockPeriodDays: number;
  stakedAmount: number;
  rewardsEarnedUSD: number;
  status: "ACTIVE" | "AVAILABLE";
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  tier: "PRO" | "BASIC";
  kycLevel: number;
  is2FAEnabled: boolean;
  connectedWalletAddress?: string;
  connectedWalletName?: string;
  joinedDate: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  user: UserProfile;
  fiatBalance: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "trade" | "security" | "deposit" | "system";
  read: boolean;
  timestamp: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "error" | "info" | "warning";
}
