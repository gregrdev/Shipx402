import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

// `0.0.0.0:8080` is the live-preview contract — don't change host/port.
// `nitro` is gated to `build` (the Vercel deploy target); enabling it in dev
// opens a second dev-server port and breaks the single-port preview.
//
// Security headers (CSP, X-Frame-Options, etc.) are defined ONCE in
// `vercel.json`, which Vercel applies to every response including static
// assets. Do not also set them here — a second source drifts.
export default defineConfig(({ command }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    ...(command === "build" ? [nitro({ preset: "vercel" })] : []),
    viteReact(),
  ],
}));
