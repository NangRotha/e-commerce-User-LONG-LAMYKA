import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'
import { Buffer } from 'node:buffer'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'

// Backend (FastAPI) ពិតប្រាកដនៅលើ Render — ប្រើជា Default សម្រាប់ Dev Server Proxy
// អាចប្តូរបានតាម VITE_API_URL / VITE_WS_URL ក្នុង .env (ឧ. http://localhost:8000)
const DEFAULT_API_BASE = 'https://e-commerce-backend-long-lamyka.onrender.com'

// ថតឫសនៃ Project (vite.config.js ស្ថិតនៅ root) — ដើម្បីអានឯកសារ .env
const PROJECT_ROOT = fileURLToPath(new URL('.', import.meta.url))

// Plugin to downlevel Tailwind v4 CSS for older iOS / Safari (e.g. iPhone 6 on iOS 12)
// Safari 12 discards @layer blocks and does not support oklch() colors.
function legacyCssPlugin() {
  return {
    name: 'vite-plugin-legacy-css',
    enforce: 'post',
    async generateBundle(_, bundle) {
      const { default: postcss } = await import('postcss')
      const { default: cascadeLayers } = await import('@csstools/postcss-cascade-layers')
      const lightningcss = await import('lightningcss')

      for (const [fileName, asset] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && typeof asset.source === 'string') {
          try {
            // 1. Unroll @layer so Safari 12 does not discard CSS rules
            const unlayered = await postcss([cascadeLayers()]).process(asset.source, { from: undefined })

            // 2. Downlevel modern colors (oklch, modern gamuts) to standard hex/RGB
            const downleveled = lightningcss.transform({
              filename: fileName,
              code: Buffer.from(unlayered.css),
              targets: {
                safari: (12 << 16),
                ios_saf: (12 << 16),
              },
            })
            asset.source = downleveled.code.toString()
          } catch (e) {
            console.warn(`[legacy-css] Failed to downlevel CSS in ${fileName}:`, e)
          }
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, PROJECT_ROOT, '')

  // ប្រភពតែមួយ (single source of truth) សម្រាប់ Backend URL ទាំង Dev និង Production
  const apiTarget = (env.VITE_API_URL || DEFAULT_API_BASE).replace(/\/$/, '')
  const wsTarget = (env.VITE_WS_URL || apiTarget.replace(/^http/i, 'ws')).replace(/\/$/, '')

  return {
    build: {
      target: ['es2015', 'safari12', 'ios12'],
      cssTarget: ['safari12', 'ios12'],
    },
    plugins: [
      react(),
      tailwindcss(),
      legacyCssPlugin(),
      legacy({
        targets: ['iOS >= 12', 'Safari >= 12', 'defaults'],
        modernPolyfills: true,
      }),
    ],
    server: {
      port: 5173,
      // ដាក់ Proxy ទៅ Backend ដើម្បីចៀសវាង CORS និងបម្រើរូបភាព/WebSocket ក្នុងពេល Dev
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          // បើ Backend ភ្ជាប់មិនបាន -> ផ្ញើ JSON error ច្បាស់លាស់មក Frontend
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              if (res && res.writeHead && res.end) {
                res.writeHead(502, { 'Content-Type': 'application/json' })
                res.end(
                  JSON.stringify({
                    detail: `Backend is unreachable at ${apiTarget}. Check your internet connection or start the backend locally (cd backend-e-online && .venv/bin/uvicorn app.main:app --reload).`,
                  })
                )
              }
            })
          },
        },
        // បម្រើរូបភាពដែល Upload ពី backend
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
        },
        // WebSocket — real-time product updates (ពេល Admin កែផលិតផល)
        '/ws': {
          target: wsTarget,
          ws: true,
          changeOrigin: true,
        },
      },
    },
  }
})

