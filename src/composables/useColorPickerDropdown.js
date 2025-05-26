import { onMounted, onBeforeUnmount } from 'vue'

export function useWatchColorPickerDropdown() {
  let observer = null
  let lastVisible = false

  const isAnyDropdownVisible = () => {
    const dropdowns = document.querySelectorAll('div[data-popper-placement="bottom"]')
    return Array.from(dropdowns).some((el) => {
      const style = window.getComputedStyle(el)
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
    })
  }

  const updateBodyHeight = () => {
    const visible = isAnyDropdownVisible()

    if (visible && !lastVisible) {
      console.log('✅ Dropdown appeared')
      document.documentElement.style.setProperty('height', 'auto', 'important')
      document.documentElement.style.setProperty('overflow', 'auto', 'important')
      document.body.style.setProperty('height', '120rem', 'important')
      document.body.style.setProperty('overflow', 'auto', 'important')
      lastVisible = true
    } else if (!visible && lastVisible) {
      console.log('🌀 Dropdown disappeared')
      document.body.style.setProperty('height', '', 'important')
      document.body.style.setProperty('overflow', '', 'important')
      lastVisible = false
    }
  }

  onMounted(() => {
    observer = new MutationObserver(() => {
      updateBodyHeight()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style'],
    })

    updateBodyHeight() // In case it's already open
  })

  onBeforeUnmount(() => {
    if (observer) observer.disconnect()
    document.body.style.setProperty('height', '', 'important')
    document.body.style.setProperty('overflow', '', 'important')
  })
}
