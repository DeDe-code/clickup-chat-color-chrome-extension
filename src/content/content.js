/* global chrome */

// ✅ Safeguard: Exit if not on ClickUp
if (location.hostname !== 'app.clickup.com') {
  throw new Error('ClickUp Message Highlighter aborted: Not on app.clickup.com')
}

// Prevent multiple injections by checking if already initialized
if (window.clickupHighlighterInitialized) {
  console.log('ClickUp Message Highlighter already initialized')
} else {
  window.clickupHighlighterInitialized = true
  console.log('ClickUp Message Highlighter initializing...')

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ping') {
      sendResponse({ status: 'active' })
      return true
    }
    return false
  })

  // Default colors that will be overridden by storage values if available
  let currentBackground = '#fe5722'
  let currentText = '#2097f3'
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

  function applyStandardUnreadStyles(bg = currentBackground, txt = currentText) {
    const items = document.querySelectorAll('.has-unread')
    const icons = document.querySelectorAll('.has-unread cu3-icon, .row-actions cu3-icon')

    items.forEach((el) => {
      el.style.transition = 'background-color 0.3s, color 0.3s'
      el.style.backgroundColor = bg
      el.style.color = txt
      el.style.borderRadius = currentBorderRadius
      el.style.padding = '0.3rem'
    })

    icons.forEach((el) => {
      el.style.transition = 'color 0.3s'
      el.style.color = txt
    })

    console.log(`ClickUp Message Highlighter: Applied styles - BG: ${bg}, Text: ${txt}`)
  }

  function resetStyles(el) {
    el.style.transition = 'background-color 0.3s, color 0.3s'
    el.style.backgroundColor = ''
    el.style.color = ''
    el.style.borderRadius = ''
    el.style.padding = ''
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

  // Optionally, observe for changes to these variables
  const cuVarObserver = new MutationObserver(() => {
    saveClickUpCssVars()
  })
  cuVarObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style', 'class'],
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

  // ✅ Observe changes to apply/remove styles dynamically
  const globalObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const el = mutation.target
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class' &&
        !el.classList.contains('has-unread')
      ) {
        resetStyles(el)
      }
    })

    applyStandardUnreadStyles()
  })

  globalObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  })
} // End of initialization check
