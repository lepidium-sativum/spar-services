import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fixReactVirtualized from "esbuild-plugin-react-virtualized";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // viteStaticCopy({
    //   targets: [
    //     {
    //       src: "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
    //       dest: "./",
    //     },
    //     {
    //       src: "node_modules/@ricky0123/vad-web/dist/silero_vad.onnx",
    //       dest: "./",
    //     },
    //     {
    //       src: "node_modules/onnxruntime-web/dist/*.wasm",
    //       dest: "./",
    //     },
    //   ],
    // }),
  ],
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
    exclude: ["onnxruntime-web"], // Exclude from optimization
    include: ["@emotion/react", "@emotion/styled", "@mui/material/Tooltip"],

    esbuildOptions: {
      plugins: [fixReactVirtualized],
    },
  },
  resolve: {
    extensions: [".mjs", ".js", ".jsx", ".wasm"], // Ensure Vite resolves .mjs and .wasm files
  },
});
