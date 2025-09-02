// --- Error notification helper ---
function showError(message, action = null) {
  console.error(message)
  try {
    let banner = document.getElementById('clickup-extender-error-banner')
    if (!banner) {
      banner = document.createElement('div')
      banner.id = 'clickup-extender-error-banner'
      banner.style.position = 'fixed'
      banner.style.bottom = '16px'
      banner.style.left = '50%'
      banner.style.transform = 'translateX(-50%)'
      banner.style.background = '#e53935'
      banner.style.color = '#fff'
      banner.style.padding = '0.75em 1.5em'
      banner.style.borderRadius = '8px'
      banner.style.zIndex = '99999'
      banner.style.fontSize = '1rem'
      banner.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)'
      banner.style.maxWidth = '90vw'
      banner.style.textAlign = 'center'
      banner.style.display = 'flex'
      banner.style.alignItems = 'center'
      banner.style.gap = '1em'
      document.body.appendChild(banner)
    }
    banner.innerHTML = `<span>${message}</span>`
    if (action) {
      let actionBtn = document.createElement('button')
      actionBtn.textContent = action.label
      actionBtn.style.marginLeft = '1em'
      actionBtn.style.background = '#fff'
      actionBtn.style.color = '#e53935'
      actionBtn.style.border = 'none'
      actionBtn.style.borderRadius = '4px'
      actionBtn.style.padding = '0.3em 0.8em'
      actionBtn.style.cursor = 'pointer'
      actionBtn.onclick = action.handler
      banner.appendChild(actionBtn)
    }
    let closeBtn = document.createElement('button')
    closeBtn.textContent = '×'
    closeBtn.setAttribute('aria-label', 'Dismiss error')
    closeBtn.style.marginLeft = '1em'
    closeBtn.style.background = 'transparent'
    closeBtn.style.color = '#fff'
    closeBtn.style.border = 'none'
    closeBtn.style.fontSize = '1.2em'
    closeBtn.style.cursor = 'pointer'
    closeBtn.onclick = () => {
      banner.style.display = 'none'
    }
    banner.appendChild(closeBtn)
    banner.style.display = 'flex'
    setTimeout(() => {
      banner.style.display = 'none'
    }, 8000)
  } catch (e) {
    console.error('Failed to show error banner:', e)
  }
}
// -------------------------------------------------------------
// ClickUp Extender Content Script
// -------------------------------------------------------------
// Highlights unread chat channels in ClickUp using custom colors.
// Uses Chrome storage to persist color settings and observes DOM changes
// to keep styles in sync with the app's theme and user preferences.
//
// CSS Variables Used:
//   --cu-background-primary: Main background color for ClickUp theme
//   --cu-content-primary: Main text color for ClickUp theme
// These are resolved and applied to chat channel elements with unread messages.
// -------------------------------------------------------------
/* global chrome */

// ✅ Safeguard: Exit if not on ClickUp
if (location.hostname !== 'app.clickup.com') {
  throw new Error('ClickUp Extender aborted: Not on app.clickup.com')
}

// Prevent multiple injections by checking if already initialized
if (window.clickupHighlighterInitialized) {
  // Already initialized
} else {
  window.clickupHighlighterInitialized = true

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ping') {
      sendResponse({ status: 'active' })
      return true
    }
    return false
  })

  // Default colors: use ClickUp theme CSS variables
  let currentBackground = 'var(--cu-background-primary)'
  let currentText = 'var(--cu-content-primary)'
  let currentBorderRadius = '2rem'

  // Load saved colors from Chrome storage immediately
  try {
    chrome.storage.local.get(['effectiveBackgroundColor', 'effectiveTextColor'], (result) => {
      if (result.effectiveBackgroundColor) {
        currentBackground = result.effectiveBackgroundColor
      }
      if (result.effectiveTextColor) {
        currentText = result.effectiveTextColor
      }
      // Apply styles immediately after loading from storage
      try {
        applyStandardUnreadStyles(currentBackground, currentText)
      } catch {
        showError('Failed to apply styles. Try reloading the extension.')
      }
    })
  } catch {
    showError('Failed to access Chrome storage. Please check your browser settings.')
  }

  // Helper: resolve CSS variable to actual color value
  /**
   * Resolves a CSS variable (e.g., 'var(--cu-background-primary)') to its actual value.
   * @param {string} value - CSS variable or color string
   * @returns {string} - Resolved color value
   */
  function resolveCssVar(value) {
    if (typeof value === 'string' && value.startsWith('var(')) {
      const varName = value.match(/var\((--[^)]+)\)/)
      if (varName && varName[1]) {
        return (
          getComputedStyle(document.documentElement).getPropertyValue(varName[1]).trim() || value
        )
      }
    }
    return value
  }

  // Create and inject CSS styles instead of applying inline styles
  /**
   * Creates and injects a <style> element targeting unread chat channels.
   * Uses resolved background and text colors from CSS variables or user settings.
   * @param {string} bg - Background color
   * @param {string} txt - Text color
   */
  function createTargetedStyles(bg = currentBackground, txt = currentText) {
    // Always resolve CSS variables to actual color values
    const resolvedBg = resolveCssVar(bg)
    const resolvedTxt = resolveCssVar(txt)
    // Remove existing style element if it exists
    try {
      const existingStyle = document.getElementById('clickup-highlighter-styles')
      if (existingStyle) {
        existingStyle.remove()
      }
    } catch {
      showError('Failed to remove existing style. Try reloading the extension.')
    }

    // Create new style element with targeted CSS
    const styleElement = document.createElement('style')
    styleElement.id = 'clickup-highlighter-styles'

    // CHAT CHANNEL SPECIFIC selectors - only target chat channels, not tasks/other elements
    styleElement.textContent = `
      /* Target ONLY chat channel elements with unread messages */
      [class*="channel"].has-unread,
      [class*="chat"].has-unread,
      [class*="conversation"].has-unread,
      [class*="message"][class*="channel"].has-unread,
      .cu-sidebar-nav-item.has-unread,
      .cu-sidebar-nav-list-item.has-unread,
      [class*="sidebar"][class*="nav"].has-unread,
      [class*="nav"][class*="item"].has-unread[class*="channel"],
      [class*="nav"][class*="item"].has-unread[class*="chat"],
      [data-test*="channel"].has-unread,
      [data-test*="chat"].has-unread {
        background-color: ${resolvedBg} !important;
        color: ${resolvedTxt} !important;
        border-radius: ${currentBorderRadius} !important;
        padding: 0.3rem !important;
        transition: background-color 0.3s, color 0.3s !important;
      }

      /* Target text elements within unread chat channels */
      [class*="channel"].has-unread [class*="name"],
      [class*="chat"].has-unread [class*="name"],
      [class*="conversation"].has-unread [class*="name"],
      .cu-sidebar-nav-item.has-unread [class*="name"],
      .cu-sidebar-nav-list-item.has-unread [class*="name"],
      [class*="sidebar"][class*="nav"].has-unread [class*="text"],
      [class*="nav"][class*="item"].has-unread[class*="channel"] [class*="text"],
      [class*="nav"][class*="item"].has-unread[class*="chat"] [class*="text"] {
        color: ${resolvedTxt} !important;
      }

      /* Target icons within unread chat channels */
      [class*="channel"].has-unread cu3-icon,
      [class*="chat"].has-unread cu3-icon,
      [class*="conversation"].has-unread cu3-icon,
      .cu-sidebar-nav-item.has-unread cu3-icon,
      .cu-sidebar-nav-list-item.has-unread cu3-icon,
      [class*="sidebar"][class*="nav"].has-unread [class*="icon"],
      [class*="nav"][class*="item"].has-unread[class*="channel"] [class*="icon"],
      [class*="nav"][class*="item"].has-unread[class*="chat"] [class*="icon"] {
        color: ${resolvedTxt} !important;
        transition: color 0.3s !important;
      }

      /* Target notification dots/badges for chat channels only */
      [class*="channel"].has-unread .cu-notification-dot,
      [class*="chat"].has-unread .cu-notification-dot,
      [class*="conversation"].has-unread .unread-indicator,
      .cu-sidebar-nav-item.has-unread [class*="dot"],
      .cu-sidebar-nav-list-item.has-unread [class*="badge"],
      [class*="sidebar"][class*="nav"].has-unread [class*="dot"],
      [class*="nav"][class*="item"].has-unread[class*="channel"] [class*="badge"],
      [class*="nav"][class*="item"].has-unread[class*="chat"] [class*="dot"] {
        background-color: ${resolvedTxt} !important;
      }

      /* Exclude tasks, docs, and other non-chat elements explicitly */
      [class*="task"].has-unread:not([class*="channel"]):not([class*="chat"]),
      [class*="doc"].has-unread,
      [class*="goal"].has-unread,
      [class*="project"].has-unread,
      [class*="list"].has-unread:not([class*="channel"]):not([class*="chat"]),
      [class*="folder"].has-unread {
        background-color: initial !important;
        color: initial !important;
      }
    `

    // Inject the style into the document head
    try {
      document.head.appendChild(styleElement)
    } catch {
      showError('Failed to inject style element. Try reloading the extension.')
    }

    console.log(`ClickUp Extender: Applied enhanced CSS styles - BG: ${bg}, Text: ${txt}`)
    console.log('Style element injected:', styleElement)
  }

  /**
   * Applies enhanced CSS styles to unread chat channels using createTargetedStyles.
   * @param {string} bg - Background color
   * @param {string} txt - Text color
   */
  function applyStandardUnreadStyles(bg = currentBackground, txt = currentText) {
    // Use the new targeted CSS approach instead of inline styles
    createTargetedStyles(bg, txt)

    // Additional debugging to verify styles are applied
    setTimeout(() => {
      const injectedStyle = document.getElementById('clickup-highlighter-styles')
      if (injectedStyle) {
        console.log(
          '✅ Style element confirmed in DOM:',
          injectedStyle.textContent.length,
          'characters',
        )
      } else {
        console.log('❌ Style element not found in DOM')
      }

      // Test if any of our chat channel selectors actually match elements
      const testSelectors = [
        '[class*="channel"].has-unread',
        '[class*="chat"].has-unread',
        '[class*="conversation"].has-unread',
        '.cu-sidebar-nav-item.has-unread',
        '.cu-sidebar-nav-list-item.has-unread',
        '[class*="sidebar"][class*="nav"].has-unread',
        '[data-test*="channel"].has-unread',
        '[data-test*="chat"].has-unread',
      ]

      testSelectors.forEach((selector) => {
        const matches = document.querySelectorAll(selector)
        console.log(`Selector "${selector}" matches: ${matches.length} elements`)
      })
    }, 1000)
  }

  /**
   * Finds the first DOM element that defines ClickUp theme CSS variables.
   * @returns {Element} - Element with theme variables or document root
   */
  function findClickUpCssVarElement() {
    // Search for the first element that defines either variable
    return (
      [...document.querySelectorAll('*')].find(
        (el) =>
          getComputedStyle(el).getPropertyValue('--cu-content-primary') ||
          getComputedStyle(el).getPropertyValue('--cu-background-primary'),
      ) || document.documentElement
    )
  }

  // ✅ Save ClickUp CSS variable values to chrome.storage
  /**
   * Saves current ClickUp theme CSS variable values to Chrome storage.
   */
  function saveClickUpCssVars() {
    const el = findClickUpCssVarElement()
    const cuContentPrimary = getComputedStyle(el).getPropertyValue('--cu-content-primary').trim()
    const cuBackgroundPrimary = getComputedStyle(el)
      .getPropertyValue('--cu-background-primary')
      .trim()
    console.log(`Saving ClickUp CSS vars from`, el, cuContentPrimary, cuBackgroundPrimary)

    chrome.storage.local.set({
      cuContentPrimary,
      cuBackgroundPrimary,
    })
  }

  // Save on initial load
  saveClickUpCssVars()

  // Enhanced: Observe only the element that defines theme variables for changes
  let lastCuContentPrimary = ''
  let lastCuBackgroundPrimary = ''
  let cuVarObserver = null
  let observedElement = null
  /**
   * Observes DOM for theme changes and updates stored CSS variable values if changed.
   * Debounced to avoid excessive DOM writes.
   */
  function saveClickUpCssVarsIfChanged() {
    const el = findClickUpCssVarElement()
    const cuContentPrimary = getComputedStyle(el).getPropertyValue('--cu-content-primary').trim()
    const cuBackgroundPrimary = getComputedStyle(el)
      .getPropertyValue('--cu-background-primary')
      .trim()
    if (
      cuContentPrimary !== lastCuContentPrimary ||
      cuBackgroundPrimary !== lastCuBackgroundPrimary
    ) {
      lastCuContentPrimary = cuContentPrimary
      lastCuBackgroundPrimary = cuBackgroundPrimary
      chrome.storage.local.set({ cuContentPrimary, cuBackgroundPrimary })
      console.log('[ClickUp Extender] Theme vars updated:', cuContentPrimary, cuBackgroundPrimary)
    }
  }

  // Debounce theme variable save
  const debouncedSaveClickUpCssVarsIfChanged = debounce(saveClickUpCssVarsIfChanged, 200)

  // Initial save
  saveClickUpCssVarsIfChanged()

  // Observe only the element that defines theme variables for style/class changes
  function setupCuVarObserver() {
    if (cuVarObserver) {
      cuVarObserver.disconnect()
      cuVarObserver = null
    }
    observedElement = findClickUpCssVarElement()
    cuVarObserver = new MutationObserver(() => {
      debouncedSaveClickUpCssVarsIfChanged()
    })
    cuVarObserver.observe(observedElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      subtree: false,
    })
  }

  setupCuVarObserver()

  // Disconnect observer when window is hidden or unloaded
  window.addEventListener('beforeunload', () => {
    if (cuVarObserver) cuVarObserver.disconnect()
  })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && cuVarObserver) cuVarObserver.disconnect()
    else if (!document.hidden) setupCuVarObserver()
  })

  // ✅ Initial load
  chrome.storage.local.get(['backgroundColor', 'textColor'], (result) => {
    currentBackground = result.backgroundColor || currentBackground
    currentText = result.textColor || currentText
    try {
      applyStandardUnreadStyles(currentBackground, currentText)
    } catch {
      showError('Failed to apply initial styles. Try reloading the extension.')
    }
  })

  // ✅ Listen for color changes from popup
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      try {
        currentBackground = changes.backgroundColor?.newValue || currentBackground
        currentText = changes.textColor?.newValue || currentText
        applyStandardUnreadStyles(currentBackground, currentText)
      } catch {
        showError('Failed to apply changed colors. Try reloading the extension.')
      }
    }
  })

  // ✅ Listen for direct messages from the popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
      if (message.action === 'updateColors') {
        currentBackground = message.backgroundColor || currentBackground
        currentText = message.textColor || currentText
        try {
          applyStandardUnreadStyles(currentBackground, currentText)
        } catch {
          showError('Failed to apply updated colors. Try reloading the extension.')
          sendResponse({ success: false, message: 'Failed to update colors' })
          return true
        }
        sendResponse({ success: true, message: 'Colors updated successfully' })
        return true
      }
    } catch {
      showError('Error handling message. Try reloading the extension.')
      sendResponse({ success: false, message: 'Error handling message' })
      return true
    }
  })

  // Debounce utility
  /**
   * Utility to debounce function calls (e.g., style application after DOM mutations).
   * @param {Function} fn - Function to debounce
   * @param {number} delay - Delay in ms
   * @returns {Function} - Debounced function
   */
  function debounce(fn, delay) {
    let timer
    return function (...args) {
      clearTimeout(timer)
      timer = setTimeout(() => fn.apply(this, args), delay)
    }
  }
  const applyStylesDebounced = debounce(applyStandardUnreadStyles, 200)

  // Find the main chat channel container (update selector as needed)
  /**
   * Finds the main chat channel container in ClickUp's sidebar.
   * @returns {Element|null} - Chat container element or null
   */
  function getChatContainer() {
    return document.querySelector('.cu-sidebar-nav-list, [class*="chat-list"], [class*="sidebar"]')
  }

  // Only observe chat container for mutations
  /**
   * Sets up a MutationObserver to reapply styles when chat channels change.
   */
  function setupChatObserver() {
    const chatContainer = getChatContainer()
    if (!chatContainer) return
    const globalObserver = new MutationObserver((mutations) => {
      let shouldReapplyStyles = false
      mutations.forEach((mutation) => {
        // Only process childList or attribute changes relevant to chat channels
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (
                node.classList?.contains('has-unread') ||
                node.querySelector?.('.has-unread') ||
                (node.className &&
                  (node.className.includes('channel') ||
                    node.className.includes('chat') ||
                    node.className.includes('conversation') ||
                    node.className.includes('sidebar-nav')))
              ) {
                shouldReapplyStyles = true
              }
            }
          })
        } else if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const el = mutation.target
          if (
            el.classList?.contains('has-unread') &&
            (el.className.includes('channel') ||
              el.className.includes('chat') ||
              el.className.includes('conversation') ||
              el.className.includes('sidebar-nav'))
          ) {
            shouldReapplyStyles = true
          }
        }
      })
      if (shouldReapplyStyles) {
        applyStylesDebounced()
      }
    })
    try {
      globalObserver.observe(chatContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
      })
    } catch {
      showError('Failed to observe chat container changes. Try reloading the extension.')
    }
  }

  // Setup observer on initial load and after navigation
  setupChatObserver()
} // End of initialization check
