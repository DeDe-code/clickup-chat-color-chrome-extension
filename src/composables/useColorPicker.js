import { ref, watch } from 'vue'

export function useColorPicker(
  initialBackgroundColor = '#ffff ',
  initialTextColor = '#0000',
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
