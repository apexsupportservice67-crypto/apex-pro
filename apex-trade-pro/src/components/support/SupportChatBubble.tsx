import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Mail, X, ExternalLink, Headphones } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const SupportChatBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popup menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const supportEmail = "apexsupportservice67@gmail.com";
  const emailSubject = encodeURIComponent("Support Request");
  const mailtoUrl = `mailto:${supportEmail}?subject=${emailSubject}`;

  return (
    <div
      ref={containerRef}
      id="support-chat-bubble-container"
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-auto"
    >
      {/* Popup Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="support-popup-menu"
            role="dialog"
            aria-label="Support options"
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="mb-3 w-72 sm:w-80 rounded-2xl bg-[#0e0e14]/95 backdrop-blur-xl border border-[#222230] shadow-2xl p-3.5 origin-bottom-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-[#1c1c28]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00ffa3]/15 border border-[#00ffa3]/30 flex items-center justify-center text-[#00ffa3]">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-none">Apex Support</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] animate-pulse" />
                    <span className="text-[11px] text-[#a1a1aa]">Desk Online 24/7</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-[#181822] transition-colors"
                aria-label="Close support menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Support Actions */}
            <div className="space-y-1">
              <a
                id="support-email-option"
                href={mailtoUrl}
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-3 w-full p-2.5 rounded-xl bg-[#14141e] hover:bg-[#1c1c2a] border border-[#20202e] hover:border-[#00ffa3]/40 transition-all text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-[#00ffa3]/10 group-hover:bg-[#00ffa3]/20 text-[#00ffa3] flex items-center justify-center transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white group-hover:text-[#00ffa3] transition-colors flex items-center gap-1.5">
                    <span>Email Support</span>
                    <ExternalLink className="w-3 h-3 text-[#71717a] group-hover:text-[#00ffa3] transition-colors" />
                  </div>
                  <div className="text-[11px] text-[#71717a] truncate">
                    {supportEmail}
                  </div>
                </div>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Circular Trigger Button */}
      <button
        id="floating-support-bubble-btn"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close support menu" : "Open support menu"}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#00FFA3] hover:bg-[#00FFA3]/90 active:scale-95 text-black shadow-lg shadow-[#00FFA3]/25 flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00FFA3] focus:ring-offset-2 focus:ring-offset-[#050505]"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="flex items-center justify-center"
        >
          {isOpen ? (
            <X className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <MessageSquare className="w-6 h-6 stroke-[2.2] fill-black/10" />
          )}
        </motion.div>
      </button>
    </div>
  );
};
