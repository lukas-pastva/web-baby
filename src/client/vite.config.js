const path  = require("path");
const react = require("@vitejs/plugin-react");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  root   : path.resolve(__dirname, "src"),
  plugins: [react()],

  /* dev-only proxy stays unchanged */
  server : { proxy: { "/api": "http://localhost:8080" } },

  build  : {
    outDir     : path.resolve(__dirname, "dist"),
    emptyOutDir: true,

    /* 👇  NEW — mark the runtime-generated file as external */
    rollupOptions: {
      /**
       * Treat /env.js as an external URL – Rollup/Vite will leave the
       * <script src="/env.js"> tag untouched instead of trying to follow
       * and bundle it.
       */
      external: ["/env.js"],
    },
  },
});
