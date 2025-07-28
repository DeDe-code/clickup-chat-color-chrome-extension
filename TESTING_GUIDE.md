# ClickUp Extender - Testi1. **Expected:** A red notification box saying "🔥 ClickUp Extender LOADED!" should appear in the top-right corner for 5 secondsg & Troubleshooting Guide

## 🚀 How to Load the Extension in Chrome

1. **Build the extension:**

   ```bash
   npm run build
   ```

2. **Load in Chrome:**

   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

3. **Verify installation:**
   - The extension should appear in your extensions list
   - You should see the ClickUp Extender icon in your toolbar

## 🔍 Testing Steps

### Step 1: Verify Extension Loading

1. Go to `https://app.clickup.com`
2. **Expected:** A red notification box saying "🔥 ClickUp Highlighter LOADED!" should appear in the top-right corner for 5 seconds
3. **If not visible:** Check browser console (F12 → Console) for any error messages

### Step 2: Check Console Logs

1. Open browser DevTools (F12)
2. Go to Console tab
3. **Expected logs:**
   ```
   🚀 ClickUp Extender initializing...
   Current URL: https://app.clickup.com/...
   User agent: Mozilla/5.0...
   Document ready state: complete
   🔥 Test element created and will be visible for 5 seconds
   💡 Tip: Press Ctrl+Shift+H on ClickUp to manually test highlighting
   ```

### Step 3: Manual Chat Channel Highlighting Test

1. On any ClickUp page, press `Ctrl+Shift+H`
2. **Expected:** Chat channel elements should turn bright pink/green with yellow borders and pulse animation for 10 seconds
3. **This helps identify:** What chat channel elements the extension can target (vs tasks/docs which should NOT be highlighted)

### Step 4: DOM Structure Analysis

1. After 2 seconds on ClickUp, check console for DOM debug output
2. **Expected:** Log showing found elements for various selectors
3. **Look for:** Elements with classes containing "unread", "notification", etc.

## 🛠️ Troubleshooting

### Issue: Extension doesn't load at all

**Possible causes:**

- Manifest errors
- Permission issues
- Build errors

**Solutions:**

1. Check `chrome://extensions/` for error messages
2. Verify all files are in `dist/` folder after build
3. Check browser console for JavaScript errors

### Issue: No visual changes on ClickUp

**Possible causes:**

- ClickUp DOM structure changed
- Selectors don't match current elements
- CSS specificity issues

**Solutions:**

1. Use manual test (`Ctrl+Shift+H`) to see what elements can be targeted
2. Check console logs for selector match counts
3. Inspect ClickUp elements to understand current class names

### Issue: Extension loads but styles don't apply

**Possible causes:**

- CSS injection failed
- Selectors are too specific
- ClickUp's CSS overrides our styles

**Solutions:**

1. Check if style element exists: `document.getElementById('clickup-highlighter-styles')`
2. Try manual test to confirm CSS injection works
3. Inspect elements to see if our styles are applied but overridden

## 🔧 Advanced Debugging

### Check Extension Status

```javascript
// In browser console on ClickUp:
console.log('Extension initialized:', window.clickupHighlighterInitialized)
console.log('Style element:', document.getElementById('clickup-highlighter-styles'))
```

### Inspect Current Selectors

```javascript
// Test current selectors:
const selectors = [
  '.cu-task-row.has-unread',
  '.cu-list-item.has-unread',
  '.cu-task-item.has-unread',
  '[class*="unread"]',
  '[class*="notification"]',
]
selectors.forEach((sel) => {
  console.log(sel, document.querySelectorAll(sel).length)
})
```

### Force Style Application

```javascript
// Manually apply test styles:
const style = document.createElement('style')
style.textContent = `
  [class*="unread"] { 
    background: red !important; 
    color: white !important; 
  }
`
document.head.appendChild(style)
```

## 📝 Common ClickUp Chat Channel DOM Patterns

The extension now specifically targets these chat-related patterns:

**Chat Channel Elements:**

- Chat channels: `[class*="channel"]`, `[class*="chat"]`, `[class*="conversation"]`
- Sidebar navigation: `.cu-sidebar-nav-item`, `.cu-sidebar-nav-list-item`
- Data attributes: `[data-test*="channel"]`, `[data-test*="chat"]`

**Explicitly Excluded (No Highlighting):**

- Task elements: `[class*="task"]` (unless also chat-related)
- Document elements: `[class*="doc"]`
- Goal/project elements: `[class*="goal"]`, `[class*="project"]`
- General lists: `[class*="list"]` (unless chat-related)

## 🎯 Next Steps If Issues Persist

1. **Inspect actual ClickUp DOM structure:**

   - Use browser DevTools to examine unread message elements
   - Note the exact class names and hierarchy

2. **Update selectors based on findings:**

   - Modify the CSS selectors in `createTargetedStyles()` function
   - Test with manual keyboard shortcut

3. **Consider alternative approaches:**
   - Use MutationObserver to catch style changes
   - Apply styles with higher specificity
   - Use different injection timing (document_start vs document_idle)

## 📞 Support

If you continue having issues:

1. Share console logs from the debugging steps above
2. Share HTML structure of unread elements (right-click → Inspect)
3. Note your Chrome version and ClickUp interface version
