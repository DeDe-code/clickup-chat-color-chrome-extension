#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { minify } from 'terser'
import process from 'node:process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const srcContentPath = path.join(rootDir, 'src', 'content', 'content.js')
const distContentPath = path.join(distDir, 'content.js')

async function copyContentScript() {
  console.log('🔧 Copying content script...')

  try {
    // Ensure dist directory exists
    await fs.mkdir(distDir, { recursive: true })

    // Read the source content script
    const content = await fs.readFile(srcContentPath, 'utf8')

    // Minify it
    const minified = await minify(content, {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    })

    // Write to dist
    await fs.writeFile(distContentPath, minified.code)
    console.log(`✅ Content script minified and copied to ${distContentPath}`)

    // Also create a debug version with source maps if not in production
    if (process.env.NODE_ENV !== 'production') {
      await fs.writeFile(
        path.join(distDir, 'content.debug.js'),
        content + '\n//# sourceMappingURL=content.debug.js.map',
      )
      console.log('✅ Created debug version of content script')
    }
  } catch (error) {
    console.error('❌ Error copying content script:', error)
    process.exit(1)
  }
}

copyContentScript()
