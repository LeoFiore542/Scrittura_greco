import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the app works on GitHub Pages project sites.
export default defineConfig({
  plugins: [react()],
  base: './',
})
