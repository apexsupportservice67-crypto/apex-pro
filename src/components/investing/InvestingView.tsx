import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Coins,
  DollarSign,
  Flame,
  Gift,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Unlock,
  Zap,
} from "lucide-react";
import { useTradeStore } from "../../store/useTradeStore";
import { formatCrypto, formatUSD } from "../../lib/utils";
import { StakingPool } from "../../types";
import { AssetIcon } from "../ui/AssetIcon";

export const InvestingView: React.FC = () => {
  const { stakingPools, stakeAsset, unstakeAsset, claimStakingRewards, addToast } = useTradeStore();

  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [stakeMode, setStakeMode] = useState<"STAKE" | "UNSTAKE">("STAKE");
  const [stakeAmount, setStakeAmount] = useState<number>(1);

  const totalRewardsUSD = stakingPools.reduce((acc, p) => acc + p.rewardsEarnedUSD, 0);

  const handleOpenModal = (pool: StakingPool, mode: "STAKE" | "UNSTAKE") => {
    setSelectedPool(pool);
    setStakeMode(mode);
    setStakeAmount(mode === "STAKE" ? pool.minStake : pool.stakedAmount);
  };

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPool || stakeAmount <= 0) return;

    if (stakeMode === "STAKE") {
      stakeAsset(selectedPool.id, stakeAmount);
    } else {
      unstakeAsset(selectedPool.id, stakeAmount);
    }
    setSelectedPool(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-[#00ffa3]/15 text-[#00ffa3]">
              <Flame className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-[#00ffa3] uppercase tracking-wider">
              Apex Earn & Liquid Staking
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Institutional Yield Pools
          </h1>
          <p className="text-xs text-[#71717a] mt-1">
            Deposit assets into validator staking and automated treasury yield vaults for compounding passive returns.
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#0e0e12] border border-[#1c1c24]">
          <div>
            <div className="text-[10px] text-[#71717a] uppercase font-bold">Unclaimed Yield</div>
            <div className="text-lg font-bold text-[#00ffa3] font-mono">
              {formatUSD(totalRewardsUSD)}
            </div>
          </div>
          <button
            disabled={totalRewardsUSD <= 0}
            onClick={() => {
              stakingPools.forEach((p) => {
                if (p.rewardsEarnedUSD > 0) claimStakingRewards(p.id);
              });
            }}
            className="px-3.5 py-2 bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-bold text-xs rounded-xl transition-all disabled:opacity-40 shadow-md shadow-[#00ffa3]/20"
          >
            Claim All Yield
          </button>
        </div>
      </div>

      {/* Pools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stakingPools.map((pool) => {
          const hasStake = pool.stakedAmount > 0;

          return (
            <motion.div
              key={pool.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <AssetIcon
                      symbol={pool.symbol}
                      name={pool.name}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white">{pool.name}</h3>
                      <span className="text-[11px] text-[#71717a] font-mono">
                        {pool.lockPeriodDays === 0 ? "Flexible (Instant Unstake)" : `${pool.lockPeriodDays}-Day Lock`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-[#00ffa3] font-mono">
                      {pool.apy}% APY
                    </span>
                    <div className="text-[10px] text-[#71717a] font-bold uppercase">Compound Daily</div>
                  </div>
                </div>

                {/* Staked Stats Box */}
                <div className="mt-4 p-3.5 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#71717a] block">Your Staked Balance</span>
                    <span className="text-white font-bold">
                      {pool.stakedAmount} {pool.symbol}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717a] block">Accrued Rewards</span>
                    <span className="text-[#00ffa3] font-bold">
                      {formatUSD(pool.rewardsEarnedUSD)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => handleOpenModal(pool, "STAKE")}
                  className="flex-1 py-2.5 px-4 bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-bold text-xs rounded-xl shadow-md transition-all text-center"
                >
                  Stake {pool.symbol}
                </button>
                {hasStake && (
                  <button
                    onClick={() => handleOpenModal(pool, "UNSTAKE")}
                    className="py-2.5 px-4 bg-[#14141a] hover:bg-[#1e1e26] text-[#d4d4d8] font-bold text-xs rounded-xl transition-all border border-[#1c1c24]"
                  >
                    Unstake
                  </button>
                )}
                {pool.rewardsEarnedUSD > 0 && (
                  <button
                    onClick={() => claimStakingRewards(pool.id)}
                    className="py-2.5 px-3 bg-[#00ffa3]/10 hover:bg-[#00ffa3]/20 text-[#00ffa3] border border-[#00ffa3]/30 font-bold text-xs rounded-xl transition-all"
                    title="Claim accrued yield"
                  >
                    Claim
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Stake / Unstake Modal */}
      {selectedPool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleExecute}
            className="w-full max-w-md bg-[#0a0a0e] border border-[#1c1c24] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00ffa3]/15 text-[#00ffa3] flex items-center justify-center font-bold">
                {selectedPool.symbol}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {stakeMode === "STAKE" ? "Stake in" : "Unstake from"} {selectedPool.name}
                </h3>
                <p className="text-xs text-[#71717a] font-mono">
                  {selectedPool.apy}% APY • Min: {selectedPool.minStake} {selectedPool.symbol}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#d4d4d8] mb-1.5">
                Amount ({selectedPool.symbol})
              </label>
              <input
                type="number"
                step="any"
                min={stakeMode === "STAKE" ? selectedPool.minStake : 0.01}
                required
                value={stakeAmount || ""}
                onChange={(e) => setStakeAmount(parseFloat(e.target.value) || 0)}
                placeholder="1.0"
                className="w-full px-4 py-3 bg-[#0e0e12] border border-[#1c1c24] rounded-2xl text-lg font-mono font-bold text-white focus:outline-none focus:border-[#00ffa3]"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedPool(null)}
                className="w-1/3 py-3 bg-[#14141a] hover:bg-[#1e1e26] text-[#d4d4d8] font-bold rounded-2xl text-xs transition-all border border-[#1c1c24]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-black rounded-2xl text-xs shadow-lg shadow-[#00ffa3]/20 transition-all"
              >
                Confirm {stakeMode === "STAKE" ? "Stake" : "Unstake"}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
};
