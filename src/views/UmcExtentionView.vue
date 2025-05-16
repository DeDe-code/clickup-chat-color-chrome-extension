<script setup>
import { computed, ref } from 'vue'
import BackgroundColorPicker from '../components/BackgroundColorPicker.vue'
import TextColorPicker from '../components/TextColorPicker.vue'
import ColorPreview from '../components/ColorPreview.vue'

const backgroundColor = ref('')
const textColor = ref('')

const handleBackgroundColor = (newBackgroundColor) => {
  console.log(backgroundColor.value)
  backgroundColor.value = newBackgroundColor
  console.log(backgroundColor.value)
}
const handleTextColor = (newTextColor) => {
  console.log(textColor.value)
  textColor.value = newTextColor
  console.log(textColor.value)
}
</script>
<template>
  <div>welcome from extention</div>
  <BackgroundColorPicker @changedBackgroundColor="handleBackgroundColor" />
  <TextColorPicker @changedTextColor="handleTextColor" />
  <ColorPreview :backgroundColor="backgroundColor" :textColor="textColor" />
</template>
