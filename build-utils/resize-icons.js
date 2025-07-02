#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicDir = path.join(__dirname, '..', 'public')
const sourcePng = path.join(publicDir, 'icon.png')

// Required icon sizes for Chrome extensions
const sizes = [16, 32, 48, 128]

console.log('🎨 Resizing icon.png to required extension sizes...')

// Check if ImageMagick is available
function hasImageMagick() {
  try {
    execSync('convert -version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// Create resized PNG icons from source PNG
async function resizeIcons() {
  if (!fs.existsSync(sourcePng)) {
    console.error('❌ icon.png file not found:', sourcePng)
    return
  }

  if (hasImageMagick()) {
    console.log('✅ Using ImageMagick to resize PNG...')

    for (const size of sizes) {
      const outputPath = path.join(publicDir, `icon${size}.png`)
      try {
        execSync(`convert "${sourcePng}" -resize ${size}x${size} "${outputPath}"`)
        console.log(`✅ Created icon${size}.png (${size}x${size})`)
      } catch (error) {
        console.error(`❌ Failed to create icon${size}.png:`, error.message)
      }
    }

    console.log('\n🎉 All icon sizes created successfully!')
    console.log('🚀 Run "npm run build" to update your extension')
  } else {
    console.log('⚠️  ImageMagick not found. Attempting to install...')

    try {
      console.log('📦 Installing ImageMagick...')
      execSync('sudo apt update && sudo apt install -y imagemagick', { stdio: 'inherit' })

      // Try again after installation
      console.log('🔄 Retrying icon creation...')
      for (const size of sizes) {
        const outputPath = path.join(publicDir, `icon${size}.png`)
        try {
          execSync(`convert "${sourcePng}" -resize ${size}x${size} "${outputPath}"`)
          console.log(`✅ Created icon${size}.png (${size}x${size})`)
        } catch (error) {
          console.error(`❌ Failed to create icon${size}.png:`, error.message)
        }
      }
    } catch (installError) {
      console.log('❌ Could not install ImageMagick automatically.')
      console.log('\n📋 Manual options:')
      console.log('1. Install ImageMagick: sudo apt install imagemagick')
      console.log('2. Use online resizer: https://www.iloveimg.com/resize-image')
      console.log('3. Upload icon.png and create these sizes:')
      sizes.forEach((size) => {
        console.log(`   - ${size}x${size} pixels → save as icon${size}.png`)
      })
      console.log('4. Place all files in public/ folder')
    }
  }
}

resizeIcons()
