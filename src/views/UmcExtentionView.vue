<script setup>
/* global chrome */
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useColorStore } from '../stores/ColorStore.js'
import ColorManager from '../components/ColorManager.vue'
import ColorPreview from '../components/ColorPreview.vue'

const colorStore = useColorStore()
const { backgroundColor, textColor } = storeToRefs(colorStore)
const isReady = ref('false')

onMounted(() => {
  // chrome.storage.local.get(['backgroundColor', 'textColor'], ({ backgroundColor, textColor }) => {
  //   if (backgroundColor && textColor) {
  //     colorStore.setColors(backgroundColor, textColor)
  //   }
  //   isReady.value = true
  // })
  const body = document.querySelector('body')
  console.log(body)

  isReady.value = true
})

const handleColorsChanged = ({ backgroundColor: bg, textColor: txt }) => {
  colorStore.setColors(bg, txt)
  // chrome.storage.local.set({
  //   backgroundColor: bg,
  //   textColor: txt,
  // })
}
</script>
<template>
  <main class="extension-wrapper">
    <div v-if="isReady" class="extension-tools-wrapper">
      <h1>Chose your colors</h1>
      <ColorManager @colorsChanged="handleColorsChanged" />
      <ColorPreview :backgroundColor="backgroundColor" :textColor="textColor" />
    </div>
    <div v-else class="loading-wrapper">loading...</div>
  </main>
</template>
