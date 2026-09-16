/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    // The unit tests cover pure functions (day bucketing, zones, formatting).
    // No DOM is needed, so the default node environment is enough.
    environment: 'node',
  },
})
