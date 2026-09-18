import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env files from the current directory
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      // Bake VITE_API_URL into the bundle at build time.
      // Priority: env file > VITE_API_URL env var > production backend default
      'import.meta.env.VITE_API_URL': JSON.stringify(
        env.VITE_API_URL ||
        process.env.VITE_API_URL ||
        'https://roadmap-backend-sand.vercel.app/api/v1'
      ),
    },
  }
})
