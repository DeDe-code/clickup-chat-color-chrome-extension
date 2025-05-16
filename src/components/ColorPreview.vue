<script setup>
import { ref } from 'vue'
const props = defineProps({
  backgroundColor: {
    type: String,
    default: '#fff',
  },
  textColor: {
    type: String,
    default: '#000',
  },
})
console.log(props.backgroundColor)

const previewText = ref('Unread message color')
</script>
<template>
  <div
    :style="{ 'background-color': props.backgroundColor, color: props.textColor }"
    class="previewContainer"
  >
    <h4>{{ previewText }}</h4>
  </div>
</template>
