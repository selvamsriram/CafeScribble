import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const GITHUB_PAGES_BASE = '/cafe-scribble/'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vercel serves the app at the domain root, so Vite base must be "/".
  // GitHub Pages serves under the repo name, so base must be "/cafe-scribble/".
  const isVercel = Boolean(process.env.VERCEL)
  const isGithubPagesBuild = mode === 'github-pages' || process.env.GITHUB_PAGES === 'true'

  return {
    base: isVercel ? '/' : isGithubPagesBuild ? GITHUB_PAGES_BASE : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
