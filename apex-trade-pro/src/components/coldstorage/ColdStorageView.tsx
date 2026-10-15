import React, { useState } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  ArrowDownLeft,
  CheckCircle2,
  Hourglass,
  Key,
  Lock,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  Zap,
} from "lucide-react";
import { useTradeStore } from "../../store/useTradeStore";
import { formatUSD } from "../../lib/utils";
import { AssetIcon } from "../ui/AssetIcon";

export const ColdStorageView: React.FC = () => {
  const {
    vault,
    fiatBalance,
    initiateVaultUnlock,
    cancelVaultUnlock,
    transferToVault,
    addToast,
  } = useTradeStore();

  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);

  const handleDepositToVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) {
      addToast("Invalid Amount", "Please enter an amount greater than $0.", "error");
      return;
    }
    if (depositAmount > fiatBalance) {
      addToast("Insufficient Balance", "Amount exceeds available cash.", "error");
      return;
    }
    transferToVault(depositAmount);
    setIsDepositOpen(false);
    setDepositAmount(5000);
  };

  const isLocked = vault.status === "LOCKED";
  const isUnlocking = vault.status === "UNLOCKING";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Hero Header */}
      <div className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-[#00ffa3]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-[#00ffa3]/15 text-[#00ffa3]">
                <Lock className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-[#00ffa3] uppercase tracking-wider">
                Institutional Cold Storage
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
              {formatUSD(vault.balanceUSD)}
            </h1>
            <p className="text-xs text-[#71717a] mt-1">
              Secured under air-gapped 3-of-3 HSM multi-signature consensus with 24h timelock delay.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-bold text-xs rounded-xl shadow-lg shadow-[#00ffa3]/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Lock Funds in Vault</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vault Status Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Status Card */}
        <div className="p-6 rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] shadow-xl space-y-3">
          <span className="text-xs font-bold text-[#71717a] uppercase tracking-wider">
            Vault Lock Status
          </span>
          <div className="flex items-center gap-2">
            {isLocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30">
                <ShieldCheck className="w-4 h-4 text-[#00ffa3]" />
                100% Cold Secured
              </span>
            ) : isUnlocking ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Hourglass className="w-4 h-4 text-amber-400 animate-spin" />
                24h Timelock Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <Unlock className="w-4 h-4 text-rose-400" />
                Unlocked
              </span>
            )}
          </div>
          <p className="text-xs text-[#71717a] leading-snug">
            All private key shards are isolated inside physical FIPS 140-2 Level 3 hardware security modules.
          </p>
        </div>

        {/* Multi-Sig Signers */}
        <div className="p-6 rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] shadow-xl space-y-3">
          <span className="text-xs font-bold text-[#71717a] uppercase tracking-wider">
            Multi-Sig Authorization
          </span>
          <div className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <Key className="w-4 h-4 text-[#00ffa3]" />
            <span>{vault.multisigSigned} of {vault.multisigRequired} Keys Signed</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-[#71717a] font-mono">
            <div className="flex justify-between">
              <span>Shard 1: User Biometric Passkey</span>
              <span className="text-[#00ffa3] font-bold">Verified ✓</span>
            </div>
            <div className="flex justify-between">
              <span>Shard 2: Apex Co-Signer Node</span>
              <span className="text-[#00ffa3] font-bold">Verified ✓</span>
            </div>
            <div className="flex justify-between">
              <span>Shard 3: Institutional Backup HSM</span>
              <span className="text-[#00ffa3] font-bold">Verified ✓</span>
            </div>
          </div>
        </div>

        {/* Timelock Action */}
        <div className="p-6 rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] shadow-xl flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-bold text-[#71717a] uppercase tracking-wider">
              Emergency Timelock Protocol
            </span>
            <p className="text-xs text-[#71717a] mt-1 leading-snug">
              Withdrawals require a mandatory 24-hour cooling window to defend against extortion or breach.
            </p>
          </div>

          {isLocked ? (
            <button
              onClick={initiateVaultUnlock}
              className="w-full py-2.5 px-4 bg-[#14141a] hover:bg-amber-500 hover:text-black text-[#d4d4d8] font-bold text-xs rounded-xl transition-all shadow-md border border-[#1c1c24]"
            >
              Initiate 24h Unlock Request
            </button>
          ) : (
            <button
              onClick={cancelVaultUnlock}
              className="w-full py-2.5 px-4 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold text-xs rounded-xl transition-all border border-rose-500/30"
            >
              Cancel Unlock & Re-Lock Vault
            </button>
          )}
        </div>
      </div>

      {/* Vault Assets Table */}
      <div className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">Assets In Cold Custody</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1c1c24] text-[#71717a] font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-3">Asset</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Estimated USD Value</th>
                <th className="pb-3 text-right pr-3">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1c24]/60 font-mono">
              {vault.assets.map((asset) => (
                <tr key={asset.symbol} className="hover:bg-[#0e0e12]/80 transition-colors">
                  <td className="py-4 pl-3 font-sans">
                    <div className="flex items-center gap-2.5">
                      <AssetIcon
                        symbol={asset.symbol}
                        size="sm"
                      />
                      <span className="font-bold text-white">{asset.symbol}</span>
                    </div>
                  </td>
                  <td className="py-4 text-[#d4d4d8] font-bold">
                    {asset.amount} {asset.symbol}
                  </td>
                  <td className="py-4 text-[#00ffa3] font-bold">
                    {formatUSD(asset.valueUSD)}
                  </td>
                  <td className="py-4 text-right pr-3 text-[#71717a]">
                    {Math.round((asset.valueUSD / vault.balanceUSD) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit to Vault Modal */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleDepositToVault}
            className="w-full max-w-md bg-[#0a0a0e] border border-[#1c1c24] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00ffa3]/15 text-[#00ffa3] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Transfer to Cold Vault</h3>
                <p className="text-xs text-[#71717a]">Move cash into multi-sig cold storage</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#d4d4d8]">Amount (USD)</span>
                <span className="text-[#71717a] font-mono">
                  Cash: <strong className="text-[#00ffa3]">{formatUSD(fiatBalance)}</strong>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#71717a]">$</span>
                <input
                  type="number"
                  min="1"
                  max={fiatBalance}
                  required
                  value={depositAmount || ""}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                  placeholder="5000"
                  className="w-full pl-8 pr-4 py-3 bg-[#0e0e12] border border-[#1c1c24] rounded-2xl text-lg font-mono font-bold text-white focus:outline-none focus:border-[#00ffa3]"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsDepositOpen(false)}
                className="w-1/3 py-3 bg-[#14141a] hover:bg-[#1e1e26] text-[#d4d4d8] font-bold rounded-2xl text-xs transition-all border border-[#1c1c24]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-bold rounded-2xl text-xs shadow-lg shadow-[#00ffa3]/20 transition-all"
              >
                Lock {formatUSD(depositAmount)}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
};
