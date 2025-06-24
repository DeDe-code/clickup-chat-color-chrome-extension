#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import process from 'node:process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')

/**
 * Copy the manifest.json and any other static assets that don't go through Vite
 */
async function postBuild() {
  console.log('🔧 Running post-build script...')

  try {
    // Ensure dist directory exists
    await fs.mkdir(distDir, { recursive: true })

    // Copy manifest.json
    const manifestSrc = path.join(rootDir, 'public', 'manifest.json')
    const manifestDest = path.join(distDir, 'manifest.json')
    await fs.copyFile(manifestSrc, manifestDest)
    console.log('✅ Copied manifest.json')

    // Copy any other assets that need direct copying
    // For example: icons that aren't processed by Vite
    const iconsSrc = path.join(rootDir, 'public', 'favicon.ico')
    const iconsDest = path.join(distDir, 'favicon.ico')

    try {
      await fs.copyFile(iconsSrc, iconsDest)
      console.log('✅ Copied favicon.ico')
    } catch (error) {
      console.log('⚠️ No favicon.ico found to copy:', error.code)
    }

    console.log('✅ Post-build completed successfully!')
  } catch (error) {
    console.error('❌ Error during post-build:', error)
    process.exitCode = 1
  }
}

postBuild()
