import React, { useState } from "react";
import { Activity, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Info, KeyRound, Lock, Mail } from "lucide-react";
import { Link, useRouter } from "../../../context/RouterContext";
import { useTradeStore } from "../../../store/useTradeStore";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { checkEmailRegistered, resetPassword, isAuthenticated } = useTradeStore();

  const [step, setStep] = useState<"email" | "reset" | "success">("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to /dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const res = await checkEmailRegistered(email);
    setIsLoading(false);

    if (res.registered) {
      setStep("reset");
    } else {
      setErrorMessage(res.error || "No account found with this email.");
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const hasMinLength = newPassword.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasMinLength || !hasLetter || !hasNumber || !hasSpecial) {
      setErrorMessage(
        "Password must be at least 8 characters and include at least one letter, one number, and one special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const res = await resetPassword(email, newPassword);
    setIsLoading(false);

    if (res.success) {
      setStep("success");
    } else {
      setErrorMessage(res.error || "Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden selection:bg-[#00ffa3]/20 selection:text-[#00ffa3]">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] max-w-[90vw] bg-[#00ffa3]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top back link */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link
          href="/login"
          className="flex items-center gap-2 text-xs font-semibold text-[#a1a1aa] hover:text-white transition-colors px-3 py-2 rounded-xl bg-[#0e0e12] border border-[#1c1c24]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Sign In</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-[#00ffa3]/15 border border-[#00ffa3]/30 flex items-center justify-center shadow-lg shadow-[#00ffa3]/10 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-[#00ffa3]" />
            </div>
            <span className="text-2xl font-black text-white font-mono">APEX</span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {step === "email" && "Reset Your Password"}
            {step === "reset" && "Set New Password"}
            {step === "success" && "Password Reset Complete"}
          </h2>
          <p className="mt-2 text-xs text-[#a1a1aa]">
            {step === "email" && "Enter your registered email address to verify your account."}
            {step === "reset" && `Create a secure new password for ${email}.`}
            {step === "success" && "Your password has been updated in your local record."}
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-[#0a0a0e] border border-[#1c1c24] py-8 px-6 sm:px-10 rounded-3xl shadow-2xl">
            {errorMessage && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-6">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#d4d4d8] mb-1.5">
                    Account Email Address
                  </label>
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

                {/* Demo Flow Note */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#00ffa3]/5 border border-[#00ffa3]/20 text-[#a1a1aa] text-[11px] leading-relaxed">
                  <Info className="w-4 h-4 text-[#00ffa3] shrink-0 mt-0.5" />
                  <span>
                    <strong>Demo Simulation Note:</strong> This is a simplified direct-reset demo flow without email verification tokens. In a live production environment, a secure one-time reset link is dispatched to your inbox.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-extrabold text-xs tracking-wide uppercase shadow-lg shadow-[#00ffa3]/20 hover:shadow-[#00ffa3]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Reset Password Form */}
            {step === "reset" && (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="p-3 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-xs flex items-center justify-between text-[#a1a1aa]">
                  <span>Account:</span>
                  <span className="font-mono text-white font-semibold">{email}</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#d4d4d8] mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 chars (letter, number, symbol)"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-sm text-white placeholder-[#71717a] focus:outline-none focus:border-[#00ffa3] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#71717a] mt-1.5">
                    Must be 8+ characters with at least 1 letter, 1 number, and 1 special symbol.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#d4d4d8] mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
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

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#00ffa3]/5 border border-[#00ffa3]/20 text-[#a1a1aa] text-[11px] leading-relaxed">
                  <Info className="w-4 h-4 text-[#00ffa3] shrink-0 mt-0.5" />
                  <span>
                    <strong>Notice:</strong> Your password will be hashed and updated in the registered users record for subsequent sign-ins.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-extrabold text-xs tracking-wide uppercase shadow-lg shadow-[#00ffa3]/20 hover:shadow-[#00ffa3]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Save New Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: Success Confirmation */}
            {step === "success" && (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#00ffa3]/15 border border-[#00ffa3]/30 flex items-center justify-center mx-auto text-[#00ffa3]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Password Updated Successfully</h3>
                  <p className="text-xs text-[#a1a1aa] mt-1">
                    You can now sign in to your Apex trading account with your new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full py-3 px-4 rounded-xl bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-extrabold text-xs tracking-wide uppercase shadow-lg shadow-[#00ffa3]/20 hover:shadow-[#00ffa3]/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Switch to Sign In / Sign Up */}
            <div className="mt-6 pt-5 border-t border-[#1c1c24] flex items-center justify-between text-xs text-[#a1a1aa]">
              <Link href="/login" className="hover:text-white transition-colors">
                ← Back to Login
              </Link>
              <Link href="/signup" className="text-[#00ffa3] hover:underline font-medium">
                Create Account →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
