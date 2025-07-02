#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicDir = path.join(__dirname, '..', 'public')
const svgPath = path.join(publicDir, 'icon.svg')

// Required icon sizes for Chrome extensions
const sizes = [16, 32, 48, 128]

console.log('🎨 Creating extension icons from SVG...')

// Check if ImageMagick is available
function hasImageMagick() {
  try {
    execSync('convert -version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// Check if Inkscape is available
function hasInkscape() {
  try {
    execSync('inkscape --version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// Create PNG icons from SVG
async function createIcons() {
  if (!fs.existsSync(svgPath)) {
    console.error('❌ SVG file not found:', svgPath)
    return
  }

  let conversionTool = null

  if (hasInkscape()) {
    conversionTool = 'inkscape'
    console.log('✅ Using Inkscape to convert SVG to PNG...')
  } else if (hasImageMagick()) {
    conversionTool = 'imagemagick'
    console.log('✅ Using ImageMagick to convert SVG to PNG...')
  }

  if (conversionTool) {
    for (const size of sizes) {
      const outputPath = path.join(publicDir, `icon${size}.png`)
      try {
        if (conversionTool === 'inkscape') {
          execSync(
            `inkscape "${svgPath}" --export-type=png --export-filename="${outputPath}" --export-width=${size} --export-height=${size}`,
          )
        } else {
          execSync(`convert "${svgPath}" -resize ${size}x${size} "${outputPath}"`)
        }
        console.log(`✅ Created icon${size}.png`)
      } catch (error) {
        console.error(`❌ Failed to create icon${size}.png:`, error.message)
      }
    }
  } else {
    console.log('⚠️  Neither Inkscape nor ImageMagick found.')
    console.log('📋 Manual conversion needed:')
    console.log('   1. Open icon.svg in a browser')
    console.log('   2. Take screenshots or use online converter: https://convertio.co/svg-png/')
    console.log('   3. Create these files in public/ folder:')
    sizes.forEach((size) => {
      console.log(`      - icon${size}.png (${size}x${size} pixels)`)
    })

    // Create placeholder files for now
    console.log('\n📝 Creating placeholder PNG files...')
    sizes.forEach((size) => {
      const outputPath = path.join(publicDir, `icon${size}.png`)
      // Create minimal PNG placeholder
      fs.writeFileSync(outputPath, '')
      console.log(`📝 Created placeholder icon${size}.png`)
    })
  }
}

createIcons()
