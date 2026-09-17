/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // The same path vercel.json rewrites in production, so the app fetches
    // one relative URL everywhere and never depends on the API's CORS
    // allowlist (which admits localhost but not vercel.app). See
    // src/api/events.ts.
    proxy: {
      '/api/events': {
        target: 'https://adonix.hackillinois.org',
        changeOrigin: true,
        rewrite: () => '/event/',
      },
    },
  },
  test: {
    // The unit tests cover pure functions (day bucketing, zones, formatting).
    // No DOM is needed, so the default node environment is enough.
    environment: 'node',
  },
})
