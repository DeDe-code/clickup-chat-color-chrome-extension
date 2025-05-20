<script setup>
import { storeToRefs } from 'pinia'
import { useColorStore } from '../stores/ColorStore.js'
import ColorManager from '../components/ColorManager.vue'
import ColorPreview from '../components/ColorPreview.vue'

const colorStore = useColorStore()
const { backgroundColor, textColor } = storeToRefs(colorStore)

const handleColorsChanged = ({ backgroundColor: bg, textColor: txt }) => {
  colorStore.setColors(bg, txt)
}
</script>
<template>
  <div>welcome from extention</div>
  <ColorManager @colorsChanged="handleColorsChanged" />
  <ColorPreview :backgroundColor="backgroundColor" :textColor="textColor" />
</template>
