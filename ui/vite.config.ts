import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  plugins: [react()],
  optimizeDeps: {
    include: ["d3-sankey"],
  },
  build: {
    outDir: "../dist/ui",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Keep React in default chunks; only split heavy stacks
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return;

          if (id.includes("livekit")) {
            return "livekit-vendor";
          }

          if (id.includes("framer-motion")) {
            return "framer-motion";
          }

          if (
            id.includes("react-markdown") ||
            id.includes("remark-") ||
            id.includes("rehype-") ||
            id.includes("mermaid") ||
            id.includes("d3-sankey")
          ) {
            return "markdown-vendor";
          }

          if (id.includes("@phosphor-icons")) {
            return "icons-vendor";
          }

          // Let Vite handle React and remaining deps by default
          return;
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "d3-sankey": resolve(
        __dirname,
        "node_modules/d3-sankey/dist/d3-sankey.min.js"
      ),
    },
  },
});
