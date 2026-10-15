import React, { useState } from "react";
import {
  Lock,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";
import { useTradeStore } from "../../store/useTradeStore";

export const SettingsView: React.FC = () => {
  const { user, updateProfile } = useTradeStore();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [is2FA, setIs2FA] = useState(user?.is2FAEnabled ?? true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, is2FAEnabled: is2FA });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Account Settings & Security
        </h1>
        <p className="text-xs text-[#71717a] mt-1">
          Manage your personal profile, 2FA authentication, and account security settings.
        </p>
      </div>

      {/* Profile Form */}
      <div className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 sm:p-8 shadow-xl space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-[#00ffa3]" />
          <span>Profile Information</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#d4d4d8] mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-xs text-white focus:outline-none focus:border-[#00ffa3]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#d4d4d8] mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0e0e12] border border-[#1c1c24] rounded-xl text-xs text-white focus:outline-none focus:border-[#00ffa3]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0e0e12] border border-[#1c1c24]">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#00ffa3]" />
              <div>
                <div className="text-xs font-bold text-white">KYC Verification Tier 3</div>
                <div className="text-[11px] text-[#71717a]">Institutional unlimited trading & wire limits active</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30">
              VERIFIED
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="py-2.5 px-5 bg-[#00ffa3] hover:bg-[#00ffa3]/90 text-black font-bold text-xs rounded-xl shadow-md shadow-[#00ffa3]/20 transition-all"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Security & 2FA */}
      <div className="rounded-3xl bg-[#0a0a0e] border border-[#1c1c24] p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#00ffa3]" />
          <span>Two-Factor Authentication (2FA)</span>
        </h3>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0e0e12] border border-[#1c1c24]">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-[#00ffa3]" />
            <div>
              <div className="text-xs font-bold text-white">Authenticator App / Hardware Key</div>
              <div className="text-[11px] text-[#71717a]">
                Requires a 6-digit TOTP code for logins and withdrawals
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIs2FA(!is2FA);
              updateProfile({ is2FAEnabled: !is2FA });
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              is2FA
                ? "bg-[#00ffa3]/15 text-[#00ffa3] border border-[#00ffa3]/30"
                : "bg-[#14141a] text-[#71717a] border border-[#1c1c24]"
            }`}
          >
            {is2FA ? "Enabled (Recommended)" : "Disabled"}
          </button>
        </div>
      </div>
    </div>
  );
};
