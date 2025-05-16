<script setup>
import { ref, watch } from 'vue'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'

const emit = defineEmits(['changedTextColor'])
const color = ref('#FFD700')
watch(color, (newTextColor) => {
  emit('changedTextColor', newTextColor)
  console.log(newTextColor)
})
</script>
<template>
  <div class="background-picker-wrapper">
    <color-picker class="test" v-model:pureColor="color" />
  </div>
</template>
