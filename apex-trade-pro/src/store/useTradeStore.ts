import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Asset,
  ColdVault,
  DebitCard,
  NavigationTab,
  NotificationItem,
  OrderSide,
  OrderType,
  RegisteredUser,
  StakingPool,
  ToastMessage,
  TradePosition,
  TradeSignal,
  Transaction,
  UserProfile,
} from "../types";
import { generateId } from "../lib/utils";
import { hashPassword } from "../utils/crypto";
import { loadStoredRegisteredUsers, saveStoredRegisteredUsers } from "../utils/userStorage";
import {
  INITIAL_ASSETS,
  INITIAL_CARDS,
  INITIAL_POSITIONS,
  INITIAL_SIGNALS,
  INITIAL_STAKING,
  INITIAL_TRANSACTIONS,
  INITIAL_USER,
  INITIAL_VAULT,
} from "./mockData";

interface TradeStoreState {
  // Navigation & UI State
  activeTab: NavigationTab;
  isSidebarCollapsed: boolean;
  isTabletSidebarOpen: boolean;
  selectedTradeAsset: string;
  isMoveMoneyModalOpen: boolean;
  isWalletModalOpen: boolean;
  isAuthModalOpen: boolean;
  authMode: "login" | "signup";
  
  // User & Auth
  user: UserProfile | null;
  isAuthenticated: boolean;
  fiatBalance: number;
  registeredUsers: Record<string, RegisteredUser>;
  
  // Market & Trading
  assets: Asset[];
  positions: TradePosition[];
  transactions: Transaction[];
  signals: TradeSignal[];
  
  // Extra Services
  vault: ColdVault;
  cards: DebitCard[];
  stakingPools: StakingPool[];
  
  // Notifications & Toasts
  notifications: NotificationItem[];
  toasts: ToastMessage[];

  // Actions
  setActiveTab: (tab: NavigationTab) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleTabletSidebar: () => void;
  setTabletSidebarOpen: (open: boolean) => void;
  setSelectedTradeAsset: (symbol: string) => void;
  
  openMoveMoneyModal: () => void;
  closeMoveMoneyModal: () => void;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;

  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  checkEmailRegistered: (email: string) => Promise<{ registered: boolean; error?: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;

  depositFiat: (amount: number, method: string) => Promise<Transaction>;
  depositAsset: (amountUSD: number, assetSymbol: string, networkOrMethod?: string) => Promise<Transaction>;
  withdrawFiat: (amount: number, destination: string) => Promise<Transaction>;
  
  placeTrade: (order: {
    symbol: string;
    side: OrderSide;
    orderType: OrderType;
    amount: number;
    leverage: number;
    duration: string;
    takeProfit?: number;
    stopLoss?: number;
  }) => Promise<TradePosition>;
  
  closePosition: (positionId: string) => Promise<void>;
  
  toggleFreezeCard: (cardId: string) => void;
  updateCardLimit: (cardId: string, newLimit: number) => void;
  orderNewCard: (type: "VIRTUAL" | "PHYSICAL") => void;

  initiateVaultUnlock: () => void;
  cancelVaultUnlock: () => void;
  transferToVault: (amountUSD: number) => void;

  stakeAsset: (poolId: string, amount: number) => void;
  unstakeAsset: (poolId: string, amount: number) => void;
  claimStakingRewards: (poolId: string) => void;

  connectWallet: (name: string, address: string) => void;
  disconnectWallet: () => void;
  upgradeToPro: () => void;

  tickPrices: () => void;
  fetchLiveCoinGeckoPrices: () => Promise<void>;
  addToast: (title: string, description?: string, type?: "success" | "error" | "info" | "warning") => void;
  removeToast: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  clearAllLoginHistory: () => void;
  resetAllData: () => void;
}

export const useTradeStore = create<TradeStoreState>()(
  persist(
    (set, get) => ({
      activeTab: "dashboard",
      isSidebarCollapsed: false,
      isTabletSidebarOpen: false,
      selectedTradeAsset: "BTC",
      isMoveMoneyModalOpen: false,
      isWalletModalOpen: false,
      isAuthModalOpen: false,
      authMode: "login",

      user: null,
      isAuthenticated: false,
      fiatBalance: 0,
      registeredUsers: loadStoredRegisteredUsers(),

      assets: INITIAL_ASSETS,
      positions: INITIAL_POSITIONS,
      transactions: INITIAL_TRANSACTIONS,
      signals: INITIAL_SIGNALS,
      vault: INITIAL_VAULT,
      cards: INITIAL_CARDS,
      stakingPools: INITIAL_STAKING,

      notifications: [
        {
          id: "notif_1",
          title: "Welcome to Apex",
          message: "Create an account to access demo trading and live terminal markets.",
          type: "system",
          read: false,
          timestamp: Date.now() - 1000 * 60 * 60 * 5,
        },
      ],
      toasts: [],

      setActiveTab: (tab) => set({ activeTab: tab, isTabletSidebarOpen: false }),
      toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      toggleTabletSidebar: () => set((s) => ({ isTabletSidebarOpen: !s.isTabletSidebarOpen })),
      setTabletSidebarOpen: (open) => set({ isTabletSidebarOpen: open }),
      setSelectedTradeAsset: (symbol) => set({ selectedTradeAsset: symbol }),

      openMoveMoneyModal: () => set({ isMoveMoneyModalOpen: true }),
      closeMoveMoneyModal: () => set({ isMoveMoneyModalOpen: false }),
      openWalletModal: () => set({ isWalletModalOpen: true }),
      closeWalletModal: () => set({ isWalletModalOpen: false }),
      openAuthModal: (mode = "login") => set({ isAuthModalOpen: true, authMode: mode }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),

      login: async (email, password = "") => {
        // Simulate network latency
        await new Promise((r) => setTimeout(r, 600));
        const normalizedEmail = email?.trim().toLowerCase();
        if (!normalizedEmail || !normalizedEmail.includes("@")) {
          return { success: false, error: "Please provide a valid email address." };
        }

        // Sync and look up from both state and localStorage key
        const currentUsers = {
          ...loadStoredRegisteredUsers(),
          ...get().registeredUsers,
        };

        const registered = currentUsers[normalizedEmail];
        if (!registered) {
          return {
            success: false,
            error: "No account found with this email.",
          };
        }

        const inputHash = await hashPassword(password);
        // Compare with hashed password (or direct match for legacy transition)
        const isMatch = registered.passwordHash === inputHash || registered.passwordHash === password;

        if (!isMatch) {
          return {
            success: false,
            error: "Incorrect password.",
          };
        }

        set({
          user: registered.user,
          isAuthenticated: true,
          isAuthModalOpen: false,
          fiatBalance: registered.fiatBalance || 0,
        });
        get().addToast("Welcome back!", `Signed in as ${registered.user.name}`, "success");
        return { success: true };
      },

      signup: async (name, email, password = "") => {
        await new Promise((r) => setTimeout(r, 700));
        if (!name || name.trim().length < 2) {
          return { success: false, error: "Please enter your full name." };
        }
        const normalizedEmail = email?.trim().toLowerCase();
        if (!normalizedEmail || !normalizedEmail.includes("@")) {
          return { success: false, error: "Please enter a valid email address." };
        }

        const hasMinLength = password.length >= 8;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        if (!hasMinLength || !hasLetter || !hasNumber || !hasSpecial) {
          return {
            success: false,
            error: "Password must be at least 8 characters and include at least one letter, one number, and one special character.",
          };
        }

        const hashedPassword = await hashPassword(password);

        const newUser: UserProfile = {
          id: generateId("usr"),
          name: name.trim(),
          email: normalizedEmail,
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          tier: "BASIC",
          kycLevel: 1,
          is2FAEnabled: false,
          joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        };

        const registeredRecord: RegisteredUser = {
          id: newUser.id,
          name: newUser.name,
          email: normalizedEmail,
          passwordHash: hashedPassword,
          user: newUser,
          fiatBalance: 0,
        };

        const updatedUsers = {
          ...loadStoredRegisteredUsers(),
          ...get().registeredUsers,
          [normalizedEmail]: registeredRecord,
        };

        saveStoredRegisteredUsers(updatedUsers);

        set({
          registeredUsers: updatedUsers,
          user: newUser,
          isAuthenticated: true,
          isAuthModalOpen: false,
          fiatBalance: 0,
        });

        get().addToast("Account Created!", "Welcome to Apex Trade. Account created successfully.", "success");
        return { success: true };
      },

      checkEmailRegistered: async (email: string) => {
        await new Promise((r) => setTimeout(r, 400));
        const normalizedEmail = email?.trim().toLowerCase();
        if (!normalizedEmail || !normalizedEmail.includes("@")) {
          return { registered: false, error: "Please enter a valid email address." };
        }

        const currentUsers = {
          ...loadStoredRegisteredUsers(),
          ...get().registeredUsers,
        };

        if (!currentUsers[normalizedEmail]) {
          return {
            registered: false,
            error: "No account found with this email.",
          };
        }

        return { registered: true };
      },

      resetPassword: async (email: string, newPassword = "") => {
        await new Promise((r) => setTimeout(r, 600));
        const normalizedEmail = email?.trim().toLowerCase();
        if (!normalizedEmail || !normalizedEmail.includes("@")) {
          return { success: false, error: "Please enter a valid email address." };
        }

        const currentUsers = {
          ...loadStoredRegisteredUsers(),
          ...get().registeredUsers,
        };

        const existingRecord = currentUsers[normalizedEmail];
        if (!existingRecord) {
          return {
            success: false,
            error: "No account found with this email.",
          };
        }

        const hasMinLength = newPassword.length >= 8;
        const hasLetter = /[a-zA-Z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);
        const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

        if (!hasMinLength || !hasLetter || !hasNumber || !hasSpecial) {
          return {
            success: false,
            error: "Password must be at least 8 characters and include at least one letter, one number, and one special character.",
          };
        }

        const hashedPassword = await hashPassword(newPassword);
        const updatedRecord: RegisteredUser = {
          ...existingRecord,
          passwordHash: hashedPassword,
        };

        const updatedUsers = {
          ...currentUsers,
          [normalizedEmail]: updatedRecord,
        };

        saveStoredRegisteredUsers(updatedUsers);

        set({
          registeredUsers: updatedUsers,
        });

        get().addToast("Password Updated", "Your password has been reset successfully. Please log in.", "success");
        return { success: true };
      },

      logout: () => {
        set({ isAuthenticated: false, user: null, activeTab: "dashboard" });
        get().addToast("Signed Out", "You have securely signed out of your session.", "info");
      },

      updateProfile: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
        get().addToast("Profile Updated", "Your preferences have been saved successfully.", "success");
      },

      depositFiat: async (amount, method) => {
        await new Promise((r) => setTimeout(r, 800));

        const newTx: Transaction = {
          id: generateId("tx_dep"),
          type: "deposit",
          title: `Deposit via ${method}`,
          asset: "USD",
          amount: amount,
          amountUSD: amount,
          status: "completed",
          timestamp: Date.now(),
          method: method,
          txHash: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
          feeUSD: 0,
        };

        set((state) => ({
          fiatBalance: state.fiatBalance + amount,
          transactions: [newTx, ...state.transactions],
          notifications: [
            {
              id: generateId("notif"),
              title: "Deposit Successful",
              message: `$${amount.toLocaleString()} has been added to your balance.`,
              type: "deposit",
              read: false,
              timestamp: Date.now(),
            },
            ...state.notifications,
          ],
        }));

        get().addToast("Deposit Completed", `$${amount.toLocaleString()} added to your balance.`, "success");
        return newTx;
      },

      depositAsset: async (amountUSD: number, assetSymbol: string, networkOrMethod: string = "Verified Crypto Deposit") => {
        await new Promise((r) => setTimeout(r, 600));

        const state = get();
        const rawSymbol = (assetSymbol || "USDT").trim();

        // Find existing asset in current state matching symbol or name
        let targetIndex = state.assets.findIndex(
          (a) =>
            a.symbol.toLowerCase() === rawSymbol.toLowerCase() ||
            a.name.toLowerCase() === rawSymbol.toLowerCase()
        );

        let updatedAssets = [...state.assets];
        let tokenUnits = 0;
        let matchedSymbol = rawSymbol;

        if (targetIndex >= 0) {
          const existing = updatedAssets[targetIndex];
          matchedSymbol = existing.symbol;
          const currentPrice = existing.price > 0 ? existing.price : 1;
          tokenUnits = amountUSD / currentPrice;

          const newHoldingAmount = existing.holdingAmount + tokenUnits;
          const newHoldingValueUSD = Math.round(newHoldingAmount * currentPrice * 100) / 100;

          updatedAssets[targetIndex] = {
            ...existing,
            holdingAmount: newHoldingAmount,
            holdingValueUSD: newHoldingValueUSD,
          };
        } else {
          // If not in state, look up from INITIAL_ASSETS or create dynamically
          const template = INITIAL_ASSETS.find(
            (a) =>
              a.symbol.toLowerCase() === rawSymbol.toLowerCase() ||
              a.name.toLowerCase() === rawSymbol.toLowerCase()
          );

          if (template) {
            matchedSymbol = template.symbol;
            const currentPrice = template.price > 0 ? template.price : 1;
            tokenUnits = amountUSD / currentPrice;
            const newAsset: Asset = {
              ...template,
              holdingAmount: tokenUnits,
              holdingValueUSD: Math.round(amountUSD * 100) / 100,
            };
            updatedAssets.push(newAsset);
          } else {
            tokenUnits = amountUSD;
            matchedSymbol = rawSymbol.toUpperCase();
            const newAsset: Asset = {
              symbol: matchedSymbol,
              name: rawSymbol,
              category: "crypto",
              price: 1,
              change24h: 0,
              high24h: 1,
              low24h: 1,
              volume24h: 1000000,
              marketCap: 10000000,
              sparkline: [1, 1, 1, 1, 1, 1, 1],
              holdingAmount: tokenUnits,
              holdingValueUSD: amountUSD,
              iconBg: "from-emerald-500 to-teal-600",
              tradingViewSymbol: `BINANCE:${matchedSymbol}USDT`,
            };
            updatedAssets.push(newAsset);
          }
        }

        const formattedUnits =
          tokenUnits >= 1e9
            ? `${(tokenUnits / 1e9).toFixed(2)}B`
            : tokenUnits >= 1e6
            ? `${(tokenUnits / 1e6).toFixed(2)}M`
            : tokenUnits < 1
            ? tokenUnits.toFixed(6)
            : tokenUnits.toLocaleString(undefined, { maximumFractionDigits: 4 });

        const newTx: Transaction = {
          id: generateId("tx_dep"),
          type: "deposit",
          title: `Deposit ${formattedUnits} ${matchedSymbol} (${networkOrMethod})`,
          asset: matchedSymbol,
          amount: tokenUnits,
          amountUSD: amountUSD,
          status: "completed",
          timestamp: Date.now(),
          method: networkOrMethod,
          txHash: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
          feeUSD: 0,
        };

        set((s) => ({
          assets: updatedAssets,
          transactions: [newTx, ...s.transactions],
          notifications: [
            {
              id: generateId("notif"),
              title: "Crypto Deposit Credited",
              message: `${formattedUnits} ${matchedSymbol} ($${amountUSD.toLocaleString()}) credited to your holdings.`,
              type: "deposit",
              read: false,
              timestamp: Date.now(),
            },
            ...s.notifications,
          ],
        }));

        get().addToast(
          "Deposit Credited",
          `+$${amountUSD.toLocaleString()} (${formattedUnits} ${matchedSymbol}) added to holdings.`,
          "success"
        );

        return newTx;
      },

      withdrawFiat: async (amount, destination) => {
        const state = get();
        if (amount > state.fiatBalance) {
          throw new Error("Insufficient available USD balance.");
        }

        await new Promise((r) => setTimeout(r, 900));

        const newTx: Transaction = {
          id: generateId("tx_with"),
          type: "withdraw",
          title: `Withdrawal to ${destination}`,
          asset: "USD",
          amount: amount,
          amountUSD: amount,
          status: "completed",
          timestamp: Date.now(),
          destination: destination,
          txHash: `FEDWIRE-${Math.floor(100000 + Math.random() * 900000)}`,
          feeUSD: 0,
        };

        set((s) => ({
          fiatBalance: s.fiatBalance - amount,
          transactions: [newTx, ...s.transactions],
          notifications: [
            {
              id: generateId("notif"),
              title: "Withdrawal Sent",
              message: `$${amount.toLocaleString()} sent to ${destination}.`,
              type: "deposit",
              read: false,
              timestamp: Date.now(),
            },
            ...s.notifications,
          ],
        }));

        get().addToast("Withdrawal Processed", `$${amount.toLocaleString()} transferred.`, "success");
        return newTx;
      },

      placeTrade: async ({ symbol, side, orderType, amount, leverage, duration, takeProfit, stopLoss }) => {
        const state = get();
        if (amount > state.fiatBalance) {
          throw new Error("Insufficient balance to allocate margin for this position.");
        }

        const asset = state.assets.find((a) => a.symbol === symbol) || state.assets[0];
        const effectiveCapital = amount * leverage;
        const units = effectiveCapital / asset.price;

        const liquidationPrice = side === "BUY"
          ? asset.price * (1 - 0.9 / leverage)
          : asset.price * (1 + 0.9 / leverage);

        const newPosition: TradePosition = {
          id: generateId("pos"),
          symbol: asset.symbol,
          assetName: asset.name,
          side,
          orderType,
          amount,
          units: parseFloat(units.toFixed(6)),
          entryPrice: asset.price,
          currentPrice: asset.price,
          leverage,
          duration,
          pnlUSD: 0,
          pnlPercent: 0,
          status: "OPEN",
          openTime: Date.now(),
          takeProfitPrice: takeProfit,
          stopLossPrice: stopLoss,
          liquidationPrice: Math.max(0, parseFloat(liquidationPrice.toFixed(2))),
        };

        const newTx: Transaction = {
          id: generateId("tx_trade"),
          type: "trade",
          title: `${symbol} ${side === "BUY" ? "Long" : "Short"} (${leverage}x)`,
          asset: symbol,
          amount: newPosition.units,
          amountUSD: amount,
          status: "completed",
          timestamp: Date.now(),
          method: "Perp Margin Engine",
          feeUSD: 0,
        };

        set((s) => ({
          fiatBalance: s.fiatBalance - amount,
          positions: [newPosition, ...s.positions],
          transactions: [newTx, ...s.transactions],
          notifications: [
            {
              id: generateId("notif"),
              title: "Order Executed",
              message: `Opened ${side} ${symbol} (${leverage}x) for $${amount.toLocaleString()}.`,
              type: "trade",
              read: false,
              timestamp: Date.now(),
            },
            ...s.notifications,
          ],
        }));

        get().addToast(
          "Position Opened",
          `${side === "BUY" ? "Long" : "Short"} ${symbol} (${leverage}x) @ $${asset.price.toLocaleString()}`,
          "success"
        );

        return newPosition;
      },

      closePosition: async (positionId) => {
        const state = get();
        const pos = state.positions.find((p) => p.id === positionId);
        if (!pos || pos.status === "CLOSED") return;

        const returnedCapital = Math.max(0, pos.amount + pos.pnlUSD);

        const closedPos: TradePosition = {
          ...pos,
          status: "CLOSED",
          closeTime: Date.now(),
        };

        const newTx: Transaction = {
          id: generateId("tx_close"),
          type: "trade",
          title: `Closed ${pos.symbol} ${pos.side === "BUY" ? "Long" : "Short"}`,
          asset: pos.symbol,
          amount: pos.units,
          amountUSD: returnedCapital,
          status: "completed",
          timestamp: Date.now(),
          method: `P&L: ${pos.pnlUSD >= 0 ? "+" : ""}$${pos.pnlUSD.toFixed(2)}`,
          feeUSD: 0,
        };

        set((s) => ({
          fiatBalance: s.fiatBalance + returnedCapital,
          positions: s.positions.map((p) => (p.id === positionId ? closedPos : p)),
          transactions: [newTx, ...s.transactions],
          notifications: [
            {
              id: generateId("notif"),
              title: "Position Closed",
              message: `Realized ${pos.pnlUSD >= 0 ? "Profit" : "Loss"} of $${pos.pnlUSD.toFixed(2)} on ${pos.symbol}.`,
              type: "trade",
              read: false,
              timestamp: Date.now(),
            },
            ...s.notifications,
          ],
        }));

        get().addToast(
          pos.pnlUSD >= 0 ? "Trade Closed with Profit" : "Trade Closed",
          `P&L: ${pos.pnlUSD >= 0 ? "+" : ""}$${pos.pnlUSD.toFixed(2)} (${pos.pnlPercent.toFixed(2)}%)`,
          pos.pnlUSD >= 0 ? "success" : "info"
        );
      },

      toggleFreezeCard: (cardId) => {
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId ? { ...c, isFrozen: !c.isFrozen } : c
          ),
        }));
        const card = get().cards.find((c) => c.id === cardId);
        get().addToast(
          card?.isFrozen ? "Card Frozen" : "Card Unfrozen",
          `Your ${card?.cardNumber} has been ${card?.isFrozen ? "locked" : "reactivated"}.`,
          "info"
        );
      },

      updateCardLimit: (cardId, newLimit) => {
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId ? { ...c, spendingLimitUSD: newLimit } : c
          ),
        }));
        get().addToast("Spending Limit Updated", `New monthly limit: $${newLimit.toLocaleString()}`, "success");
      },

      orderNewCard: (type) => {
        const last4 = Math.floor(1000 + Math.random() * 9000).toString();
        const mid1 = Math.floor(1000 + Math.random() * 9000).toString();
        const mid2 = Math.floor(1000 + Math.random() * 9000).toString();
        const userHolder = get().user?.name?.trim() ? get().user!.name.trim().toUpperCase() : "ACCOUNT HOLDER";
        const expMonth = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, "0");
        const expYear = (new Date().getFullYear() + 4).toString().slice(-2);
        const cvv = Math.floor(100 + Math.random() * 900).toString();

        const newCard: DebitCard = {
          id: generateId("crd"),
          cardNumber: `4155 •••• •••• ${last4}`,
          fullCardNumber: `4155 ${mid1} ${mid2} ${last4}`,
          cardHolder: userHolder,
          expMonth,
          expYear,
          cvv,
          type,
          isFrozen: false,
          spendingLimitUSD: type === "PHYSICAL" ? 25000 : 5000,
          currentSpentUSD: 0,
          cashbackTier: type === "PHYSICAL" ? "Black Obsidian VIP" : "Pro Digital",
          cashbackRatePercent: type === "PHYSICAL" ? 3.5 : 2.0,
        };

        set((state) => ({ cards: [newCard, ...state.cards] }));
        get().addToast(
          `${type === "PHYSICAL" ? "Physical Metal" : "Virtual"} Card Issued`,
          "Your new card is ready for instant contactless & online spending.",
          "success"
        );
      },

      initiateVaultUnlock: () => {
        set((state) => ({
          vault: {
            ...state.vault,
            status: "UNLOCKING",
            unlockInitiatedAt: Date.now(),
            timelockHoursRemaining: state.vault.timelockHoursTotal,
          },
        }));
        get().addToast("Vault Timelock Initiated", "24-hour multi-signature security countdown started.", "warning");
      },

      cancelVaultUnlock: () => {
        set((state) => ({
          vault: {
            ...state.vault,
            status: "LOCKED",
            unlockInitiatedAt: undefined,
            timelockHoursRemaining: state.vault.timelockHoursTotal,
          },
        }));
        get().addToast("Timelock Cancelled", "Vault remains 100% cold-secured.", "info");
      },

      transferToVault: (amountUSD) => {
        const state = get();
        if (amountUSD > state.fiatBalance) {
          get().addToast("Insufficient Balance", "Cannot transfer more than available USD.", "error");
          return;
        }

        const newTx: Transaction = {
          id: generateId("tx_vlt"),
          type: "vault_transfer",
          title: "Transfer to Cold Vault",
          asset: "USD",
          amount: amountUSD,
          amountUSD: amountUSD,
          status: "completed",
          timestamp: Date.now(),
          destination: "Apex Cold Multi-Sig Vault",
          feeUSD: 0,
        };

        set((s) => ({
          fiatBalance: s.fiatBalance - amountUSD,
          vault: {
            ...s.vault,
            balanceUSD: s.vault.balanceUSD + amountUSD,
          },
          transactions: [newTx, ...s.transactions],
        }));

        get().addToast("Cold Storage Vault Funded", `$${amountUSD.toLocaleString()} moved into deep cold storage.`, "success");
      },

      stakeAsset: (poolId, amount) => {
        set((state) => ({
          stakingPools: state.stakingPools.map((p) =>
            p.id === poolId
              ? { ...p, stakedAmount: p.stakedAmount + amount, status: "ACTIVE" }
              : p
          ),
        }));
        const pool = get().stakingPools.find((p) => p.id === poolId);
        get().addToast("Staking Active", `Staked ${amount} ${pool?.symbol} @ ${pool?.apy}% APY`, "success");
      },

      unstakeAsset: (poolId, amount) => {
        set((state) => ({
          stakingPools: state.stakingPools.map((p) =>
            p.id === poolId
              ? {
                  ...p,
                  stakedAmount: Math.max(0, p.stakedAmount - amount),
                  status: p.stakedAmount - amount <= 0 ? "AVAILABLE" : "ACTIVE",
                }
              : p
          ),
        }));
        const pool = get().stakingPools.find((p) => p.id === poolId);
        get().addToast("Unstaked Successfully", `Withdrew ${amount} ${pool?.symbol} to available assets.`, "info");
      },

      claimStakingRewards: (poolId) => {
        const pool = get().stakingPools.find((p) => p.id === poolId);
        if (!pool || pool.rewardsEarnedUSD <= 0) return;

        const reward = pool.rewardsEarnedUSD;

        set((state) => ({
          fiatBalance: state.fiatBalance + reward,
          stakingPools: state.stakingPools.map((p) =>
            p.id === poolId ? { ...p, rewardsEarnedUSD: 0 } : p
          ),
        }));

        get().addToast("Rewards Claimed", `+$${reward.toFixed(2)} USD added to your balance.`, "success");
      },

      connectWallet: (name, address) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                connectedWalletName: name,
                connectedWalletAddress: address,
              }
            : null,
          isWalletModalOpen: false,
        }));
        get().addToast("Web3 Wallet Connected", `Synced ${name} (${address.slice(0, 6)}...${address.slice(-4)})`, "success");
      },

      disconnectWallet: () => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                connectedWalletName: undefined,
                connectedWalletAddress: undefined,
              }
            : null,
        }));
        get().addToast("Wallet Disconnected", "Web3 session disconnected.", "info");
      },

      upgradeToPro: () => {
        set((state) => ({
          user: state.user ? { ...state.user, tier: "PRO" } : null,
        }));
        get().addToast("Apex PRO Activated!", "Unlocked 0% maker fees, Level 2 depth & AI signals.", "success");
      },

      // Fetch real-time live market prices via CoinGecko API with graceful fallback
      fetchLiveCoinGeckoPrices: async () => {
        try {
          const coinGeckoIds = "bitcoin,ethereum,solana,binancecoin,baby-doge-coin,avalanche-2,sui,tether";
          const res = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_24hr_high=true&include_24hr_low=true&include_market_cap=true`
          );
          if (!res.ok) return;
          const data = await res.json();

          const idMap: Record<string, string> = {
            BTC: "bitcoin",
            ETH: "ethereum",
            SOL: "solana",
            BNB: "binancecoin",
            BabyDoge: "baby-doge-coin",
            BABYDOGE: "baby-doge-coin",
            AVAX: "avalanche-2",
            SUI: "sui",
            USDTZ: "tether",
            BTCBR: "bitcoin-br",
          };

          const currentAssets = get().assets;
          let changed = false;

          const updatedAssets = currentAssets.map((asset) => {
            const geckId = asset.coingeckoId || idMap[asset.symbol];
            if (!geckId || !data[geckId]) return asset;

            const coinData = data[geckId];
            const livePrice = coinData.usd;
            const liveChange = coinData.usd_24h_change ?? asset.change24h;
            const liveVol = coinData.usd_24h_vol ?? asset.volume24h;
            const liveCap = coinData.usd_market_cap ?? asset.marketCap;

            if (livePrice !== undefined && livePrice > 0) {
              changed = true;
              return {
                ...asset,
                price: livePrice,
                change24h: Math.round(liveChange * 100) / 100,
                volume24h: liveVol,
                marketCap: liveCap,
                high24h: Math.max(asset.high24h, livePrice),
                low24h: Math.min(asset.low24h, livePrice),
                holdingValueUSD: Math.round(asset.holdingAmount * livePrice * 100) / 100,
              };
            }
            return asset;
          });

          if (changed) {
            set({ assets: updatedAssets });
          }
        } catch {
          // Graceful fallback to simulated price ticks if CoinGecko is rate-limited
        }
      },

      // Real-Time Price Engine Ticker
      tickPrices: () => {
        const { assets, positions } = get();

        // Jitter each asset price slightly (-0.4% to +0.45% bias)
        const updatedAssets = assets.map((asset) => {
          const deltaFactor = 1 + (Math.random() * 0.007 - 0.0033);
          
          let newPrice: number;
          if (asset.price < 0.00001) {
            // High-precision preservation for micro tokens like BabyDoge
            newPrice = Number((asset.price * deltaFactor).toFixed(14));
          } else if (asset.price < 1) {
            newPrice = Math.round(asset.price * deltaFactor * 10000) / 10000;
          } else {
            newPrice = Math.round(asset.price * deltaFactor * 100) / 100;
          }

          const newChange24h = Math.round((asset.change24h + (Math.random() * 0.08 - 0.038)) * 100) / 100;
          const newSparkline = [...asset.sparkline.slice(1), newPrice];

          return {
            ...asset,
            price: newPrice,
            change24h: newChange24h,
            high24h: Math.max(asset.high24h, newPrice),
            low24h: Math.min(asset.low24h, newPrice),
            sparkline: newSparkline,
            holdingValueUSD: Math.round(asset.holdingAmount * newPrice * 100) / 100,
          };
        });

        // Update open positions PnL based on live prices
        const updatedPositions = positions.map((pos) => {
          if (pos.status !== "OPEN") return pos;
          const asset = updatedAssets.find((a) => a.symbol === pos.symbol);
          if (!asset) return pos;

          const priceDiff = asset.price - pos.entryPrice;
          const pnlPercentRaw = pos.side === "BUY"
            ? (priceDiff / pos.entryPrice) * 100 * pos.leverage
            : (-priceDiff / pos.entryPrice) * 100 * pos.leverage;

          const pnlUSD = (pos.amount * pnlPercentRaw) / 100;

          return {
            ...pos,
            currentPrice: asset.price,
            pnlUSD: Math.round(pnlUSD * 100) / 100,
            pnlPercent: Math.round(pnlPercentRaw * 100) / 100,
          };
        });

        set({ assets: updatedAssets, positions: updatedPositions });
      },

      addToast: (title, description, type = "info") => {
        const id = generateId("toast");
        set((state) => ({
          toasts: [...state.toasts, { id, title, description, type }],
        }));
        setTimeout(() => {
          get().removeToast(id);
        }, 4000);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      clearAllNotifications: () => {
        set({ notifications: [] });
      },

      clearAllLoginHistory: () => {
        try {
          if (typeof window !== "undefined") {
            localStorage.removeItem("apex_registered_users");
            localStorage.removeItem("apex_admin_auth_token");
          }
        } catch (e) {
          console.error("Failed to clear login history:", e);
        }
        set({
          user: null,
          isAuthenticated: false,
          registeredUsers: {},
        });
        get().addToast("Login History Purged", "All cached login sessions and saved user accounts were removed.", "info");
      },

      resetAllData: () => {
        try {
          localStorage.clear();
        } catch (e) {
          console.error("Failed to clear localStorage:", e);
        }
        set({
          user: null,
          isAuthenticated: false,
          fiatBalance: 0,
          registeredUsers: {},
          assets: INITIAL_ASSETS,
          positions: INITIAL_POSITIONS,
          transactions: INITIAL_TRANSACTIONS,
          signals: INITIAL_SIGNALS,
          vault: INITIAL_VAULT,
          cards: INITIAL_CARDS,
          stakingPools: INITIAL_STAKING,
        });
        get().addToast("Database Reset", "Restored platform state to clean setup.", "info");
      },
    }),
    {
      name: "apex_trade_platform_storage_v7",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        fiatBalance: state.fiatBalance,
        registeredUsers: state.registeredUsers,
        assets: state.assets,
        positions: state.positions,
        transactions: state.transactions,
        signals: state.signals,
        vault: state.vault,
        cards: state.cards,
        stakingPools: state.stakingPools,
      }),
    }
  )
);
