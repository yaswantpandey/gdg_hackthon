import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Precache everything the app needs, including the drug dataset,
      // so search works in aeroplane mode after the first visit.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}'],
        navigateFallback: '/index.html',
      },
      manifest: {
        name: 'दवा का सस्ता नाम — The Prescription You Cannot Read',
        short_name: 'Sasti Dawa',
        description: 'Find the generic name, strength and price saving for a brand-name medicine.',
        lang: 'hi',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#047857',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  server: {
    // The Gemma proxy (server/) runs on 8787; forward /api to it in dev.
    proxy: { '/api': 'http://localhost:8787' },
  },
})
