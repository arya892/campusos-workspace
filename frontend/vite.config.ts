import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configured base path for GitHub Pages hosting (repository name: campusos-workspace)
export default defineConfig({
  base: '/campusos-workspace/',
  plugins: [react()],
})
