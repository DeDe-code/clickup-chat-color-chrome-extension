# Extension Loading Instructions - July 11, 2025

## ✅ Extension Successfully Built

The extension has been rebuilt and all required files are now present in the `dist/` folder:

- ✅ `manifest.json` - Extension configuration
- ✅ `content.js` - Content script (minified)
- ✅ `background.js` - Background service worker
- ✅ `popup.js` - Popup interface
- ✅ `index.html` - Popup HTML
- ✅ All icon files (16px, 32px, 48px, 128px)

## 🚀 How to Load in Chrome

### Step 1: Open Chrome Extensions

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)

### Step 2: Load the Extension

1. Click "Load unpacked" button
2. Navigate to and select this folder:
   ```
   ~/Desktop/umc-chrome-extention/umc-chrome-extention/dist
   ```
3. Click "Select Folder"

### Step 3: Verify Installation

- Extension should appear in your extensions list as "ClickUp Extender"
- You should see the extension icon in your Chrome toolbar

## 🔍 Testing the Extension

### Quick Test on ClickUp

1. Go to `https://app.clickup.com`
2. **Expected:** Red notification "🔥 ClickUp Extender LOADED!" appears for 5 seconds
3. **Console Test:** Open DevTools (F12) and check for initialization logs
4. **Manual Test:** Press `Ctrl+Shift+H` to test highlighting

### If You See Errors

- **"Could not load javascript 'content.js'"** → This was fixed by rebuilding
- **"Could not load manifest"** → This was fixed by rebuilding
- **Extension not working on ClickUp** → Check browser console for error messages

## 🛠️ Development Commands

```bash
# Rebuild if needed
npm run build

# Development with auto-reload
npm run dev:ext:browser

# Clean rebuild
npm run dev:clean
```

## ✨ What's New

- Extension name: "ClickUp Extender"
- Chat channel specific highlighting
- Enhanced debugging tools
- Comprehensive error handling

The extension is now ready to use! 🎉
