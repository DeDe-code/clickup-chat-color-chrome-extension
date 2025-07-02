<script setup>
import { ref } from 'vue'
const props = defineProps({
  backgroundColor: {
    type: String,
    default: '#fe5722',
  },
  textColor: {
    type: String,
    default: '#2097f3',
  },
})
console.log('text color:', props.textColor)

console.log('background color: ', props.backgroundColor)

const previewText = ref('Unread message color')
</script>
<template>
  <div class="preview-container">
    <label for="preview-text">Colors preview</label>
    <div
      :style="{ 'background-color': props.backgroundColor, color: props.textColor }"
      class="preview-text-container"
    >
      <p>{{ previewText }}</p>
    </div>
  </div>
</template>

<style scoped>
.preview-container {
  display: var(--flex-center);
  flex-direction: var(--flex-column);
  gap: var(--gap-sm);
  margin-top: var(--spacing-base);
  padding: var(--spacing-lg-sm);
  border: var(--border-default);
  border-radius: var(--border-radius-sm);
}
.preview-text-container {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
}
</style>
