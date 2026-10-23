import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'

// En-têtes de sécurité envoyés avec chaque page (dev et preview). Pour un autre serveur, les reproduire à l'identique.
const ENTETES_SECURITE: Record<string, string> = {
  // Tout le traitement des plannings se fait dans le navigateur : rien n'a besoin de sortir (connect-src 'self').
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; " +
    "font-src 'self'; connect-src 'self'; media-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; " +
    "form-action 'self'; object-src 'none'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  // La caméra est autorisée pour nous seuls : elle sert au scan de QR code.
  'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

function entetesSecurite(): Plugin {
  const middleware = (_req: unknown, res: { setHeader(nom: string, valeur: string): unknown }, next: () => void) => {
    for (const [nom, valeur] of Object.entries(ENTETES_SECURITE)) res.setHeader(nom, valeur)
    next()
  }
  return {
    name: 'entetes-securite',
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  }
}

export default defineConfig({
  plugins: [tailwindcss(), svelte(), entetesSecurite()],
  resolve: { alias: { $lib: path.resolve('./src/lib') } },
  build: { sourcemap: false },
  // host: true = accessible depuis un téléphone du même wifi (indispensable pour tester le scan de QR code).
  server: { host: true },
  preview: { host: true },
})
