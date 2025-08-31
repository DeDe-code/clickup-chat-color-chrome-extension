import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(dirname(fileURLToPath(import.meta.url)), 'src/content/content.js'),
      name: 'ContentScript',
      formats: ['iife'],
      fileName: () => 'content.js',
    },
    outDir: 'dist',
    emptyOutDir: false,
    minify: 'terser',
  },
})
