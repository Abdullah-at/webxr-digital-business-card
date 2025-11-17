import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
  plugins: [basicSsl()],
  base: '/webxr-digital-business-card/', // GitHub Pages base path
  server: {
    https: true,
    host: true, // so you can test on phone via LAN later
    port: 5173
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}
