import React, { useState } from "react";
import { Activity, AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Link, useRouter } from "../../../context/RouterContext";
import { useTradeStore } from "../../../store/useTradeStore";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useTradeStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to /dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      router.push("/dashboard");
    } else {
      setErrorMessage(res.error || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden selection:bg-[#00ffa3]/20 selection:text-[#00ffa3]">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] max-w-[90vw] bg-[#00ffa3]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top back to home link */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-[#a1a1aa] hover:text-white transition-colors px-3 py-2 rounded-xl bg-[#0e0e12] border border-[#1c1c24]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Landing Page</span>
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
            Sign In to Apex Markets
          </h2>
          <p className="mt-2 text-xs text-[#a1a1aa]">
            Access your multi-asset portfolio, live order book, and algorithmic quant signals.
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#d4d4d8] mb-1.5">
                  Email Address
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#d4d4d8]">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#00ffa3] hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
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
              </div>

              <div className="flex items-center justify-between text-xs text-[#71717a] pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded bg-[#0e0e12] border-[#1c1c24] text-[#00ffa3] focus:ring-0"
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-[11px] text-[#71717a]">SOC2 Protected</span>
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
                    <span>Sign In to Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Sign up */}
            <div className="mt-6 text-center text-xs text-[#a1a1aa]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#00ffa3] font-bold hover:underline">
                Create one now →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
