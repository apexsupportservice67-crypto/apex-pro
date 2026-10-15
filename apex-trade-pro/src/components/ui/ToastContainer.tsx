import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useTradeStore } from "../../store/useTradeStore";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useTradeStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          const isWarning = toast.type === "warning";

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all ${
                isSuccess
                  ? "bg-[#0a0a0e]/95 border-[#00ffa3]/30 text-white shadow-2xl"
                  : isError
                  ? "bg-[#0a0a0e]/95 border-rose-500/30 text-white shadow-2xl"
                  : isWarning
                  ? "bg-[#0a0a0e]/95 border-amber-500/30 text-white shadow-2xl"
                  : "bg-[#0a0a0e]/95 border-[#1c1c24] text-white shadow-2xl"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#00ffa3]" />}
                {isError && <XCircle className="w-5 h-5 text-rose-400" />}
                {isWarning && <AlertCircle className="w-5 h-5 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#00ffa3]" />}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold tracking-tight text-white">{toast.title}</h4>
                {toast.description && (
                  <p className="text-xs text-[#71717a] mt-0.5 leading-relaxed break-words">
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#71717a] hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-white/10"
                aria-label="Close toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
