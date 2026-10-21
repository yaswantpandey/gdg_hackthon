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
      includeManifestIcons: false, // already matched by globPatterns; avoids duplicate precache entries
      // Precache the whole app: HTML, JS (which includes drugs.json), CSS and icons.
      // After the first visit, typed search never touches the network.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
      manifest: {
        id: '/',
        name: 'सस्ती दवा — Sasti Dawa',
        short_name: 'सस्ती दवा',
        description: 'ब्रांड दवा का जेनेरिक नाम, ताकत और दाम में बचत देखें — बिना इंटरनेट भी। Find the generic name and price saving for a brand-name medicine, even offline.',
        lang: 'hi',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f8fafc',
        theme_color: '#065f46',
        categories: ['medical', 'health'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  server: {
    // The Gemma proxy (server/) runs on 8787; forward /api to it in dev.
    proxy: { '/api': 'http://localhost:8787' },
  },
})
