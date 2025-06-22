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
  <div class="preview-container flex flex-col gap-2">
    <label for="preview-text" class="text-xs font-semibold">Colors preview</label>
    <div
      :style="{ 'background-color': props.backgroundColor, color: props.textColor }"
      class="preview-text-container flex items-center w-full h-10 px-4 text-sm font-bold rounded-2xl shadow border border-gray-200 dark:border-gray-700 transition-colors duration-300"
    >
      <p>{{ previewText }}</p>
    </div>
  </div>
</template>
