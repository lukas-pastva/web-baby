const path  = require("path");
const react = require("@vitejs/plugin-react");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  root  : path.resolve(__dirname, "src"),
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:8080" } },
  build : {
    outDir    : path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
});
