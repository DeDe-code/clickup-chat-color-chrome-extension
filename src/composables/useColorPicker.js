/* global chrome */
import { ref, watch, onMounted } from 'vue'

/**
 * Composable for managing color values with color picker
 * Loads from and saves to Chrome storage for persistence
 *
 * @param {string} initialBackgroundColor - Initial background color in hex format
 * @param {string} initialTextColor - Initial text color in hex format
 * @param {Function} emitFn - Optional callback function when colors change
 * @returns {Object} backgroundColor and textColor refs
 */
export function useColorPicker(
  initialBackgroundColor = '#fe5722',
  initialTextColor = '#2097f3',
  emitFn = null,
) {
  const backgroundColor = ref(initialBackgroundColor)
  const textColor = ref(initialTextColor)

  // Load saved colors from Chrome storage
  onMounted(() => {
    chrome.storage.local.get(['backgroundColor', 'textColor'], (result) => {
      if (result.backgroundColor) {
        backgroundColor.value = result.backgroundColor
      }
      if (result.textColor) {
        textColor.value = result.textColor
      }

      // Emit initial values after loading from storage
      if (emitFn) {
        emitFn({
          backgroundColor: backgroundColor.value,
          textColor: textColor.value,
        })
      }
    })
  })

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

  return { backgroundColor, textColor }
}
