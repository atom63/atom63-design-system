import react from "@vitejs/plugin-react";
import { defaultClientConditions, defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolve workspace @atom63/* packages to source; published tarballs omit src/*.ts.
    conditions: ["@atom63/source", ...defaultClientConditions],
    dedupe: ["react", "react-dom"],
  },
});
