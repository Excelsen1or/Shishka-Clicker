import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const appBuildId =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
  process.env.GITHUB_SHA?.slice(0, 7) ??
  'local'
const appBuildTime = new Date().toISOString()

export default defineConfig({
  define: {
    __APP_BUILD_ID__: JSON.stringify(appBuildId),
    __APP_BUILD_TIME__: JSON.stringify(appBuildTime),
  },
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,
    strictPort: true,
  },
})
