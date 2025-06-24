#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import process from 'node:process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure the output directory exists
const outputDir = path.resolve(__dirname, './src/assets')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Path to input and output files
const inputFile = path.resolve(__dirname, './src/assets/tailwind.css')
const outputFile = path.resolve(__dirname, './src/assets/tailwind.output.css')

try {
  console.log('Building Tailwind CSS...')
  execSync(`npx tailwindcss -i ${inputFile} -o ${outputFile} --minify`, { stdio: 'inherit' })
  console.log('Tailwind CSS built successfully!')
} catch (error) {
  console.error('Failed to build Tailwind CSS:', error)
  // Use a proper exit code in ESM context
  process.exitCode = 1
}
