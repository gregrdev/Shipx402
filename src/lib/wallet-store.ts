import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NetworkMode } from "./solana";

export type AppPhase = "welcome" | "create" | "import" | "dashboard";

type WalletState = {
  phase: AppPhase;
  network: NetworkMode;
  publicKey: string | null;
  secretKey: string | null;
  hasAcknowledgedRisk: boolean;
  setPhase: (phase: AppPhase) => void;
  setNetwork: (network: NetworkMode) => void;
  setWallet: (publicKey: string, secretKey: string) => void;
  clearWallet: () => void;
  setHasAcknowledgedRisk: (value: boolean) => void;
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      phase: "welcome",
      network: "devnet",
      publicKey: null,
      secretKey: null,
      hasAcknowledgedRisk: false,
      setPhase: (phase) => set({ phase }),
      setNetwork: (network) => set({ network }),
      setWallet: (publicKey, secretKey) =>
        set({ publicKey, secretKey, phase: "dashboard", hasAcknowledgedRisk: true }),
      clearWallet: () =>
        set({
          publicKey: null,
          secretKey: null,
          phase: "welcome",
          hasAcknowledgedRisk: false,
        }),
      setHasAcknowledgedRisk: (value) => set({ hasAcknowledgedRisk: value }),
    }),
    {
      name: "ezsolwallet-v1",
      partialize: (state) => ({
        // Never persist secretKey. Session keys live in memory only.
        network: state.network,
        phase:
          state.phase === "dashboard"
            ? "welcome"
            : state.phase === "create" || state.phase === "import"
              ? state.phase
              : "welcome",
      }),
    },
  ),
);
