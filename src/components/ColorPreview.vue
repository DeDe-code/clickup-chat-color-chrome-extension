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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.7rem;
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 0.3rem;
}
.preview-text-container {
  padding: 0.5rem;
  border-radius: 0.3rem;
}
</style>
