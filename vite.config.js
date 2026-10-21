import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/** Content Security Policy: only our own files run; the only network call is our OCR proxy. */
function contentSecurityPolicy(apiBase) {
  const apiOrigin = apiBase ? new URL(apiBase).origin : ''
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' blob: data:", // blob: = the in-memory scan preview
    `connect-src 'self' ${apiOrigin}`.trim(),
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

// Injected into the built index.html only: Vite's dev server needs inline scripts for hot reload.
const cspMeta = (policy) => ({
  name: 'csp-meta',
  apply: 'build',
  transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: policy }, injectTo: 'head-prepend' }],
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const csp = contentSecurityPolicy(env.VITE_API_BASE)

  return {
    plugins: [
      react(),
      tailwindcss(),
      cspMeta(csp),
      VitePWA({
        registerType: 'autoUpdate',
        includeManifestIcons: false, // already matched by globPatterns; avoids duplicate precache entries
        // Precache the whole app: HTML, JS (which includes drugs.json), CSS and icons.
        // After the first visit, typed search never touches the network.
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api\//], // never answer API calls from cache
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
    // The OCR proxy (server/) listens on 127.0.0.1:8787; forward /api to it in dev and preview.
    server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
    preview: {
      proxy: { '/api': 'http://127.0.0.1:8787' },
      // Real headers (a <meta> CSP cannot set frame-ancestors). Hosts: see public/_headers.
      headers: {
        'Content-Security-Policy': `${csp}; frame-ancestors 'none'`,
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      },
    },
  }
})
