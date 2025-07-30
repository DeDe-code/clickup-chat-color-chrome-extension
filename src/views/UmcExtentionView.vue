<script setup>
/* global chrome */
import { ref, onMounted, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useColorStore } from '../stores/ColorStore.js'
import ColorManager from '../components/ColorManager.vue'
import ColorPreview from '../components/ColorPreview.vue'

const colorStore = useColorStore()
const { backgroundColor, textColor } = storeToRefs(colorStore)

const isReady = ref(false)
const cuContentPrimary = ref('#2097f3')
const cuBackgroundPrimary = ref('#fe5722')
const theme = ref('system') // 'system', 'light', 'dark'

// Load theme preference from Chrome storage
chrome.storage.local.get(['theme'], (result) => {
  if (result.theme) {
    theme.value = result.theme
    applyTheme(theme.value)
  }
})

// Watch for theme changes and save to Chrome storage
watch(theme, (newTheme) => {
  chrome.storage.local.set({ theme: newTheme })
})
// const manualTheme = ref('light') // 'light' or 'dark'

// Load ClickUp theme variables from storage
chrome.storage.local.get(['cuContentPrimary', 'cuBackgroundPrimary'], (result) => {
  if (result.cuContentPrimary) {
    cuContentPrimary.value = result.cuContentPrimary
  }
  if (result.cuBackgroundPrimary) {
    cuBackgroundPrimary.value = result.cuBackgroundPrimary
  }
})

// Resolve a CSS variable (e.g. 'var(--cu-content-primary)') to real color
function resolveCssVariable(colorValue) {
  if (colorValue.startsWith('var(')) {
    const cssVarName = colorValue.match(/var\((--[^)]+)\)/)?.[1]
    if (cssVarName) {
      // Use stored value if available
      if (cssVarName === '--cu-content-primary') return cuContentPrimary.value
      if (cssVarName === '--cu-background-primary') return cuBackgroundPrimary.value
      return getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim()
    }
  }
  return colorValue
}

function applyTheme(newTheme) {
  let target = document.documentElement
  document.body.removeAttribute('data-theme')
  if (newTheme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    target.setAttribute('data-theme', isDark ? 'dark' : 'light')
    // Listen for system changes only in system mode
    setupSystemThemeWatcher()
  } else {
    target.setAttribute('data-theme', newTheme)
    // Remove system watcher if not in system mode
    if (mediaQueryList) {
      mediaQueryList.removeEventListener('change', handleSystemThemeChange)
      mediaQueryList = null
    }
  }
  // Log out the element and its computed background and color
  const body = document.body
  const bg = getComputedStyle(body).backgroundColor
  const color = getComputedStyle(body).color
  console.log('Theme applied to:', target, 'Body bg:', bg, 'Body color:', color)
}

// Watch for browser theme changes if theme is 'system'
let mediaQueryList = null
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
  console.log('Theme changed to:', newTheme)
  applyTheme(newTheme)
  chrome.storage.local.set({ umcTheme: newTheme })
})

onMounted(() => {
  // Default: inherit system theme
  theme.value = 'system'
  applyTheme('system')
  chrome.storage.local.get(
    [
      'backgroundColor',
      'textColor',
      'cuContentPrimary',
      'cuBackgroundPrimary',
      'umcTheme',
      'umcManualTheme',
    ],
    ({
      backgroundColor,
      textColor,
      cuContentPrimary: cuTxt,
      cuBackgroundPrimary: cuBg,
      umcTheme,
      // umcManualTheme,
    }) => {
      if (backgroundColor && textColor) {
        colorStore.setColors(backgroundColor, textColor)
      }
      if (cuTxt) cuContentPrimary.value = cuTxt
      if (cuBg) cuBackgroundPrimary.value = cuBg
      if (umcTheme && umcTheme !== 'system') {
        theme.value = umcTheme
        applyTheme(umcTheme)
      }
      setupSystemThemeWatcher()
      isReady.value = true
    },
  )
})

// Send message directly to the content script
function sendMessageToContentScript(bg, txt) {
  // Get all active tabs with the ClickUp URL
  chrome.tabs.query({ url: 'https://app.clickup.com/*' }, (tabs) => {
    if (tabs.length === 0) {
      console.log('No ClickUp tabs found')
      return
    }

    // Send message to all ClickUp tabs
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(
        tab.id,
        {
          action: 'updateColors',
          backgroundColor: bg,
          textColor: txt,
        },
        (response) => {
          // Handle the response from the content script
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError)
            return
          }

          if (response && response.success) {
            console.log('Colors updated in ClickUp tab:', tab.id)
          }
        },
      )
    })
  })
}

// Remove previewBackground and previewText refs and computed
// Use only the effective color values from ColorManager
let effectiveBackground = ref('var(--cu-background-primary)')
let effectiveText = ref('var(--cu-content-primary)')

function handleColorsChanged({ backgroundColor: bg, textColor: txt }) {
  colorStore.setColors(bg, txt)
  chrome.storage.local.set({
    backgroundColor: bg,
    textColor: txt,
  })
  effectiveBackground.value = resolveCssVariable(bg)
  effectiveText.value = resolveCssVariable(txt)
  sendMessageToContentScript(bg, txt)
}

const colorManagerKey = ref(0)

const handleReset = () => {
  // Use ClickUp theme colors as true defaults
  const clickUpTextColor = cuContentPrimary.value
  const clickUpBackgroundColor = cuBackgroundPrimary.value
  // Reset Pinia store
  colorStore.setColors(clickUpBackgroundColor, clickUpTextColor)
  // Reset theme
  theme.value = DEFAULT_THEME
  applyTheme(DEFAULT_THEME)
  // Reset local refs
  cuContentPrimary.value = clickUpTextColor
  cuBackgroundPrimary.value = clickUpBackgroundColor
  // Reset Chrome storage (including checkboxes)
  chrome.storage.local.set({
    backgroundColor: clickUpBackgroundColor,
    textColor: clickUpTextColor,
    cuContentPrimary: clickUpTextColor,
    cuBackgroundPrimary: clickUpBackgroundColor,
    theme: DEFAULT_THEME,
    umcTheme: DEFAULT_THEME,
    effectiveBackgroundColor: clickUpBackgroundColor,
    effectiveTextColor: clickUpTextColor,
    useClickUpTextColor: true,
    useClickUpBackgroundColor: true,
  })
  // Notify content script to update colors immediately
  sendMessageToContentScript(clickUpBackgroundColor, clickUpTextColor)
  // Force ColorManager to re-mount and reload checkbox state
  colorManagerKey.value++
}

const DEFAULT_THEME = 'system'
</script>

<template>
  <main class="extension-wrapper">
    <div class="theme-selector-wrapper">
      <label for="theme-select">Appearance</label>
      <select id="theme-select" v-model="theme" @change="applyTheme(theme)" class="theme-selector">
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
    <div v-if="isReady" class="color-picker-wrapper">
      <ColorManager :key="colorManagerKey" @colorsChanged="handleColorsChanged" />
      <ColorPreview :backgroundColor="effectiveBackground" :textColor="effectiveText" />
      <div class="reset-btn-row">
        <button class="reset-default-btn" @click="handleReset">Reset Default Colors</button>
      </div>
    </div>
    <div v-else class="loading-wrapper flex items-center justify-center h-32 text-lg font-semibold">
      loading...
    </div>
  </main>
</template>

<style scoped>
.extension-wrapper {
  width: var(--full-width);
}
.extension-wrapper h1 {
  margin: var(--spacing-base) 0 var(--spacing-sm) 0;
  font-size: var(--font-size-base);
}
.theme-selector-wrapper {
  display: var(--flex-center);
  align-items: var(--align-center);
  justify-content: var(--justify-between);
  width: var(--full-width);
  margin: 0 auto;
  padding-block: var(--spacing-md-lg);
  padding-inline: var(--spacing-lg);
  /* border: var(--border-default);
  border-radius: var(--border-radius-sm); */
}
.theme-selector {
  padding: var(--spacing-md) !important;
  background-color: var(--bg-color);
  color: var(--text-color);
  border-color: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
}

.theme-selector:focus {
  outline: none;
}

.theme-selector:hover {
  opacity: var(--hover-opacity);
}

.color-picker-wrapper {
  position: relative;
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  /* border: var(--border-default);
  border-radius: var(--border-radius-sm); */
}
.color-picker-wrapper::before {
  content: 'Chat channel colors';
  position: absolute;
  width: var(--width-12);
  height: var(--spacing-2xl);
  top: calc(var(--spacing-base) * -1);
  left: var(--spacing-base);
  right: 0;
  bottom: 0;
  z-index: 10;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  text-align: center;
  background-color: var(--color-dark-gray);
}
.reset-btn-row {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-md);
}
.reset-default-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-danger);
  color: var(--color-white);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: background-color 0.3s;
}

.reset-default-btn:hover {
  background-color: var(--color-danger-dark);
}
</style>
