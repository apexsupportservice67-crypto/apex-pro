import { create } from "zustand";
import { persist } from "zustand/middleware";
import { verificationService, VerificationRequestData } from "../services/verificationService";

interface VerificationStoreState {
  pendingRequestId: string | null;
  currentRequest: VerificationRequestData | null;
  isPolling: boolean;
  pollError: string | null;
  lastApprovedToken: string | null;

  setPendingRequest: (req: VerificationRequestData) => void;
  updateCurrentRequest: (req: VerificationRequestData) => void;
  clearPendingRequest: () => void;
  setLastApprovedToken: (token: string | null) => void;
}

export const useVerificationStore = create<VerificationStoreState>()(
  persist(
    (set) => ({
      pendingRequestId: null,
      currentRequest: null,
      isPolling: false,
      pollError: null,
      lastApprovedToken: null,

      setPendingRequest: (req) =>
        set({
          pendingRequestId: req.id,
          currentRequest: req,
          pollError: null,
        }),

      updateCurrentRequest: (req) =>
        set({
          currentRequest: req,
          pendingRequestId: req.status === "pending" ? req.id : req.id,
          lastApprovedToken: req.status === "approved" ? req.accessToken || null : null,
        }),

      clearPendingRequest: () =>
        set({
          pendingRequestId: null,
          currentRequest: null,
          pollError: null,
        }),

      setLastApprovedToken: (token) => set({ lastApprovedToken: token }),
    }),
    {
      name: "apex_verification_state_v1",
      partialize: (state) => ({
        pendingRequestId: state.pendingRequestId,
        currentRequest: state.currentRequest,
        lastApprovedToken: state.lastApprovedToken,
      }),
    }
  )
);
