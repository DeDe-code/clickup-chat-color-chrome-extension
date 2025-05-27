/* global chrome */

let currentBackground = '#fe5722'
let currentText = '#2097f3'
let currentBorderRadius = '2rem'
let incidentWasUnread = false // 🆕 Track if "Incidents" has been styled

function applyStyles(bg = currentBackground, txt = currentText) {
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
}

function resetStyles(el) {
  el.style.transition = 'background-color 0.3s, color 0.3s'
  el.style.backgroundColor = ''
  el.style.color = ''
  el.style.borderRadius = ''
  el.style.padding = ''
}

function findIncidentsChannel() {
  const items = document.querySelectorAll('cu-sidebar-row-layout')
  for (const el of items) {
    const label = el.querySelector('.room-name__text')
    if (label && label.textContent.trim() === 'Incidents') {
      return el
    }
  }
  return null
}

function onIncidentsClick(e) {
  const el = e.currentTarget
  resetStyles(el)
  incidentWasUnread = false // ✅ Prevent reapplying until a new message arrives
}

function applyIncidentsPatch() {
  const topItem = document.querySelector('cu-menu-list cu-sidebar-row-layout')
  const allItems = document.querySelectorAll('cu-sidebar-row-layout')

  let incidentChannel = null

  allItems.forEach((el) => {
    const label = el.querySelector('.room-name__text')
    if (label && label.textContent.trim() === 'Incidents') {
      incidentChannel = el
    }
  })

  if (!incidentChannel) return

  // Attach click reset (safe to repeat)
  incidentChannel.removeEventListener('click', onIncidentsClick)
  incidentChannel.addEventListener('click', onIncidentsClick)

  if (incidentChannel === topItem && !incidentWasUnread) {
    // If it's at the top and hasn't been styled yet → apply custom style
    incidentChannel.style.transition = 'background-color 0.3s, color 0.3s'
    incidentChannel.style.backgroundColor = currentBackground
    incidentChannel.style.color = currentText
    incidentChannel.style.borderRadius = currentBorderRadius
    incidentChannel.style.padding = '0.3rem'
    incidentWasUnread = true
  }
}

// ✅ Initial load
chrome.storage.local.get(['backgroundColor', 'textColor'], (result) => {
  currentBackground = result.backgroundColor || currentBackground
  currentText = result.textColor || currentText
  applyStyles(currentBackground, currentText)
  applyIncidentsPatch()
})

// ✅ Listen for color changes from popup
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    currentBackground = changes.backgroundColor?.newValue || currentBackground
    currentText = changes.textColor?.newValue || currentText
    applyStyles(currentBackground, currentText)
    applyIncidentsPatch()
  }
})

// ✅ MutationObserver for both normal unread logic + 'Incidents' patch
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    const el = mutation.target

    // Reset style when a standard .has-unread class is removed
    if (
      mutation.type === 'attributes' &&
      mutation.attributeName === 'class' &&
      !el.classList.contains('has-unread')
    ) {
      resetStyles(el)
    }
  })

  applyStyles()
  applyIncidentsPatch()
})

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class'],
})
