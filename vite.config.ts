import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      ["onnxruntime-web"]: "onnxruntime-web/dist/ort.es6.min.js",
    },
  },
  base: 'latentwt'
});
