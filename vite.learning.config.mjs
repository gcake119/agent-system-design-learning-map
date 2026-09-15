import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
  root: "learning",
  base: "/agent-system-design-learning-map/",
  plugins: [vue()],
  build: { outDir: "../dist", emptyOutDir: true },
});
