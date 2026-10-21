// Regenerates the PWA icons in public/ from public/icon.svg after a logo change.
// Run on demand (downloads the tool, not a project dependency): npx @vite-pwa/assets-generator
import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config'

const BRAND = '#047857' // same green as the icon, so maskable padding blends in

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...preset,
    maskable: { ...preset.maskable, resizeOptions: { background: BRAND } },
    apple: { ...preset.apple, resizeOptions: { background: BRAND } },
  },
  images: ['public/icon.svg'],
})
