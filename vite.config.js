import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      injectRegister: "inline",
      manifest: {
        name: "Mi Band 4 Web",
        short_name: "Mi Band 4",
        theme_color: "#ea580c",
        background_color: "#ea580c",
        display: "standalone",
        scope: "/",
        start_url: "/bands/",
        description: "A web interface for the Mi Smart Band 4 that respects your privacy",
        icons: [
          { src: "icons/icon-192.png", type: "image/png", sizes: "192x192" },
          { src: "icons/icon-512.png", type: "image/png", sizes: "512x512" },
          { src: "icons/icon-192-maskable.png", type: "image/png", sizes: "192x192", purpose: "maskable" },
          { src: "icons/icon-512-maskable.png", type: "image/png", sizes: "512x512", purpose: "maskable" }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    hmr: false
  },
  test: {
    globals: true,
    environment: "happy-dom"
  }
})
