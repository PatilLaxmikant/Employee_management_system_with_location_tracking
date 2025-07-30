// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Location App',
        short_name: 'location-app',
        description: 'A Vite + React Progressive Web App',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          // {
          //   src: 'pwa-192x192.png',
          //   sizes: '192x192',
          //   type: 'image/png',
          // },
          // {
          //   src: 'pwa-512x512.png',
          //   sizes: '512x512',
          //   type: 'image/png',
          // },
        ],
      },
      // workbox: {
      //   globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      //   cleanupOutdatedCaches: true,
      //   clientsClaim: true
      // },

      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module'
      },
    })
  ],
  define: {
    global: {}
  },
  server: {
    host: true
  }
})
