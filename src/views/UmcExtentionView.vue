<script setup>
/* global chrome */
import { ref, onMounted, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useColorStore } from '../stores/ColorStore.js'
import { useTheme } from '../composables/useTheme.js'
import { useChromeStorage } from '../composables/useChromeStorage.js'
import { useContentScriptMessaging } from '../composables/useContentScriptMessaging.js'
import ColorManager from '../components/ColorManager.vue'
import ColorPreview from '../components/ColorPreview.vue'
import ThemeSelector from '../components/ThemeSelector.vue'
import ResetButton from '../components/ResetButton.vue'
// import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

const colorStore = useColorStore()
const { backgroundColor, textColor } = storeToRefs(colorStore)

const isReady = ref(false)
const cuContentPrimary = ref('#2097f3')
const cuBackgroundPrimary = ref('#fe5722')
const { theme, applyTheme } = useTheme()
const { getStorage, setStorage } = useChromeStorage()
const { sendMessageToContentScript } = useContentScriptMessaging()

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

onMounted(async () => {
  try {
    const result = await getStorage([
      'backgroundColor',
      'textColor',
      'cuContentPrimary',
      'cuBackgroundPrimary',
      'umcTheme',
      'umcManualTheme',
      'useClickUpTextColor',
      'useClickUpBackgroundColor',
    ])
    const {
      cuContentPrimary: cuTxt,
      cuBackgroundPrimary: cuBg,
      umcTheme,
      useClickUpTextColor,
      useClickUpBackgroundColor,
      // umcManualTheme,
    } = result
    // Always default to using ClickUp theme colors (checkboxes checked)
    colorStore.useClickUpTextColor = useClickUpTextColor !== undefined ? useClickUpTextColor : true
    colorStore.useClickUpBackgroundColor =
      useClickUpBackgroundColor !== undefined ? useClickUpBackgroundColor : true
    if (cuTxt) cuContentPrimary.value = cuTxt
    if (cuBg) cuBackgroundPrimary.value = cuBg
    if (umcTheme && umcTheme !== 'system') {
      theme.value = umcTheme
      applyTheme(umcTheme)
    }
    isReady.value = true
  } catch (e) {
    console.error('Failed to load storage:', e)
    isReady.value = true
  }
})

// Send message directly to the content script
async function updateClickUpColors(bg, txt) {
  try {
    const responses = await sendMessageToContentScript({
      action: 'updateColors',
      backgroundColor: bg,
      textColor: txt,
    })
    responses.forEach(({ tabId, response }) => {
      if (response && response.success) {
        console.log('Colors updated in ClickUp tab:', tabId)
      }
    })
  } catch (errors) {
    errors.forEach(({ tabId, error }) => {
      console.error('Error sending message to tab', tabId, error)
    })
  }
}

// Remove previewBackground and previewText refs and computed
// Use only the effective color values from ColorManager
let effectiveBackground = ref('var(--cu-background-primary)')
let effectiveText = ref('var(--cu-content-primary)')
watch(
  () => [
    colorStore.backgroundColor,
    colorStore.textColor,
    colorStore.useClickUpTextColor,
    colorStore.useClickUpBackgroundColor,
  ],
  ([bg, txt, useTxt, useBg]) => {
    const effectiveBg = useBg ? 'var(--cu-background-primary)' : bg
    const effectiveTxt = useTxt ? 'var(--cu-content-primary)' : txt
    effectiveBackground.value = resolveCssVariable(effectiveBg)
    effectiveText.value = resolveCssVariable(effectiveTxt)
    setStorage({
      backgroundColor: effectiveBg,
      textColor: effectiveTxt,
    })
    updateClickUpColors(effectiveBg, effectiveTxt)
  },
  { deep: true },
)

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
  setStorage({
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
  updateClickUpColors(clickUpBackgroundColor, clickUpTextColor)
  // Force ColorManager to re-mount and reload checkbox state
  colorManagerKey.value++
}

const DEFAULT_THEME = 'system'
</script>

<template>
  <main class="extension-wrapper">
    <!-- <Header /> -->
    <ThemeSelector v-model="theme" @update:modelValue="applyTheme" />
    <div v-if="isReady" class="color-picker-wrapper">
      <ColorManager :key="colorManagerKey" />
      <ColorPreview :backgroundColor="effectiveBackground" :textColor="effectiveText" />
      <div class="reset-btn-row">
        <ResetButton @click="handleReset">Reset Default Colors</ResetButton>
      </div>
    </div>
    <div v-else class="loading-wrapper flex items-center justify-center h-32 text-lg font-semibold">
      loading...
    </div>
    <Footer />
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
  outline: 2px solid var(--color-primary, #2097f3);
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--color-primary, #2097f3);
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
  /* border: none; */
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: background-color 0.3s;
}

.reset-default-btn:hover {
  background-color: var(--color-danger-dark);
}
.reset-default-btn:focus {
  outline: 2px solid var(--color-primary, #2097f3);
  /* outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--color-primary, #2097f3); */
}
</style>
