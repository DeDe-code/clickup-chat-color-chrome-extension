/* global chrome */

import { ref, watch, onMounted } from 'vue'

export function useTheme() {
  const theme = ref('system')
  let mediaQueryList = null

  function applyTheme(newTheme) {
    let target = document.documentElement
    document.body.removeAttribute('data-theme')
    if (newTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      target.setAttribute('data-theme', isDark ? 'dark' : 'light')
      setupSystemThemeWatcher()
    } else {
      target.setAttribute('data-theme', newTheme)
      if (mediaQueryList) {
        mediaQueryList.removeEventListener('change', handleSystemThemeChange)
        mediaQueryList = null
      }
    }
  }

  function setupSystemThemeWatcher() {
    if (mediaQueryList) {
      mediaQueryList.removeEventListener('change', handleSystemThemeChange)
    }
    mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQueryList.addEventListener('change', handleSystemThemeChange)
  }

  function handleSystemThemeChange(e) {
    if (theme.value === 'system') {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
    }
  }

  watch(theme, (newTheme) => {
    applyTheme(newTheme)
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ theme: newTheme, umcTheme: newTheme })
    }
  })

  onMounted(() => {
    theme.value = 'system'
    applyTheme('system')
  })

  return {
    theme,
    applyTheme,
  }
}
