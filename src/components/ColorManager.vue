<script setup>
/* global chrome */
import { useColorStore } from '@/stores/ColorStore.js'
const colorStore = useColorStore()

import { ref } from 'vue'

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
import ColorInput from 'vue-color-input'
// Import the CSS directly from node_modules
import '../assets/vue-color-input.css'

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
      <div class="clickup-text-toggle custom-checkbox-wrapper">
        <input
          type="checkbox"
          id="cu-theme"
          :checked="colorStore.useClickUpTextColor"
          @change="colorStore.setUseClickUpTextColor($event.target.checked)"
          class="custom-checkbox-input"
        />
        <label for="cu-theme" class="custom-checkbox-label">
          <span
            class="custom-checkbox-box"
            :style="colorStore.useClickUpTextColor ? { backgroundColor: cuContentPrimary } : {}"
          >
            <svg
              v-if="colorStore.useClickUpTextColor"
              class="custom-checkbox-checkmark"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 10.5L9 14.5L15 7.5"
                stroke="white"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="custom-checkbox-text">Use ClickUp primary content color</span>
        </label>
      </div>
      <div class="clickup-bg-toggle custom-checkbox-wrapper">
        <input
          type="checkbox"
          id="cu-bg"
          :checked="colorStore.useClickUpBackgroundColor"
          @change="colorStore.setUseClickUpBackgroundColor($event.target.checked)"
          class="custom-checkbox-input"
        />
        <label for="cu-bg" class="custom-checkbox-label">
          <span
            class="custom-checkbox-box"
            :style="
              colorStore.useClickUpBackgroundColor ? { backgroundColor: cuBackgroundPrimary } : {}
            "
          >
            <svg
              v-if="colorStore.useClickUpBackgroundColor"
              class="custom-checkbox-checkmark"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 10.5L9 14.5L15 7.5"
                stroke="white"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="custom-checkbox-text">Use ClickUp primary background color</span>
        </label>
      </div>
      <!-- Reset button removed: now only in parent -->
    </div>

    <div
      class="color-picker-wrapper"
      v-show="!colorStore.useClickUpTextColor || !colorStore.useClickUpBackgroundColor"
    >
      <!-- No debug button in the basic implementation -->

      <div class="text-picker-wrapper" v-show="!colorStore.useClickUpTextColor">
        <label for="text-picker">Text</label>
        <color-input
          id="text-picker"
          v-model="colorStore.textColor"
          @change="debouncedSetColors(colorStore.backgroundColor, colorStore.textColor)"
          popover-to="right"
          format="hex"
          custom-class="color-picker-text"
          @popover-open="handlePopoverOpen"
          @popover-close="handlePopoverClose"
        />
      </div>

      <div class="bg-picker-wrapper" v-show="!colorStore.useClickUpBackgroundColor">
        <label for="background-picker">Background</label>
        <color-input
          id="background-picker"
          v-model="colorStore.backgroundColor"
          @change="debouncedSetColors(colorStore.backgroundColor, colorStore.textColor)"
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
