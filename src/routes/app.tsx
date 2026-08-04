import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { SEO_PAGES } from "@/lib/brand";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app")({
  component: AppPage,
  /** Wallet needs Web Crypto + no SSR secret leakage */
  ssr: false,
  head: () => pageHead(SEO_PAGES.app),
});

function AppPage() {
  return <AppShell />;
}
