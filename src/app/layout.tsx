import React from "react";
import { ToastContainer } from "../components/ui/ToastContainer";
import { AuthModal } from "../components/auth/AuthModal";
import { MoveMoneyModal } from "../components/modals/MoveMoneyModal";
import { ConnectWalletModal } from "../components/wallet/ConnectWalletModal";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] font-sans antialiased selection:bg-[#00ffa3]/20 selection:text-[#00ffa3]">
      {children}

      {/* Global Modals & Overlays */}
      <AuthModal />
      <MoveMoneyModal />
      <ConnectWalletModal />
      <ToastContainer />
    </div>
  );
}
