import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [basicSsl()],

  // 👇 REQUIRED for GitHub Pages (your repo name)
  base: '/webxr-digital-business-card/',

  server: {
    https: true,
    host: true,   // allows mobile testing on LAN
    port: 5173,
  },

  build: {
    outDir: 'dist',          // default build output folder
    assetsDir: 'assets',     // keep assets organized
    emptyOutDir: true,       // clean dist before each build
    rollupOptions: {
      input: '/index.html',  // this ensures index.html is the entry
    },
  },
});
