import React, { useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, User, X } from "lucide-react";
import { useTradeStore } from "../../store/useTradeStore";
import { useRouter } from "../../context/RouterContext";

export const AuthModal: React.FC = () => {
  const router = useRouter();
  const { isAuthModalOpen, closeAuthModal, authMode, login, signup } = useTradeStore();
  const [mode, setMode] = useState<"login" | "signup">(authMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync mode when modal opens
  React.useEffect(() => {
    setMode(authMode);
    setErrorMessage(null);
  }, [authMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === "signup") {
      const hasMinLength = password.length >= 8;
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[^A-Za-z0-9]/.test(password);

      if (!hasMinLength || !hasLetter || !hasNumber || !hasSpecial) {
        setErrorMessage(
          "Password must be at least 8 characters and include at least one letter, one number, and one special character."
        );
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }
      setIsLoading(true);
      const res = await signup(name, email, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || "Signup failed");
      }
    } else {
      setIsLoading(true);
      const res = await login(email, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || "Login failed");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-[#0a0a0e] border border-[#1c1c24] rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#00ffa3]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-lg text-[#71717a] hover:text-white hover:bg-[#14141a] transition-colors"
          aria-label="Close auth dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#00ffa3]/15 text-[#00ffa3] shadow-lg shadow-[#00ffa3]/10 mb-3 border border-[#00ffa3]/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {mode === "login" ? "Welcome back to Apex" : "Create your Apex account"}
          </h2>
          <p className="text-xs text-[#71717a] mt-1">
            {mode === "login"
              ? "Access your institutional portfolio and live terminal"
              : "Start trading crypto & equities on Apex"}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-[#0e0e12] border border-[#1c1c24] rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "login"
                ? "bg-[#14141a] text-[#00ffa3] shadow-sm border border-[#1c1c24]"
                : "text-[#71717a] hover:text-[#d4d4d8]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "signup"
                ? "bg-[#14141a] text-[#00ffa3] shadow-sm border border-[#1c1c24]"
                : "text-[#71717a] hover:text-[#d4d4d8]"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-4"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-medium text-[#d4d4d8] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Sterling"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-sm text-white placeholder-[#71717a] focus:outline-none focus:border-[#00ffa3] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#d4d4d8] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@apex.trade"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-sm text-white placeholder-[#71717a] focus:outline-none focus:border-[#00ffa3] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#d4d4d8]">Password</label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    closeAuthModal();
                    router.push("/forgot-password");
                  }}
                  className="text-[11px] text-[#00ffa3] hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Min. 8 chars (letter, number, symbol)" : "••••••••••••"}
                className="w-full pl-10 pr-10 py-2.5 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-sm text-white placeholder-[#71717a] focus:outline-none focus:border-[#00ffa3] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#d4d4d8]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === "signup" && (
              <p className="text-[11px] text-[#71717a] mt-1.5">
                Must be at least 8 characters with at least 1 letter, 1 number, and 1 special character.
              </p>
            )}
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-xs font-medium text-[#d4d4d8] mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-sm text-white placeholder-[#71717a] focus:outline-none focus:border-[#00ffa3] transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-semibold rounded-xl text-sm shadow-lg shadow-[#00ffa3]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : mode === "login" ? (
              <>
                <span>Sign In to Dashboard</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
