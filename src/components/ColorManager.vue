<script setup>
/* global chrome */
import { useColorStore } from '@/stores/ColorStore.js'
import Checkbox from './Checkbox.vue'
const colorStore = useColorStore()

import { ref } from 'vue'
import { useMutationObserver } from '../composables/useMutationObserver.js'

// Debounce utility
function debounce(fn, delay) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

const debouncedSetColors = debounce((bg, txt) => {
  colorStore.setColors(bg, txt)
}, 300)
import ColorPicker from './ColorPicker.vue'

console.log('ColorManager.vue loaded')
// Simple function to handle color picker open/close
function handlePopoverOpen() {
  document.body.classList.add('color-picker-open')
  document.documentElement.classList.add('color-picker-open')
}

function handlePopoverClose() {
  document.body.classList.remove('color-picker-open')
  document.documentElement.classList.remove('color-picker-open')
}

import { onMounted } from 'vue'
onMounted(() => {
  colorStore.initFromStorage()
})

// ...existing code...

// Expose cuBackgroundPrimary and cuContentPrimary for template binding
const cuBackgroundPrimary = ref('#fe5722')
const cuContentPrimary = ref('#2097f3')
chrome.storage.local.get(['cuBackgroundPrimary', 'cuContentPrimary'], (result) => {
  if (result.cuBackgroundPrimary) cuBackgroundPrimary.value = result.cuBackgroundPrimary
  if (result.cuContentPrimary) cuContentPrimary.value = result.cuContentPrimary
})

// --- MutationObserver for Exit Button Injection ---
const bodyRef = ref(null)
onMounted(() => {
  bodyRef.value = document.body
})
useMutationObserver(bodyRef, () => {
  const popups = document.querySelectorAll('.color-input__popup')
  popups.forEach((popup) => {
    if (!popup.querySelector('.color-input__popup-cancel-btn')) {
      const btn = document.createElement('button')
      btn.className = 'color-input__popup-cancel-btn'
      btn.type = 'button'
      btn.textContent = 'Exit'
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
</script>

<template>
  <div class="color-manager">
    <div class="clickup-theme-toggle">
      <div class="clickup-text-toggle">
        <Checkbox
          id="cu-theme"
          :modelValue="colorStore.useClickUpTextColor"
          :label="'Use ClickUp primary content color'"
          :color="cuContentPrimary"
          @update:modelValue="colorStore.setUseClickUpTextColor"
        />
      </div>
      <div class="clickup-bg-toggle">
        <Checkbox
          id="cu-bg"
          :modelValue="colorStore.useClickUpBackgroundColor"
          :label="'Use ClickUp primary background color'"
          :color="cuBackgroundPrimary"
          @update:modelValue="colorStore.setUseClickUpBackgroundColor"
        />
      </div>
    </div>

    <div
      class="color-picker-wrapper"
      v-show="!colorStore.useClickUpTextColor || !colorStore.useClickUpBackgroundColor"
    >
      <div class="text-picker-wrapper" v-show="!colorStore.useClickUpTextColor">
        <ColorPicker
          id="text-picker"
          label="Text"
          :modelValue="colorStore.textColor"
          customClass="color-picker-text"
          @update:modelValue="(val) => debouncedSetColors(colorStore.backgroundColor, val)"
          @popover-open="handlePopoverOpen"
          @popover-close="handlePopoverClose"
        />
      </div>

      <div class="bg-picker-wrapper" v-show="!colorStore.useClickUpBackgroundColor">
        <ColorPicker
          id="background-picker"
          label="Background"
          :modelValue="colorStore.backgroundColor"
          customClass="color-picker-background"
          @update:modelValue="(val) => debouncedSetColors(val, colorStore.textColor)"
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

.custom-checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5em;
}
/* Keep input in tab order and allow focus ring */
.custom-checkbox-input {
  position: absolute;
  opacity: 0;
  width: 24px;
  height: 24px;
  cursor: pointer;
  z-index: 2;
}
.custom-checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.5em;
  user-select: none;
}
.custom-checkbox-box {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid var(--color-border-dark, #222);
  background: #23272f;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s,
    border 0.2s;
  box-sizing: border-box;
}
.custom-checkbox-input:focus + .custom-checkbox-label .custom-checkbox-box {
  outline: 2px solid var(--color-primary, #2097f3);
  outline-offset: 2px;
}
/* Focus ring for color input fields */
.color-picker-text:focus,
.color-picker-background:focus {
  outline: 2px solid var(--color-primary, #2097f3);
  outline-offset: 2px;
}
.custom-checkbox-checkmark {
  display: block;
}
.custom-checkbox-text {
  color: inherit;
  font-size: var(--font-size-sm, 1em);
}
</style>
