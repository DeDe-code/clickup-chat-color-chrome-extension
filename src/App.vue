<script setup>
import { onMounted } from 'vue'
import UmcExtentionView from './views/UmcExtentionView.vue'
import { useWatchColorPickerDropdown } from './composables/useColorPickerDropdown'
import '@/assets/base.css'

useWatchColorPickerDropdown()

onMounted(() => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
})
</script>

<template>
  <main>
    <UmcExtentionView />
  </main>
</template>
