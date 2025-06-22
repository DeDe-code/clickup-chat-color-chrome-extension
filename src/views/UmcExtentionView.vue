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
const theme = ref('system') // 'system', 'light', 'dark', 'manual'
const manualTheme = ref('light') // 'light' or 'dark'

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
  if (newTheme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  } else if (newTheme === 'manual') {
    document.documentElement.setAttribute('data-theme', manualTheme.value)
  } else {
    document.documentElement.setAttribute('data-theme', newTheme)
  }
}

// Watch for browser theme changes if theme is 'system'
let mediaQueryList = null
function setupSystemThemeWatcher() {
  if (mediaQueryList) {
    mediaQueryList.removeEventListener('change', handleSystemThemeChange)
  }
  if (theme.value === 'system') {
    mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQueryList.addEventListener('change', handleSystemThemeChange)
  }
}
function handleSystemThemeChange(e) {
  if (theme.value === 'system') {
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
  }
}

watch(theme, (newTheme) => {
  applyTheme(newTheme)
  setupSystemThemeWatcher()
  chrome.storage.local.set({ umcTheme: newTheme })
})

onMounted(() => {
  chrome.storage.local.get(
    [
      'backgroundColor',
      'textColor',
      'cuContentPrimary',
      'cuBackgroundPrimary',
      'umcTheme',
      'umcManualTheme',
    ],
    ({ backgroundColor, textColor, cuContentPrimary: cuTxt, cuBackgroundPrimary: cuBg, umcTheme, umcManualTheme }) => {
      if (backgroundColor && textColor) {
        colorStore.setColors(backgroundColor, textColor)
      }
      if (cuTxt) cuContentPrimary.value = cuTxt
      if (cuBg) cuBackgroundPrimary.value = cuBg
      if (umcTheme) {
        theme.value = umcTheme
        if (umcTheme === 'manual' && umcManualTheme) {
          manualTheme.value = umcManualTheme
        }
        applyTheme(umcTheme)
      } else {
        applyTheme('system')
      }
      setupSystemThemeWatcher()
      isReady.value = true
    },
  )
})

const handleColorsChanged = ({ backgroundColor: bg, textColor: txt }) => {
  colorStore.setColors(bg, txt)
  chrome.storage.local.set({
    backgroundColor: bg,
    textColor: txt,
  })
}

const previewBackground = computed(() => resolveCssVariable(backgroundColor.value))
const previewText = computed(() => resolveCssVariable(textColor.value))
</script>

<template>
  <main
    class="extension-wrapper min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center"
  >
    <div class="w-full flex justify-end mb-2">
      <div class="flex gap-2 items-center">
        <select
          v-model="theme"
          @change="applyTheme(theme)"
          class="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-xs font-semibold shadow hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none"
        >
          <option value="system">🖥️ System</option>
          <option value="light">🌞 Light</option>
          <option value="dark">🌙 Dark</option>
        </select>
      </div>
    </div>
    <div v-if="isReady" class="extension-tools-wrapper w-full max-w-md flex flex-col gap-6">
      <h1 class="text-xl font-bold text-center mb-2">Choose your colors</h1>
      <ColorManager @colorsChanged="handleColorsChanged" />
      <ColorPreview :backgroundColor="previewBackground" :textColor="previewText" />
    </div>
    <div v-else class="loading-wrapper flex items-center justify-center h-32 text-lg font-semibold">
      loading...
    </div>
  </main>
</template>

<style scoped>
/* All handled by Tailwind */
</style>
