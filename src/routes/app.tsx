import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead } from "@/lib/seo";
import { useWalletStore, type AppPhase } from "@/lib/wallet-store";
import type { NetworkMode } from "@/lib/solana";

const NETWORKS = ["devnet", "mainnet-beta"] as const satisfies readonly NetworkMode[];
const MODES = ["welcome", "create", "import"] as const satisfies readonly Exclude<
  AppPhase,
  "dashboard"
>[];

type AppSearch = {
  network?: (typeof NETWORKS)[number];
  mode?: (typeof MODES)[number];
};

function isNetwork(value: unknown): value is AppSearch["network"] {
  return NETWORKS.some((n) => n === value);
}

function isMode(value: unknown): value is AppSearch["mode"] {
  return MODES.some((m) => m === value);
}

function parseAppSearch(search: Record<string, unknown>): AppSearch {
  const out: AppSearch = {};
  if (isNetwork(search.network)) out.network = search.network;
  if (isMode(search.mode)) out.mode = search.mode;
  return out;
}

export const Route = createFileRoute("/app")({
  component: AppPage,
  /** Wallet needs Web Crypto + no SSR secret leakage */
  ssr: false,
  head: () => pageHead(SEO_PAGES.app),
  validateSearch: (search: Record<string, unknown>): AppSearch =>
    parseAppSearch(search),
});

function applyAppSearch(search: AppSearch) {
  if (search.network) useWalletStore.getState().setNetwork(search.network);
  if (search.mode) useWalletStore.getState().setPhase(search.mode);
}

function AppPage() {
  const search = Route.useSearch();

  useEffect(() => {
    applyAppSearch(search);
    const persist = useWalletStore.persist;
    const unsub = persist.onFinishHydration(() => applyAppSearch(search));
    if (persist.hasHydrated()) applyAppSearch(search);
    return unsub;
  }, [search]);

  return <AppShell />;
}
