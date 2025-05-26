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
console.log(props.backgroundColor)

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
}
.preview-text-container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 2rem;
  padding: 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 2rem;
}
</style>
