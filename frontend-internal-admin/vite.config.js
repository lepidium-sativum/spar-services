import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fixReactVirtualized from "esbuild-plugin-react-virtualized";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false,
    },
    strictPort: true,
    host: true,
  },
  build: {
    target: "ES2022",
  },
  optimizeDeps: {
    include: ["@emotion/react", "@emotion/styled"],
    esbuildOptions: {
      plugins: [fixReactVirtualized],
    },
  },
});
