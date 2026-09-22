import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: [
    "src/index.ts",
    "src/layout/index.ts",
    "src/media/index.ts",
    "src/media/media-lightbox/parts/index.ts",
    "src/preview/index.ts",
    "src/theme/index.ts",
  ],
  external: ["react", "react-dom", "motion", "motion/react"],
  format: ["esm"],
  sourcemap: true,
  treeshake: true,
});
