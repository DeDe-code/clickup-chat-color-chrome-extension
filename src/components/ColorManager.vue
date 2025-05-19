<script setup>
import { useColorPicker } from '../composables/useColorPicker.js'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'

const emit = defineEmits(['colorsChanged'])
const { backgroundColor, textColor } = useColorPicker('#ffff', '#000', (colors) => {
  emit('colorsChanged', colors)
})
</script>
<template>
  <div class="background-picker-wrapper">
    <color-picker class="test" v-model:pureColor="backgroundColor" />
  </div>
  <div class="background-picker-wrapper">
    <color-picker class="test" v-model:pureColor="textColor" />
  </div>
</template>
