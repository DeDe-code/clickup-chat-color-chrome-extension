import { ref, watch } from 'vue'

/**
 * Composable for managing color values with color picker
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

  if (emitFn) {
    watch([backgroundColor, textColor], () => {
      emitFn({
        backgroundColor: backgroundColor.value,
        textColor: textColor.value,
      })
    })
  }

  return { backgroundColor, textColor }
}
