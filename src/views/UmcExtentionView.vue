<script setup>
import { ref } from 'vue'
import ColorManager from '../components/ColorManager.vue'
import ColorPreview from '../components/ColorPreview.vue'

const backgroundColor = ref('')
const textColor = ref('')

const handleColorsChanged = ({ backgroundColor: bg, textColor: txt }) => {
  backgroundColor.value = bg
  textColor.value = txt

  console.log(backgroundColor.value)
  console.log(textColor.value)
}
</script>
<template>
  <div>welcome from extention</div>
  <ColorManager @colorsChanged="handleColorsChanged" />
  <ColorPreview :backgroundColor="backgroundColor" :textColor="textColor" />
</template>
