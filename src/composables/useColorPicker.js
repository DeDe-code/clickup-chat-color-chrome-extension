/* global chrome */
import { ref, watch, onMounted } from 'vue'

/**
 * Composable for managing color values with color picker
 * Loads from and saves to Chrome storage for persistence
 *
 * @param {string} initialBackgroundColor - Initial background color in hex format
 * @param {string} initialTextColor - Initial text color in hex format
 * @param {Function} emitFn - Optional callback function when colors change
 * @param {Object} resetSignal - Optional signal to reset colors
 * @returns {Object} backgroundColor and textColor refs
 */
export function useColorPicker(
  initialBackgroundColor,
  initialTextColor,
  emitFn = null,
  resetSignal = null,
) {
  // If no initial colors provided, use ClickUp theme colors from storage or fallback
  const backgroundColor = ref(initialBackgroundColor)
  const textColor = ref(initialTextColor)

  if (!initialBackgroundColor || !initialTextColor) {
    chrome.storage.local.get(['cuContentPrimary', 'cuBackgroundPrimary'], (result) => {
      if (!initialTextColor && result.cuContentPrimary) textColor.value = result.cuContentPrimary
      if (!initialBackgroundColor && result.cuBackgroundPrimary)
        backgroundColor.value = result.cuBackgroundPrimary
    })
  }

  // Helper to load from Chrome storage or use initial values
  function loadColors() {
    chrome.storage.local.get(['backgroundColor', 'textColor'], (result) => {
      backgroundColor.value = result.backgroundColor || backgroundColor.value
      textColor.value = result.textColor || textColor.value
      if (emitFn) {
        emitFn({
          backgroundColor: backgroundColor.value,
          textColor: textColor.value,
        })
      }
    })
  }

  // Load saved colors from Chrome storage
  onMounted(loadColors)

  // Watch for changes and save to Chrome storage
  watch([backgroundColor, textColor], ([newBgColor, newTextColor]) => {
    // Save to Chrome storage
    chrome.storage.local.set({
      backgroundColor: newBgColor,
      textColor: newTextColor,
    })

    // Call emit function if provided
    if (emitFn) {
      emitFn({
        backgroundColor: backgroundColor.value,
        textColor: textColor.value,
      })
    }
  })

  // Watch for reset signal and reload colors
  if (resetSignal) {
    watch(resetSignal, () => {
      loadColors()
    })
  }

  return { backgroundColor, textColor }
}
