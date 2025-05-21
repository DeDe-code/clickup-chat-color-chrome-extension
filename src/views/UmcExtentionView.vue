<script setup>
/* global chrome */
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useColorStore } from '../stores/ColorStore.js'
import ColorManager from '../components/ColorManager.vue'
import ColorPreview from '../components/ColorPreview.vue'

const colorStore = useColorStore()
const { backgroundColor, textColor } = storeToRefs(colorStore)

onMounted(() => {
  chrome.storage.local.get(['backgroundColor', 'textColor'], ({ backgroundColor, textColor }) => {
    if (backgroundColor && textColor) {
      colorStore.setColors(backgroundColor, textColor)
    }
  })
})

const handleColorsChanged = ({ backgroundColor: bg, textColor: txt }) => {
  colorStore.setColors(bg, txt)
  chrome.storage.local.set({
    backgroundColor: bg,
    textColor: txt,
  })
}
</script>
<template>
  <div>welcome from extention</div>
  <ColorManager @colorsChanged="handleColorsChanged" />
  <ColorPreview :backgroundColor="backgroundColor" :textColor="textColor" />
</template>
