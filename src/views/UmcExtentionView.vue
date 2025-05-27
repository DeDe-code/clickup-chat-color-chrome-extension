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
const activeView = ref(false)
const darkView = ref(['dark-view'])
const lightView = ref(['light-view'])

onMounted(() => {
  chrome.storage.local.get(['backgroundColor', 'textColor'], ({ backgroundColor, textColor }) => {
    if (backgroundColor && textColor) {
      colorStore.setColors(backgroundColor, textColor)
    }
    isReady.value = true
  })
  const body = document.querySelector('body')
  console.log(body)

  isReady.value = true
})

const handleColorsChanged = ({ backgroundColor: bg, textColor: txt }) => {
  colorStore.setColors(bg, txt)
  chrome.storage.local.set({
    backgroundColor: bg,
    textColor: txt,
  })
}

const toggleActiveView = () => {
  activeView.value = !activeView.value
}
</script>
<template>
  <main class="extension-wrapper" :class="activeView ? lightView : darkView">
    <div v-if="isReady" class="extension-tools-wrapper">
      <button @click="toggleActiveView">{{ activeView ? 'Dark' : 'Light' }}</button>
      <h1>Chose your colors</h1>
      <ColorManager @colorsChanged="handleColorsChanged" />
      <ColorPreview :backgroundColor="backgroundColor" :textColor="textColor" />
    </div>
    <div v-else class="loading-wrapper">loading...</div>
  </main>
</template>

<style scoped>
.light-view {
  color: #000;
  background-color: #fff;
}
.dark-view {
  color: #fff;
  background-color: #000;
}
</style>
