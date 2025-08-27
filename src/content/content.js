/* global chrome */

// ✅ Safeguard: Exit if not on ClickUp
if (location.hostname !== 'app.clickup.com') {
  throw new Error('ClickUp Extender aborted: Not on app.clickup.com')
}

// Prevent multiple injections by checking if already initialized
if (window.clickupHighlighterInitialized) {
  console.log('ClickUp Extender already initialized')
} else {
  window.clickupHighlighterInitialized = true
  console.log('🚀 ClickUp Extender initializing...')
  console.log('Current URL:', window.location.href)
  console.log('User agent:', navigator.userAgent)
  console.log('Document ready state:', document.readyState)

  // Uncomment the following block for development/debug only:
  // const DEBUG = false;
  // if (DEBUG) {
  //   function createTestElement() {
  //     const testDiv = document.createElement('div')
  //     testDiv.id = 'clickup-highlighter-test'
  //     testDiv.style.cssText = `
  //       position: fixed;
  //       top: 10px;
  //       right: 10px;
  //       background: #ff0000;
  //       color: #ffffff;
  //       padding: 10px;
  //       border-radius: 5px;
  //       z-index: 999999;
  //       font-family: Arial;
  //       font-size: 14px;
  //       font-weight: bold;
  //       border: 2px solid #ffffff;
  //     `
  //     testDiv.textContent = '🔥 ClickUp Extender LOADED!'
  //     document.body.appendChild(testDiv)
  //     setTimeout(() => { testDiv.remove() }, 5000)
  //     console.log('🔥 Test element created and will be visible for 5 seconds')
  //   }
  //   createTestElement();
  //   document.addEventListener('keydown', function (event) {
  //     if (event.ctrlKey && event.shiftKey && event.key === 'H') {
  //       console.log('🔥 Manual highlight test triggered!')
  //       const testStyle = document.createElement('style')
  //       testStyle.id = 'manual-test-style'
  //       testStyle.textContent = `
  //         [class*="channel"],
  //         [class*="chat"],
  //         [class*="conversation"],
  //         .cu-sidebar-nav-item,
  //         .cu-sidebar-nav-list-item,
  //         [class*="sidebar"][class*="nav"],
  //         [data-test*="channel"],
  //         [data-test*="chat"],
  //         [class*="unread"],
  //         [class*="notification"] {
  //           background-color: #ff00ff !important;
  //           color: #00ff00 !important;
  //           border: 3px solid #ffff00 !important;
  //           animation: pulse 1s infinite !important;
  //         }
  //         @keyframes pulse {
  //           0% { opacity: 1; }
  //           50% { opacity: 0.5; }
  //           100% { opacity: 1; }
  //         }
  //       `;
  //       const existing = document.getElementById('manual-test-style')
  //       if (existing) existing.remove()
  //       document.head.appendChild(testStyle)
  //       console.log('🎨 Manual test style applied! Check for bright pink/green chat channel elements.')
  //       setTimeout(() => { testStyle.remove(); console.log('🔥 Manual test style removed') }, 10000)
  //     }
  //   });
  //   console.log('💡 Tip: Press Ctrl+Shift+H on ClickUp to manually test highlighting')
  // }

  // Add debugging function to understand ClickUp's DOM structure
  function debugClickUpStructure() {
    console.log('=== ClickUp DOM Debug ===')

    // Look for chat channel specific patterns
    const possibleUnreadSelectors = [
      '[class*="channel"].has-unread',
      '[class*="chat"].has-unread',
      '[class*="conversation"].has-unread',
      '.cu-sidebar-nav-item.has-unread',
      '.cu-sidebar-nav-list-item.has-unread',
      '[class*="sidebar"][class*="nav"].has-unread',
      '[data-test*="channel"].has-unread',
      '[data-test*="chat"].has-unread',
      // General patterns for discovery
      '.has-unread',
      '[class*="unread"]',
      '[class*="notification"]',
      '[class*="channel"]',
      '[class*="chat"]',
      '[class*="conversation"]',
      '.cu-sidebar-nav-item',
      '.cu-sidebar-nav-list-item',
    ]

    possibleUnreadSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector)
      if (elements.length > 0) {
        console.log(`Found ${elements.length} elements for selector: ${selector}`)
        elements.forEach((el, index) => {
          if (index < 3) {
            // Show first 3 matches
            console.log(`  - Element ${index + 1}:`, el.className, el)
          }
        })
      }
    })

    // Look for any elements with "unread", "channel", "chat" in their classes
    const allElements = document.querySelectorAll(
      '*[class*="unread"], *[class*="notification"], *[class*="channel"], *[class*="chat"]',
    )
    console.log(
      `Total elements with 'unread', 'notification', 'channel', or 'chat' in class: ${allElements.length}`,
    )

    console.log('=== End ClickUp DOM Debug ===')
  }

  // Run debug after a short delay to let ClickUp load
  setTimeout(debugClickUpStructure, 2000)

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

  // Helper: resolve CSS variable to actual color value
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
  function createTargetedStyles(bg = currentBackground, txt = currentText) {
    // Always resolve CSS variables to actual color values
    const resolvedBg = resolveCssVar(bg)
    const resolvedTxt = resolveCssVar(txt)
    // Remove existing style element if it exists
    const existingStyle = document.getElementById('clickup-highlighter-styles')
    if (existingStyle) {
      existingStyle.remove()
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
    document.head.appendChild(styleElement)

    console.log(`ClickUp Extender: Applied enhanced CSS styles - BG: ${bg}, Text: ${txt}`)
    console.log('Style element injected:', styleElement)
  }

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

  // Enhanced: Observe the entire DOM for changes to style/class attributes to catch theme changes in real time
  let lastCuContentPrimary = ''
  let lastCuBackgroundPrimary = ''
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

  // Initial save
  saveClickUpCssVarsIfChanged()

  // Observe all elements for style/class changes
  const cuVarObserver = new MutationObserver(() => {
    saveClickUpCssVarsIfChanged()
  })
  cuVarObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style', 'class'],
    subtree: true,
  })

  // ✅ Initial load
  chrome.storage.local.get(['backgroundColor', 'textColor'], (result) => {
    currentBackground = result.backgroundColor || currentBackground
    currentText = result.textColor || currentText
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

  // ✅ Listen for direct messages from the popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message)

    if (message.action === 'updateColors') {
      currentBackground = message.backgroundColor || currentBackground
      currentText = message.textColor || currentText

      // Immediately apply the new styles
      applyStandardUnreadStyles(currentBackground, currentText)

      // Send confirmation back to popup
      sendResponse({ success: true, message: 'Colors updated successfully' })
      return true // Keep the message channel open for the async response
    }
  })

  // Debounce utility
  function debounce(fn, delay) {
    let timer
    return function (...args) {
      clearTimeout(timer)
      timer = setTimeout(() => fn.apply(this, args), delay)
    }
  }
  const applyStylesDebounced = debounce(applyStandardUnreadStyles, 200)

  // Find the main chat channel container (update selector as needed)
  function getChatContainer() {
    return document.querySelector('.cu-sidebar-nav-list, [class*="chat-list"], [class*="sidebar"]')
  }

  // Only observe chat container for mutations
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
    globalObserver.observe(chatContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    })
  }

  // Setup observer on initial load and after navigation
  setupChatObserver()
} // End of initialization check
