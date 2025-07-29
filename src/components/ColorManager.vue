<script setup>
/* global chrome */
import { ref, watch } from 'vue'
import { useColorPicker } from '../composables/useColorPicker.js'
import ColorInput from 'vue-color-input'
// Import the CSS directly from node_modules
import '../assets/vue-color-input.css'

console.log('ColorManager.vue loaded')
const emit = defineEmits(['colorsChanged'])

const useClickUpTextColor = ref(true)
const useClickUpBackgroundColor = ref(true)

// Simple function to handle color picker open/close
function handlePopoverOpen() {
  document.body.classList.add('color-picker-open')
  document.documentElement.classList.add('color-picker-open')
  console.log('it works')
}

function handlePopoverClose() {
  document.body.classList.remove('color-picker-open')
  document.documentElement.classList.remove('color-picker-open')
}

// Load saved checkbox states and color values
chrome.storage.local.get(
  ['useClickUpTextColor', 'useClickUpBackgroundColor', 'backgroundColor', 'textColor'],
  (result) => {
    // Default to true if no saved state exists
    useClickUpTextColor.value =
      result.useClickUpTextColor !== undefined ? !!result.useClickUpTextColor : true
    useClickUpBackgroundColor.value =
      result.useClickUpBackgroundColor !== undefined ? !!result.useClickUpBackgroundColor : true

    // Load saved color values if they exist
    if (result.backgroundColor) {
      backgroundColor.value = result.backgroundColor
    }
    if (result.textColor) {
      textColor.value = result.textColor
    }

    emit('colorsChanged', {
      backgroundColor: useClickUpBackgroundColor.value
        ? 'var(--cu-background-primary)'
        : backgroundColor.value,
      textColor: useClickUpTextColor.value ? 'var(--cu-content-primary)' : textColor.value,
    })
  },
)

// Get ClickUp theme colors for initial values
let initialBg = '#fe5722'
let initialTxt = '#2097f3'
chrome.storage.local.get(['cuContentPrimary', 'cuBackgroundPrimary'], (result) => {
  if (result.cuContentPrimary) initialTxt = result.cuContentPrimary
  if (result.cuBackgroundPrimary) initialBg = result.cuBackgroundPrimary
})

const { backgroundColor, textColor } = useColorPicker(initialBg, initialTxt, (colors) => {
  // Save both the current color values and the effective colors to Chrome storage
  chrome.storage.local.set({
    backgroundColor: colors.backgroundColor,
    textColor: colors.textColor,
    effectiveBackgroundColor: useClickUpBackgroundColor.value
      ? 'var(--cu-background-primary)'
      : colors.backgroundColor,
    effectiveTextColor: useClickUpTextColor.value ? 'var(--cu-content-primary)' : colors.textColor,
  })

  emit('colorsChanged', {
    backgroundColor: useClickUpBackgroundColor.value
      ? 'var(--cu-background-primary)'
      : colors.backgroundColor,
    textColor: useClickUpTextColor.value ? 'var(--cu-content-primary)' : colors.textColor,
  })
})

// Watch for changes and emit updated values
watch([useClickUpTextColor, useClickUpBackgroundColor], () => {
  // Calculate the effective colors based on checkbox states
  const effectiveBackgroundColor = useClickUpBackgroundColor.value
    ? 'var(--cu-background-primary)'
    : backgroundColor.value
  const effectiveTextColor = useClickUpTextColor.value
    ? 'var(--cu-content-primary)'
    : textColor.value

  // Save all settings to Chrome storage (checkbox states, color values, and effective colors)
  chrome.storage.local.set({
    useClickUpTextColor: useClickUpTextColor.value,
    useClickUpBackgroundColor: useClickUpBackgroundColor.value,
    backgroundColor: backgroundColor.value,
    textColor: textColor.value,
    effectiveBackgroundColor: effectiveBackgroundColor,
    effectiveTextColor: effectiveTextColor,
  })

  emit('colorsChanged', {
    backgroundColor: effectiveBackgroundColor,
    textColor: effectiveTextColor,
  })
})

// --- MutationObserver for Cancel Button Injection ---
if (typeof window !== 'undefined') {
  const observer = new MutationObserver(() => {
    const popups = document.querySelectorAll('.color-input__popup')
    popups.forEach((popup) => {
      if (!popup.querySelector('.color-input__popup-cancel-btn')) {
        const btn = document.createElement('button')
        btn.className = 'color-input__popup-cancel-btn'
        btn.type = 'button'
        btn.textContent = 'Cancel'
        btn.onclick = (e) => {
          e.stopPropagation()
          const closeBtn = popup.querySelector('.color-input__close, .v-color-input__close')
          if (closeBtn) closeBtn.click()
          else popup.style.display = 'none'
        }
        popup.appendChild(btn)
      }
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
}
</script>

<template>
  <div class="color-manager">
    <div class="clickup-theme-toggle">
      <div class="clickup-text-toggle">
        <input type="checkbox" id="cu-theme" v-model="useClickUpTextColor" />
        <label for="cu-theme"> Use ClickUp primary content color </label>
      </div>
      <div class="clickup-bg-toggle">
        <input type="checkbox" id="cu-bg" v-model="useClickUpBackgroundColor" />
        <label for="cu-bg"> Use ClickUp primary background color </label>
      </div>
      <!-- Reset button removed: now only in parent -->
    </div>

    <div class="color-picker-wrapper" v-show="!useClickUpTextColor || !useClickUpBackgroundColor">
      <!-- No debug button in the basic implementation -->

      <div class="text-picker-wrapper" v-show="!useClickUpTextColor">
        <label for="text-picker">Text</label>
        <color-input
          id="text-picker"
          v-model="textColor"
          popover-to="right"
          format="hex"
          custom-class="color-picker-text"
          @popover-open="handlePopoverOpen"
          @popover-close="handlePopoverClose"
        />
      </div>

      <div class="bg-picker-wrapper" v-show="!useClickUpBackgroundColor">
        <label for="background-picker">Background</label>
        <color-input
          id="background-picker"
          v-model="backgroundColor"
          popover-to="right"
          format="hex"
          custom-class="color-picker-background"
          @popover-open="handlePopoverOpen"
          @popover-close="handlePopoverClose"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-manager {
  display: var(--flex-center);
  flex-direction: var(--flex-column);
  row-gap: var(--gap-base);
}
.clickup-theme-toggle {
  display: var(--flex-center);
  flex-direction: var(--flex-column);
  gap: var(--gap-sm);
  padding: var(--spacing-md-lg);
  border: var(--border-default);
  border-radius: var(--border-radius-sm);
}
.clickup-text-toggle,
.clickup-bg-toggle {
  display: var(--flex-center);
  align-items: var(--align-center);
  gap: var(--gap-sm);
  font-size: var(--font-size-sm);
}

.color-picker-wrapper {
  display: var(--flex-center);
  flex-direction: var(--flex-column);
  row-gap: var(--gap-sm);
  padding: var(--spacing-lg-sm);
  border: var(--border-default);
  border-radius: var(--border-radius-sm);
}
.bg-picker-wrapper,
.text-picker-wrapper {
  width: var(--full-width);
  display: var(--flex-center);
  flex-direction: var(--flex-column);
  gap: var(--gap-sm);
}

:deep(.color-input__box) {
  width: var(--full-width);
  border-radius: var(--border-radius-sm);
}

/* Theme-specific styling */
[data-theme='dark'] .v-color-input__control {
  background-color: var(--color-dark-alt) !important;
  border-color: var(--color-border-dark) !important;
}

:deep([data-theme='light'] .v-color-input__control) {
  background-color: var(--color-white) !important;
  border-color: var(--color-light-gray) !important;
}
</style>
