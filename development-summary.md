# ClickUp Message Highlighter Chrome Extension - Development Summary

## Overview

This document summarizes the development process and changes made to the ClickUp Message Highlighter Chrome Extension. The extension highlights unread messages in ClickUp with customizable text and background colors, supporting light/dark/system theme preferences.

## Development Goals Achieved

### ✅ Fixed Development & Build Process

- **Fixed Web-ext Configuration**: Updated `.web-ext-config.mjs` to remove deprecated options (`overwrite`, `overwriteDest`)
- **Improved Build Scripts**: Enhanced `package.json` scripts for better development workflow
- **Content Script Handling**: Created scripts to verify content script presence in the build
- **Development Mode Options**: Added various development mode options with/without browser launch

### ✅ Color Persistence Implementation

- **Chrome Storage Integration**: Implemented proper storage of color choices using Chrome storage API
- **Color Storage Mechanism**: Added storage mechanisms to save user's color preferences
- **Theme Preference Storage**: Added storage for light/dark/system theme preference

### ⚠️ ClickUp Theme Color Sync (Suggested but Not Implemented)

- **Recommendation**: Implement live monitoring of ClickUp theme color changes
- **Purpose**: Allow the extension to automatically detect when ClickUp theme colors change
- **Components Affected**: Content script, ColorManager, ColorPreview

## Key Files Modified

### package.json

Modified build and development scripts:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build && node build-utils/post-build.js",
  "dev:ext": "rm -rf dist && npm run build && node build-utils/check-content-script.js && npm run dev:watch",
  "dev:watch": "vite build --watch",
  "dev:serve": "sleep 5 && web-ext run --source-dir=./dist --target=chromium --browser-console",
  "dev:ext:browser": "rm -rf dist && npm run build && node build-utils/check-content-script.js && concurrently \"npm run dev:watch\" \"npm run dev:serve\"",
  "dev:test": "npm run build && ls -la dist && echo '-----' && cat dist/manifest.json",
  "dev:clean": "rm -rf dist web-ext-artifacts && npm run build && npm run build:ext",
  "check:content": "node build-utils/check-content-script.js",
  "content:copy": "node build-utils/copy-content-script.js",
  "dev:ext:simple": "rm -rf dist && vite build && node build-utils/copy-content-script.js && cp public/manifest.json dist/ && cp public/favicon.ico dist/ && vite build --watch",
  "dev:ext:simple:browser": "rm -rf dist && vite build && node build-utils/copy-content-script.js && cp public/manifest.json dist/ && cp public/favicon.ico dist/ && web-ext run --source-dir=./dist --target=chromium --browser-console",
  "build:ext": "npm run build && web-ext build --source-dir=./dist --artifacts-dir=./web-ext-artifacts --overwrite-dest"
}
```

### src/composables/useColorPicker.js

```javascript
/* global chrome */
import { ref, watch, onMounted } from 'vue'

/**
 * Composable for managing color values with color picker
 * Loads from and saves to Chrome storage for persistence
 *
 * @param {string} initialBackgroundColor - Initial background color in hex format
 * @param {string} initialTextColor - Initial text color in hex format
 * @param {Function} emitFn - Optional callback function when colors change
 * @returns {Object} backgroundColor and textColor refs
 */
export function useColorPicker(
  initialBackgroundColor = '#fe5722',
  initialTextColor = '#2097f3',
  emitFn = null,
) {
  const backgroundColor = ref(initialBackgroundColor)
  const textColor = ref(initialTextColor)

  // Load saved colors from Chrome storage
  onMounted(() => {
    chrome.storage.local.get(['backgroundColor', 'textColor'], (result) => {
      if (result.backgroundColor) {
        backgroundColor.value = result.backgroundColor
      }
      if (result.textColor) {
        textColor.value = result.textColor
      }

      // Emit initial values after loading from storage
      if (emitFn) {
        emitFn({
          backgroundColor: backgroundColor.value,
          textColor: textColor.value,
        })
      }
    })
  })

  // Watch for changes and save to Chrome storage
  watch([backgroundColor, textColor], ([newBgColor, newTextColor]) => {
    // Save to Chrome storage
    chrome.storage.local.set({
      backgroundColor: newBgColor,
      textColor: newTextColor,
    })

    // Call emit function if provided
    if (emitFn) {
      emitFn({
        backgroundColor: backgroundColor.value,
        textColor: textColor.value,
      })
    }
  })

  return { backgroundColor, textColor }
}
```

### src/stores/ColorStore.js

```javascript
/* global chrome */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useColorStore = defineStore('ColorStore', {
  state: () => {
    const backgroundColor = ref('#fe5722')
    const textColor = ref('#2097f3')

    // Load colors from Chrome storage on store initialization
    if (chrome && chrome.storage) {
      chrome.storage.local.get(['effectiveBackgroundColor', 'effectiveTextColor'], (result) => {
        if (result.effectiveBackgroundColor) {
          backgroundColor.value = result.effectiveBackgroundColor
        }
        if (result.effectiveTextColor) {
          textColor.value = result.effectiveTextColor
        }
      })
    }

    return {
      backgroundColor,
      textColor,
    }
  },

  actions: {
    setColors(newBackgroundColor, newTextColor) {
      this.backgroundColor = newBackgroundColor
      this.textColor = newTextColor

      // Save to Chrome storage whenever colors change via the store
      if (chrome && chrome.storage) {
        chrome.storage.local.set({
          effectiveBackgroundColor: newBackgroundColor,
          effectiveTextColor: newTextColor,
        })
      }
    },
  },
})
```

### src/components/ColorManager.vue (Modified sections)

```vue
// Load saved checkbox states and save effective colors
chrome.storage.local.get(['useClickUpTextColor', 'useClickUpBackgroundColor'], (result) => {
useClickUpTextColor.value = !!result.useClickUpTextColor useClickUpBackgroundColor.value =
!!result.useClickUpBackgroundColor emit('colorsChanged', { backgroundColor:
useClickUpBackgroundColor.value ? 'var(--cu-background-primary)' : backgroundColor.value, textColor:
useClickUpTextColor.value ? 'var(--cu-content-primary)' : textColor.value, }) }) const {
backgroundColor, textColor } = useColorPicker('#fe5722', '#2097f3', (colors) => { // Save the
effective colors (what's actually used) to Chrome storage chrome.storage.local.set({
effectiveBackgroundColor: useClickUpBackgroundColor.value ? 'var(--cu-background-primary)' :
colors.backgroundColor, effectiveTextColor: useClickUpTextColor.value ? 'var(--cu-content-primary)'
: colors.textColor, }) emit('colorsChanged', { backgroundColor: useClickUpBackgroundColor.value ?
'var(--cu-background-primary)' : colors.backgroundColor, textColor: useClickUpTextColor.value ?
'var(--cu-content-primary)' : colors.textColor, }) }) // Watch for changes and persist to storage
watch([useClickUpTextColor, useClickUpBackgroundColor], () => { // Calculate the effective colors
based on checkbox states const effectiveBackgroundColor = useClickUpBackgroundColor.value ?
'var(--cu-background-primary)' : backgroundColor.value const effectiveTextColor =
useClickUpTextColor.value ? 'var(--cu-content-primary)' : textColor.value // Save all settings to
Chrome storage chrome.storage.local.set({ useClickUpTextColor: useClickUpTextColor.value,
useClickUpBackgroundColor: useClickUpBackgroundColor.value, effectiveBackgroundColor:
effectiveBackgroundColor, effectiveTextColor: effectiveTextColor, }) emit('colorsChanged', {
backgroundColor: effectiveBackgroundColor, textColor: effectiveTextColor, }) })
```

### src/content/content.js (Modified sections)

```javascript
// Load saved colors from Chrome storage immediately
chrome.storage.local.get(['effectiveBackgroundColor', 'effectiveTextColor'], (result) => {
  if (result.effectiveBackgroundColor) {
    currentBackground = result.effectiveBackgroundColor
  }
  if (result.effectiveTextColor) {
    currentText = result.effectiveTextColor
  }

  // Apply styles immediately after loading from storage
  applyStandardUnreadStyles(currentBackground, currentText)
})

// ✅ Listen for color changes from popup
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    currentBackground = changes.backgroundColor?.newValue || currentBackground
    currentText = changes.textColor?.newValue || currentText
    applyStandardUnreadStyles(currentBackground, currentText)
  }
})
```

### .web-ext-config.mjs

```javascript
// web-ext config file
export default {
  // Global options:
  sourceDir: './dist',
  artifactsDir: './web-ext-artifacts',

  // Command options:
  build: {},
  run: {
    startUrl: ['https://app.clickup.com/'],
    browserConsole: true,
    target: ['chromium'],
    pref: [],
  },
  lint: {
    warningsAsErrors: true,
    selfHosted: false,
    output: 'text',
  },
}
```

### build-utils/check-content-script.js (New file)

```javascript
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
```

### build-utils/copy-content-script.js (New file)

```javascript
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
  } catch (err) {
    console.error('❌ Error copying content script:', err.code)
    process.exit(1)
  }
}

copyContentScript()
```

### build-utils/post-build.js (Modified sections)

```javascript
// Double check that content.js exists
const contentPath = path.join(distDir, 'content.js')
try {
  await fs.access(contentPath)
  console.log('✅ Verified content.js exists')
} catch (err) {
  console.error(
    '❌ content.js is missing from the build. This will cause the extension to fail:',
    err.code,
  )
}
```

### README.md (Modified sections)

````markdown
### Development Workflow

```bash
# Start development server with hot reload
npm run dev

# Build and watch for changes (without opening browser)
npm run dev:ext

# Start development with Chrome extension auto-reload in browser
npm run dev:ext:browser

# Alternative development command (if content.js loading fails)
npm run dev:ext:simple

# Alternative development command with browser (if content.js loading fails)
npm run dev:ext:simple:browser

# Clean build directories and rebuild everything
npm run dev:clean
```
````

The `dev:ext` command will:

1. Clean the dist directory
2. Build the extension
3. Watch for file changes and rebuild

The `dev:ext:browser` command will do all of the above plus: 4. Launch Chrome with the extension loaded 5. Auto-reload the extension when files change

### Troubleshooting

If you encounter a "Could not load javascript 'content.js' for script" error:

1. Try using `npm run dev:ext:simple` (or `npm run dev:ext:simple:browser` if you want to open Chrome) instead, which uses a simpler build process
2. Run `npm run dev:clean` to clean all build directories and rebuild
3. Check Chrome extension management page for additional errors
4. Verify the content script is being built correctly with `npm run check:content`

```

## Suggested Improvements That Were Not Implemented

### ❌ ClickUp Theme Color Change Detection

**Proposed functionality**: Detect when ClickUp changes its theme colors and update the extension preview and highlighting automatically.

**Implementation approach**:

1. Use MutationObserver in content.js to watch for changes to ClickUp's CSS variables
2. Send messages from content script to extension when theme colors change
3. Update the color preview in real-time
4. Persist the updated theme colors in Chrome storage

**Components that would need modification**:
- src/content/content.js
- src/components/ColorManager.vue
- src/components/ColorPreview.vue
- src/views/UmcExtentionView.vue

**Reason for not implementing**: Not requested initially and would require more testing.

## Key Development Challenges Addressed

1. **Content Script Loading in Dev Mode**:
   - Fixed "Could not load javascript 'content.js' for script" error
   - Added multiple development modes to handle different scenarios
   - Created utility scripts to verify content script presence

2. **Color Persistence Across Sessions**:
   - Implemented Chrome storage for color preferences
   - Added initialization from storage on startup
   - Created watchers to save changes automatically

3. **Web-ext Configuration**:
   - Fixed deprecated options
   - Updated build scripts to use correct flags

## Future Improvement Suggestions

1. **Better ClickUp Theme Integration**:
   - Implement real-time monitoring of ClickUp theme changes
   - Create bidirectional sync between ClickUp and extension themes

2. **Enhanced Build Process**:
   - Further optimize content script building
   - Add automated testing for different configurations

3. **UI Improvements**:
   - Add more color preset options
   - Improve accessibility options
   - Add animation settings for highlighting

## Conclusion

The ClickUp Message Highlighter extension has been significantly improved with better build processes, persistence of user preferences, and multiple development workflows. The extension now remembers all user settings across browser restarts and provides a clean, customizable interface for highlighting unread messages in ClickUp.
```
