<script setup>
/* global chrome */
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useColorStore } from '../stores/ColorStore.js'
import ColorManager from '../components/ColorManager.vue'
import ColorPreview from '../components/ColorPreview.vue'

const colorStore = useColorStore()
const { backgroundColor, textColor } = storeToRefs(colorStore)

const isReady = ref(false)
const cuContentPrimary = ref('#2097f3')
const cuBackgroundPrimary = ref('#fe5722')

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

onMounted(() => {
  chrome.storage.local.get(
    ['backgroundColor', 'textColor', 'cuContentPrimary', 'cuBackgroundPrimary'],
    ({ backgroundColor, textColor, cuContentPrimary: cuTxt, cuBackgroundPrimary: cuBg }) => {
      if (backgroundColor && textColor) {
        colorStore.setColors(backgroundColor, textColor)
      }
      if (cuTxt) cuContentPrimary.value = cuTxt
      if (cuBg) cuBackgroundPrimary.value = cuBg
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
/* Remove old CSS, all handled by Tailwind */
</style>
