<script setup>
import { useColorPicker } from '../composables/useColorPicker.js'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'

const emit = defineEmits(['colorsChanged'])
const { backgroundColor, textColor } = useColorPicker('#fe5722', '#2097f3', (colors) => {
  emit('colorsChanged', colors)
})
</script>
<template>
  <div class="color-picker-wrapper">
    <div class="background-picker-wrapper">
      <label for="background-picker">Background</label>
      <color-picker id="background-picker" v-model:pureColor="backgroundColor" />
    </div>
    <div class="text-picker-wrapper">
      <label for="text-picker">Text</label>
      <color-picker id="text-picker" v-model:pureColor="textColor" />
    </div>
  </div>
</template>

<style scoped>
::v-deep(.vc-color-wrap) {
  width: 100%;
  height: 2rem;
  border-radius: 2rem;
}
#background-picker {
  left: 20rem;
}
</style>
