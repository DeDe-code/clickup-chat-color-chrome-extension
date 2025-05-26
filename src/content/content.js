/* global chrome */

let currentBackground = '#fe5722'
let currentText = '#2097f3'
let currentBorderRadius = '2rem'

function applyStyles(bg, txt) {
  const items = document.querySelectorAll('cu-menu-list .has-unread')
  const icons = document.querySelectorAll(
    'cu-menu-list .has-unread cu3-icon, cu-menu-list .row-actions cu3-icon',
  )

  items.forEach((el) => {
    el.style.backgroundColor = bg
    el.style.color = txt
    el.style.borderRadius = currentBorderRadius
    el.style.padding = '0.3rem'
  })

  icons.forEach((el) => {
    el.style.color = txt
  })
}

// ✅ Initial load
chrome.storage.local.get(['backgroundColor', 'textColor'], (result) => {
  currentBackground = result.backgroundColor || '#fe5722'
  currentText = result.textColor || '#2097f3'
  applyStyles(currentBackground, currentText)
})

// ✅ Listen for changes from popup
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    console.log(changes)
    currentBackground = changes.backgroundColor?.newValue || currentBackground
    currentText = changes.textColor?.newValue || currentText
    applyStyles(currentBackground, currentText)
  }
})

// ✅ Observe DOM and apply styles on changes
new MutationObserver(() => {
  applyStyles(currentBackground, currentText)
}).observe(document.body, { childList: true, subtree: true })
