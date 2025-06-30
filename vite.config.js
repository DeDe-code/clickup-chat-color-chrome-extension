import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import compressionPlugin from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [vue(), vueDevTools()]

  // Add visualizer in analyze mode
  if (mode === 'analyze') {
    plugins.push(
      visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
    )
  }

  // Add compression for production build
  if (mode === 'production') {
    plugins.push(
      compressionPlugin({
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
    )
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        input: {
          popup: resolve('index.html'),
          content: resolve('src/content/content.js'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            vendor: ['vue-color-input', 'axios'],
          },
        },
      },
      outDir: 'dist',
      emptyOutDir: true,
      minify: 'terser', // Better minification
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true, // Remove debugger statements
        },
      },
      reportCompressedSize: true,
      sourcemap: mode !== 'production', // Only generate sourcemaps in dev mode
    },
    server: {
      hmr: true,
    },
  }
})
