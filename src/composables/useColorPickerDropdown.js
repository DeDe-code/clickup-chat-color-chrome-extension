// composables/useWatchDropdown.js
import { onMounted, onBeforeUnmount } from 'vue'

export function useWatchColorPickerDropdown() {
  let observer = null
  let lastState = false

  const expandBody = () => {
    document.documentElement.style.setProperty('height', 'auto', 'important')
    document.documentElement.style.setProperty('overflow', 'auto', 'important')
    document.body.style.setProperty('height', '120rem', 'important')
    document.body.style.setProperty('overflow', 'auto', 'important')
    console.log('✅ Body expanded')
  }

  const resetBody = () => {
    document.body.style.setProperty('height', '', 'important')
    document.body.style.setProperty('overflow', '', 'important')
    console.log('🌀 Body reset to default')
  }

  const updateBodyHeight = () => {
    const dropdown = document.querySelector('div[data-popper-placement="bottom"]')
    const isVisible = dropdown && dropdown.style.display !== 'none'

    if (isVisible && !lastState) {
      expandBody()
      lastState = true
    } else if (!isVisible && lastState) {
      resetBody()
      lastState = false
    }
  }

  onMounted(() => {
    observer = new MutationObserver(() => {
      updateBodyHeight()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    updateBodyHeight() // In case it’s already in the DOM
  })

  onBeforeUnmount(() => {
    if (observer) {
      observer.disconnect()
    }
    resetBody()
  })
}
