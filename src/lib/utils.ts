import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSD(value: number, decimals?: number): string {
  if (value === 0) return "$0.00";
  if (decimals !== undefined) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
  if (Math.abs(value) < 0.00001 && Math.abs(value) > 0) {
    // For micro-cap tokens like BabyDoge (e.g. $0.000000002185)
    return `$${value.toFixed(10).replace(/0+$/, "")}`;
  }
  if (Math.abs(value) < 1 && Math.abs(value) > 0) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPrice(value: number): string {
  if (value === 0) return "$0.00";
  if (Math.abs(value) < 0.00001 && Math.abs(value) > 0) {
    return `$${value.toFixed(10).replace(/0+$/, "")}`;
  }
  if (Math.abs(value) < 1 && Math.abs(value) > 0) {
    return `$${value.toFixed(4)}`;
  }
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCrypto(value: number, decimals: number = 4): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

export function formatHoldingAmount(amount: number | string | bigint, symbol: string): string {
  const sym = (symbol || "").toUpperCase();
  if (sym === "BTCBR") {
    if (!amount || amount === 0 || amount === "0") return `0 ${symbol}`;
    const cleanStr = String(amount).split(".")[0].replace(/[^\d]/g, "");
    if (!cleanStr) return `0 ${symbol}`;
    // Format whole number with commas without any decimal places
    return `${cleanStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${symbol}`;
  }

  const num = typeof amount === "number" ? amount : parseFloat(String(amount)) || 0;
  if (!num || num <= 0) return `0.00 ${symbol}`;
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B ${symbol}`;
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(2)}M ${symbol}`;
  }
  if (num >= 1000) {
    return `${num.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${symbol}`;
  }
  if (num >= 1) {
    return `${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${symbol}`;
  }
  if (num >= 0.0001) {
    return `${num.toFixed(6)} ${symbol}`;
  }
  return `${num.toFixed(10).replace(/0+$/, "")} ${symbol}`;
}

/**
 * Format holding USD values: for BTCBR, returns whole number with commas ($0 or $14,826);
 * for other assets, returns standard formatUSD.
 */
export function formatAssetValueUSD(value: number, symbol?: string): string {
  if (symbol && symbol.toUpperCase() === "BTCBR") {
    if (!value || value <= 0) return "$0";
    const rounded = Math.round(value);
    return `$${rounded.toLocaleString("en-US")}`;
  }
  return formatUSD(value);
}

/**
 * Formats a BTCBR whole number (integer or digit string) with comma separators and zero decimals.
 */
export function formatBTCBRAmount(value: string | number | bigint): string {
  const digitsOnly = String(value).split(".")[0].replace(/[^\d]/g, "");
  if (!digitsOnly) return "0";
  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format any large integer string or BigInt with commas.
 */
export function formatBigIntWithCommas(value: string | number | bigint): string {
  return formatBTCBRAmount(value);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  }).format(value);
}

export function generateId(prefix: string = "tx"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

export function formatTimestamp(date: string | number | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
    ", " +
    d.toLocaleDateString([], { month: "short", day: "numeric" });
}
