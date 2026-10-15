import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Key,
  LineChart,
  Lock,
  PieChart,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { verificationService } from "../../services/verificationService";
import { useVerificationStore } from "../../store/useVerificationStore";
import { useTradeStore } from "../../store/useTradeStore";
import { useRouter } from "../../context/RouterContext";
import { formatUSD, formatTimestamp } from "../../lib/utils";

export const ProtectedNewPage: React.FC = () => {
  const router = useRouter();
  const { pendingRequestId, lastApprovedToken } = useVerificationStore();
  const { fiatBalance, setActiveTab, addToast } = useTradeStore();

  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedPayload, setVerifiedPayload] = useState<any>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  useEffect(() => {
    // Extract query params from URL search or hash fallback
    let reqId = pendingRequestId;
    let token = lastApprovedToken;

    if (typeof window !== "undefined") {
      // 1. Check window.location.search
      const searchParams = new URLSearchParams(window.location.search);
      const urlReqId = searchParams.get("requestId") || searchParams.get("id");
      const urlToken = searchParams.get("token") || searchParams.get("accessToken");
      if (urlReqId) reqId = urlReqId;
      if (urlToken) token = urlToken;

      // 2. Check window.location.hash fallback (in case URL was formatted with hash)
      if (!reqId && window.location.hash) {
        const hashClean = window.location.hash.replace(/^#/, "");
        const hashParams = new URLSearchParams(hashClean.includes("?") ? hashClean.split("?")[1] : hashClean);
        const hashReqId = hashParams.get("requestId") || hashParams.get("id");
        const hashToken = hashParams.get("token") || hashParams.get("accessToken");
        if (hashReqId) reqId = hashReqId;
        if (hashToken) token = hashToken;
      }
    }

    if (!reqId) {
      setIsVerifying(false);
      setIsAuthorized(false);
      setVerificationError("Access Denied: No verification request ID provided. Direct URL navigation is prohibited.");
      return;
    }

    const checkBackendAuthorization = async () => {
      setIsVerifying(true);
      try {
        const result = await verificationService.verifyAccess(reqId!, token || undefined);
        if (result.authorized && result.verifiedData) {
          setIsAuthorized(true);
          setVerifiedPayload(result.verifiedData);
        } else {
          setIsAuthorized(false);
          setVerificationError(
            result.message || "Access Denied: Verification is either pending, expired, or invalid."
          );
        }
      } catch (err: any) {
        setIsAuthorized(false);
        setVerificationError(err.message || "Failed to authenticate verification status with backend.");
      } finally {
        setIsVerifying(false);
      }
    };

    checkBackendAuthorization();
  }, [pendingRequestId, lastApprovedToken]);

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    addToast("Settlement reference copied!", "success");
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // -------------------------------------------------------------
  // RENDER: Verifying State
  // -------------------------------------------------------------
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#00ffa3]/10 border border-[#00ffa3]/30 text-[#00ffa3] flex items-center justify-center mx-auto shadow-xl shadow-[#00ffa3]/15">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Authenticating Protected Route</h2>
            <p className="text-xs text-[#a1a1aa] font-mono mt-1">
              Verifying cryptographic approval credentials with backend API...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Unauthorized / Access Denied State
  // -------------------------------------------------------------
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center p-4 text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl bg-[#0e0e12] border border-rose-500/30 p-7 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

          {/* Shield Icon */}
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto shadow-xl shadow-rose-500/20">
            <ShieldAlert className="w-9 h-9 stroke-[2.5]" />
          </div>

          <div className="space-y-1.5">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              403 FORBIDDEN • PROTECTED RESOURCE
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight pt-2">
              Access Restricted
            </h1>
            <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
              This destination page requires a verified and administrator-approved request. Direct URL access is prohibited by server security policy.
            </p>
          </div>

          {/* Error Details */}
          {verificationError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-left text-xs font-mono text-rose-300">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Backend Authorization Response:</span>
              </div>
              <p className="text-[#d4d4d8] text-[11px] leading-relaxed pl-5">
                {verificationError}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("deposit");
                router.push("/dashboard");
              }}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-[#00ffa3]/20 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Verification Request Page</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="w-full py-3 px-4 rounded-2xl bg-[#14141c] hover:bg-[#1e1e28] text-[#a1a1aa] hover:text-white font-bold text-xs border border-[#22222e] transition-all flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-[#00ffa3]" />
              <span>Open Admin Dashboard to Approve Request</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Authorized Protected Page
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-[#181820] bg-[#0c0c10] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00ffa3]/15 border border-[#00ffa3]/40 text-[#00ffa3] flex items-center justify-center font-black text-sm">
            APEX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">
                Verified Settlement Portal
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30">
                AUTHORIZED
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab("trading");
              router.push("/dashboard");
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-extrabold text-xs transition-all shadow-md shadow-[#00ffa3]/20 flex items-center gap-1.5"
          >
            <span>Trade Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Certificate Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-[#0e0e12] border border-[#00ffa3]/40 shadow-2xl p-6 sm:p-8 relative overflow-hidden space-y-6"
        >
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#00ffa3]/10 blur-3xl pointer-events-none" />

          {/* Certificate Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1c24] pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/40 flex items-center justify-center shadow-lg shadow-[#00ffa3]/20 shrink-0">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#00ffa3] uppercase">
                  Official Verification Receipt
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Transaction Authenticated & Approved
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#14141c] border border-[#22222e] self-start sm:self-auto">
              <div className="text-right font-mono">
                <div className="text-[10px] text-[#71717a]">Settlement ID</div>
                <div className="text-xs font-bold text-[#00ffa3]">
                  {verifiedPayload?.settlementRef || "APEX-SETTLE-839201"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopyRef(verifiedPayload?.settlementRef || "APEX-SETTLE-839201")}
                className="p-2 rounded-xl bg-[#1e1e2a] hover:bg-[#282838] text-[#a1a1aa] hover:text-white transition-all"
                title="Copy Reference"
              >
                {copiedRef ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00ffa3]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Verified Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#07070a] border border-[#1c1c24] space-y-3 font-mono text-xs">
              <div className="text-[11px] font-bold text-[#71717a] uppercase tracking-wider">
                Transaction Details
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Beneficiary:</span>
                <span className="text-white font-bold">{verifiedPayload?.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Verified Amount:</span>
                <span className="text-[#00ffa3] font-black text-sm">
                  {formatUSD(verifiedPayload?.amountUSD || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Asset & Protocol:</span>
                <span className="text-white font-semibold">
                  {verifiedPayload?.asset} ({verifiedPayload?.protocol})
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#07070a] border border-[#1c1c24] space-y-3 font-mono text-xs">
              <div className="text-[11px] font-bold text-[#71717a] uppercase tracking-wider">
                Security & Audit Proof
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Approval Time:</span>
                <span className="text-white">
                  {verifiedPayload?.approvedAt ? formatTimestamp(verifiedPayload.approvedAt) : "Just now"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Authorized By:</span>
                <span className="text-[#00ffa3] truncate max-w-[150px]">
                  {verifiedPayload?.approvedBy || "Apex Super Admin"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">New Total Balance:</span>
                <span className="text-white font-black text-sm">{formatUSD(fiatBalance)}</span>
              </div>
            </div>
          </div>

          {/* High-Tier Platform Access Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#00ffa3]/10 to-teal-500/10 border border-[#00ffa3]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00ffa3] text-black flex items-center justify-center font-black shrink-0">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-white">Full Liquidity Unlocked</div>
                <div className="text-xs text-[#a1a1aa]">
                  Your verified funds are instantly ready for spot, perpetuals, and yield staking.
                </div>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("trading");
                  router.push("/dashboard");
                }}
                className="py-2.5 px-4 rounded-xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-extrabold text-xs transition-all shadow-md shadow-[#00ffa3]/20 flex items-center gap-1.5"
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Trade Now</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("assets");
                  router.push("/dashboard");
                }}
                className="py-2.5 px-4 rounded-xl bg-[#14141c] hover:bg-[#1e1e28] text-white font-bold text-xs border border-[#22222e] transition-all flex items-center gap-1.5"
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>Portfolio</span>
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
