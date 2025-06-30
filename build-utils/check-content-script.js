#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const contentJsPath = path.join(distDir, 'content.js')

async function checkContentScript() {
  console.log('🔍 Checking the content script...')

  try {
    // Check if dist directory exists
    await fs.access(distDir)
    console.log('✅ dist directory exists')

    // Check if content.js exists
    const contentStats = await fs.stat(contentJsPath)
    console.log(`✅ content.js exists (${contentStats.size} bytes)`)

    // Check if content.js is referenced in manifest.json
    const manifestPath = path.join(distDir, 'manifest.json')
    const manifestContent = await fs.readFile(manifestPath, 'utf8')
    const manifest = JSON.parse(manifestContent)

    const contentScripts = manifest.content_scripts || []
    const hasContentJs = contentScripts.some(
      (script) => script.js && script.js.includes('content.js'),
    )

    if (hasContentJs) {
      console.log('✅ content.js is referenced in manifest.json')
    } else {
      console.error('❌ content.js is NOT referenced in manifest.json!')
    }

    // Read the first few bytes of content.js to verify it's valid
    const contentPreview = await fs.readFile(contentJsPath, 'utf8', { length: 100 })
    console.log('📄 content.js preview:', contentPreview.substring(0, 50) + '...')

    console.log(
      '\n✨ All checks completed. If all checks passed, your content script should be loading correctly.\n',
    )
    console.log(
      'If you\'re still seeing "Could not load javascript" errors in Chrome, try these steps:',
    )
    console.log('1. Run "npm run dev:clean" to clean and rebuild everything')
    console.log('2. Remove the extension from Chrome completely and load it again')
    console.log("3. Check Chrome's Extension Management page for any additional errors")
  } catch (error) {
    console.error('❌ Error during content script check:', error.message)
  }
}

checkContentScript()
