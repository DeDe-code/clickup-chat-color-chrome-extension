import { onMounted, onBeforeUnmount } from 'vue'

export function useMutationObserver(
  target,
  callback,
  options = { childList: true, subtree: true },
) {
  let observer = null

  onMounted(() => {
    if (target && target.value) {
      observer = new MutationObserver(callback)
      observer.observe(target.value, options)
    }
  })

  onBeforeUnmount(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  return {
    observer,
  }
}
