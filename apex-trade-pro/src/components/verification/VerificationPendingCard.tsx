import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { verificationService, VerificationRequestData } from "../../services/verificationService";
import { useVerificationStore } from "../../store/useVerificationStore";
import { useTradeStore } from "../../store/useTradeStore";
import { useRouter } from "../../context/RouterContext";
import { formatUSD, formatTimestamp } from "../../lib/utils";

interface VerificationPendingCardProps {
  requestId: string;
  onClose?: () => void;
  onApprovedRedirect?: () => void;
}

export const VerificationPendingCard: React.FC<VerificationPendingCardProps> = ({
  requestId,
  onClose,
  onApprovedRedirect,
}) => {
  const router = useRouter();
  const { currentRequest, updateCurrentRequest, clearPendingRequest, setLastApprovedToken } =
    useVerificationStore();
  const { depositFiat, depositAsset, addToast } = useTradeStore();

  const [requestData, setRequestData] = useState<VerificationRequestData | null>(currentRequest);
  const [loading, setLoading] = useState<boolean>(!currentRequest);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [pollCount, setPollCount] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const hasHandledApproval = useRef<boolean>(false);

  // Poll status from backend
  const fetchStatus = async () => {
    try {
      const data = await verificationService.getStatus(requestId);
      setRequestData(data);
      updateCurrentRequest(data);
      setPollCount((prev) => prev + 1);

      if (data.status === "approved" && !hasHandledApproval.current) {
        hasHandledApproval.current = true;
        setIsPolling(false);
        setLastApprovedToken(data.accessToken || null);

        // Credit the deposit into user's account if it's a deposit request
        if (data.amountUSD > 0) {
          const methodLabel = `${data.protocol || "Verified Deposit"}`;
          if (data.asset && data.asset.toUpperCase() !== "USD") {
            depositAsset(data.amountUSD, data.asset, methodLabel).catch(() => {});
          } else {
            depositFiat(data.amountUSD, methodLabel).catch(() => {});
          }
        }

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });

        addToast("Verification Approved!", "Admin has approved your request. Redirecting...", "success");

        // Automatically navigate to protected /new-page after 1.8s
        setTimeout(() => {
          if (onApprovedRedirect) {
            onApprovedRedirect();
          } else {
            router.push(`/new-page?requestId=${encodeURIComponent(data.id)}&token=${encodeURIComponent(data.accessToken || "")}`);
          }
        }, 1800);
      } else if (data.status === "rejected") {
        setIsPolling(false);
        addToast("Verification Rejected", data.rejectionReason || "Request was not approved.", "error");
      } else if (data.status === "expired") {
        setIsPolling(false);
        addToast("Verification Expired", "Request timed out.", "warning");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to check status.");
    } finally {
      setLoading(false);
    }
  };

  // Set up polling interval every 3.5 seconds
  useEffect(() => {
    fetchStatus();

    const interval = setInterval(() => {
      if (isPolling) {
        fetchStatus();
      }
    }, 3500);

    return () => {
      clearInterval(interval);
    };
  }, [requestId, isPolling]);

  // Expiration countdown timer calculation
  useEffect(() => {
    if (!requestData?.expiresAt) return;

    const updateTimer = () => {
      const diff = requestData.expiresAt - Date.now();
      if (diff <= 0) {
        setTimeRemaining("00:00 (Expired)");
        if (requestData.status === "pending") {
          fetchStatus();
        }
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [requestData?.expiresAt, requestData?.status]);

  const handleCancel = () => {
    clearPendingRequest();
    if (onClose) onClose();
  };

  const status = requestData?.status || "pending";

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] shadow-2xl p-6 sm:p-7 text-white relative overflow-hidden">
      {/* Background ambient glow based on status */}
      <div
        className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all ${
          status === "approved"
            ? "bg-[#00ffa3]/20"
            : status === "rejected"
            ? "bg-rose-500/20"
            : status === "expired"
            ? "bg-amber-500/20"
            : "bg-[#00ffa3]/10"
        }`}
      />

      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* STATE 1: PENDING AWAITING APPROVAL */}
        {/* ========================================================================= */}
        {status === "pending" && (
          <motion.div
            key="status-pending"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Header Badge */}
            <div className="flex items-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                PENDING REVIEW
              </span>
            </div>

            {/* Icon & Title */}
            <div className="text-center space-y-2 pt-2">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#121218] border border-[#22222e] flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                </div>
              </div>

              <h2 className="text-xl font-black tracking-tight text-white">
                Verification Pending
              </h2>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed max-w-sm mx-auto">
                Your request has been submitted and is awaiting administrator approval.
              </p>
            </div>

            {/* Request Summary Card */}
            <div className="p-4 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[#71717a]">Request ID:</span>
                <span className="text-white font-bold">{requestData?.id || requestId}</span>
              </div>
              {requestData?.amountUSD !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-[#71717a]">Amount:</span>
                  <span className="text-[#00ffa3] font-bold">
                    {requestData.btcbrAmount
                      ? `${requestData.btcbrAmount} BTCBR`
                      : `${formatUSD(requestData.amountUSD)} (${requestData.asset})`}
                  </span>
                </div>
              )}
              {requestData?.btcbrDigits && (
                <div className="flex justify-between items-center">
                  <span className="text-[#71717a]">Deposit Length:</span>
                  <span className="text-[#00ffa3] font-mono">
                    {requestData.btcbrDigits} Digits
                  </span>
                </div>
              )}
              {requestData?.protocol && (
                <div className="flex justify-between items-center">
                  <span className="text-[#71717a]">Network/Protocol:</span>
                  <span className="text-white">{requestData.protocol}</span>
                </div>
              )}
              {requestData?.createdAt && (
                <div className="flex justify-between items-center">
                  <span className="text-[#71717a]">Submitted:</span>
                  <span className="text-[#a1a1aa]">{formatTimestamp(requestData.createdAt)}</span>
                </div>
              )}
              {timeRemaining && (
                <div className="flex justify-between items-center pt-2 border-t border-[#1c1c24]">
                  <span className="text-[#71717a]">Expires in:</span>
                  <span className="text-amber-400 font-bold">{timeRemaining}</span>
                </div>
              )}
            </div>

            {/* Status Pulse Indicator & Polling Info */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#121218] border border-[#1e1e28] text-[11px] text-[#a1a1aa]">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-3.5 h-3.5 text-[#00ffa3] ${loading ? "animate-spin" : ""}`} />
                <span>Checking status in background...</span>
              </div>
              <span className="font-mono text-[#71717a] font-bold">#{pollCount} polls</span>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={fetchStatus}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-[#14141a] hover:bg-[#1e1e26] text-[#d4d4d8] font-bold text-xs border border-[#22222e] transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#00ffa3]" : ""}`} />
                <span>Refresh Status</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="py-3 px-4 rounded-xl bg-transparent hover:bg-rose-500/10 text-rose-400 font-bold text-xs border border-transparent hover:border-rose-500/20 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STATE 2: APPROVED */}
        {/* ========================================================================= */}
        {status === "approved" && (
          <motion.div
            key="status-approved"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-5 py-2"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/40 flex items-center justify-center shadow-xl shadow-[#00ffa3]/20">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30">
                APPROVED BY ADMINISTRATOR
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight pt-2">
                Verification Successful!
              </h2>
              <p className="text-xs sm:text-sm text-[#a1a1aa]">
                Your transaction has been verified and authenticated. Redirecting to your protected portal...
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e0e12] border border-[#00ffa3]/30 space-y-2 text-xs font-mono text-left">
              <div className="flex justify-between items-center">
                <span className="text-[#71717a]">Status:</span>
                <span className="text-[#00ffa3] font-bold">APPROVED & CREDITED</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#71717a]">Credited Amount:</span>
                <span className="text-[#00ffa3] font-bold">
                  {requestData?.btcbrAmount
                    ? `${requestData.btcbrAmount} BTCBR`
                    : formatUSD(requestData?.amountUSD || 0)}
                </span>
              </div>
              {requestData?.approvedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-[#71717a]">Approved At:</span>
                  <span className="text-[#a1a1aa]">{formatTimestamp(requestData.approvedAt)}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (onApprovedRedirect) {
                  onApprovedRedirect();
                } else {
                  router.push(
                    `/new-page?requestId=${encodeURIComponent(requestData?.id || requestId)}&token=${encodeURIComponent(
                      requestData?.accessToken || ""
                    )}`
                  );
                }
              }}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#00ffa3] to-teal-400 hover:from-[#00ffa3]/90 hover:to-teal-300 text-black font-black text-sm transition-all shadow-lg shadow-[#00ffa3]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Access Protected Page Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STATE 3: REJECTED */}
        {/* ========================================================================= */}
        {status === "rejected" && (
          <motion.div
            key="status-rejected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-5 py-2"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/40 flex items-center justify-center shadow-xl shadow-rose-500/20">
              <XCircle className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                REQUEST REJECTED
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight pt-2">
                Verification Rejected
              </h2>
              <p className="text-xs sm:text-sm text-rose-300">
                Your request was not approved. Please try again.
              </p>
            </div>

            {requestData?.rejectionReason && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-left text-xs space-y-1">
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Reason from Administrator:</span>
                </div>
                <p className="text-[#d4d4d8] leading-relaxed pl-5 font-mono">
                  {requestData.rejectionReason}
                </p>
              </div>
            )}

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3.5 px-5 rounded-2xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-extrabold text-sm transition-all shadow-md shadow-[#00ffa3]/20"
              >
                Submit New Request
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STATE 4: EXPIRED */}
        {/* ========================================================================= */}
        {status === "expired" && (
          <motion.div
            key="status-expired"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-5 py-2"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-xl shadow-amber-500/20">
              <AlertCircle className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                EXPIRED
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight pt-2">
                Verification Expired
              </h2>
              <p className="text-xs sm:text-sm text-[#a1a1aa]">
                This verification request timed out before administrator review was completed.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#14141a] hover:bg-[#1e1e26] text-white font-extrabold text-sm border border-[#22222e] transition-all"
            >
              Start Over
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
