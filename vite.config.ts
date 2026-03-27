import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const getGraphqlProxyTarget = (rawValue?: string) => {
  const fallbackTarget = 'http://localhost:8883'
  const raw = (rawValue || '').trim()

  if (!raw) {
    return fallbackTarget
  }

  try {
    const parsed = new URL(raw)
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return fallbackTarget
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const graphqlProxyTarget = getGraphqlProxyTarget(env.VITE_WORDPRESS_GRAPHQL_URL)

  return {
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      '/graphql': {
        target: graphqlProxyTarget,
        changeOrigin: true,
        secure: false
      },
      '/wp-content': {
        target: graphqlProxyTarget,
        changeOrigin: true,
        secure: false
      },
      '/wp-includes': {
        target: graphqlProxyTarget,
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          graphql: ['@apollo/client', 'graphql']
        }
      }
    }
  }
  }
})
