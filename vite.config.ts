// Static build for GitHub Pages: `npx vite build -c vite.static.config.ts` writes dist-static/.
// The Cloudflare/vinext setup in vite.config.ts is left alone.
// Tailwind runs through postcss.config.mjs, the same way the Cloudflare build used it.
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  build: { outDir: "dist-static", emptyOutDir: true },
});
