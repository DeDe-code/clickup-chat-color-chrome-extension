<script setup>
/* global chrome */
import { ref, watch } from 'vue'
import { useColorPicker } from '../composables/useColorPicker.js'
import ColorInput from 'vue-color-input'
// Import the CSS directly from node_modules
import '../assets/vue-color-input.css'

const emit = defineEmits(['colorsChanged'])

const useClickUpTextColor = ref(false)
const useClickUpBackgroundColor = ref(false)

// Simple function to handle color picker open/close
function handlePopoverOpen() {
  document.body.classList.add('color-picker-open')
  document.documentElement.classList.add('color-picker-open')
}

function handlePopoverClose() {
  document.body.classList.remove('color-picker-open')
  document.documentElement.classList.remove('color-picker-open')
}

// Load saved checkbox states
chrome.storage.local.get(['useClickUpTextColor', 'useClickUpBackgroundColor'], (result) => {
  useClickUpTextColor.value = !!result.useClickUpTextColor
  useClickUpBackgroundColor.value = !!result.useClickUpBackgroundColor

  emit('colorsChanged', {
    backgroundColor: useClickUpBackgroundColor.value
      ? 'var(--cu-background-primary)'
      : backgroundColor.value,
    textColor: useClickUpTextColor.value ? 'var(--cu-content-primary)' : textColor.value,
  })
})

const { backgroundColor, textColor } = useColorPicker('#fe5722', '#2097f3', (colors) => {
  // Save the effective colors (what's actually used) to Chrome storage
  chrome.storage.local.set({
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

  // Save all settings to Chrome storage
  chrome.storage.local.set({
    useClickUpTextColor: useClickUpTextColor.value,
    useClickUpBackgroundColor: useClickUpBackgroundColor.value,
    effectiveBackgroundColor: effectiveBackgroundColor,
    effectiveTextColor: effectiveTextColor,
  })

  emit('colorsChanged', {
    backgroundColor: effectiveBackgroundColor,
    textColor: effectiveTextColor,
  })
})
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
    </div>

    <div class="color-picker-wrapper">
      <!-- No debug button in the basic implementation -->

      <div class="bg-picker-wrapper">
        <label for="background-picker">Background</label>
        <color-input
          id="background-picker"
          v-model="backgroundColor"
          :disabled="useClickUpBackgroundColor"
          popover-to="right"
          format="hex"
          custom-class="color-picker-background"
          @popover-open="handlePopoverOpen"
          @popover-close="handlePopoverClose"
        />
      </div>

      <div class="text-picker-wrapper">
        <label for="text-picker">Text</label>
        <color-input
          id="text-picker"
          v-model="textColor"
          :disabled="useClickUpTextColor"
          popover-to="right"
          format="hex"
          custom-class="color-picker-text"
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
  padding: var(--spacing-md-lg);
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
:deep([data-theme='dark'] .v-color-input__control) {
  background-color: var(--color-dark-alt) !important;
  border-color: var(--color-border-dark) !important;
}

:deep([data-theme='light'] .v-color-input__control) {
  background-color: var(--color-white) !important;
  border-color: var(--color-light-gray) !important;
}
</style>
