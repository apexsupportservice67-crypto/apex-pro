import React from "react";
import { motion } from "motion/react";
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  HardDrive,
  Lock,
  Plus,
  Send,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { useTradeStore } from "../../store/useTradeStore";
import { formatUSD } from "../../lib/utils";

export const MoveMoneyModal: React.FC = () => {
  const {
    isMoveMoneyModalOpen,
    closeMoveMoneyModal,
    fiatBalance,
    setActiveTab,
    openWalletModal,
  } = useTradeStore();

  if (!isMoveMoneyModalOpen) return null;

  const actions = [
    {
      title: "Deposit Cash or Crypto",
      desc: "Add USD via Instant Bank ACH, Wire, Debit Card, or Web3 crypto transfer",
      icon: ArrowDownLeft,
      color: "from-emerald-500 to-teal-600",
      action: () => {
        closeMoveMoneyModal();
        setActiveTab("deposit");
      },
    },
    {
      title: "Withdraw Funds",
      desc: "Transfer USD to verified checking accounts or external hardware wallets",
      icon: ArrowUpRight,
      color: "from-blue-500 to-indigo-600",
      action: () => {
        closeMoveMoneyModal();
        setActiveTab("withdraw");
      },
    },
    {
      title: "Transfer to Cold Storage",
      desc: "Lock funds in multi-sig 24h timelocked institutional deep storage",
      icon: Lock,
      color: "from-purple-500 to-violet-700",
      action: () => {
        closeMoveMoneyModal();
        setActiveTab("cold-storage");
      },
    },
    {
      title: "Connect External Web3 Wallet",
      desc: "Link MetaMask, Phantom or Coinbase Wallet for decentralized settlement",
      icon: Wallet,
      color: "from-amber-500 to-orange-600",
      action: () => {
        closeMoveMoneyModal();
        openWalletModal();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-[#0a0a0e] border border-[#1c1c24] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
      >
        <button
          onClick={closeMoveMoneyModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#71717a] hover:text-white hover:bg-[#14141a] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-[11px] font-bold text-[#00ffa3] uppercase tracking-wider">
            Liquidity Hub
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">Move Money</h3>
          <p className="text-xs text-[#71717a] mt-1">
            Available Cash: <span className="text-white font-mono font-bold">{formatUSD(fiatBalance)}</span>
          </p>
        </div>

        <div className="space-y-3">
          {actions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={item.action}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#0e0e12] hover:bg-[#14141a] border border-[#1c1c24] hover:border-[#262633] transition-all text-left group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white group-hover:text-[#00ffa3] transition-colors">
                    {item.title}
                  </div>
                  <div className="text-xs text-[#71717a] mt-0.5 leading-snug line-clamp-2">
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
