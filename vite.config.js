import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
  plugins: [basicSsl()],
  server: {
    https: true,
    host: true, // so you can test on phone via LAN later
    port: 5173
  }
}
