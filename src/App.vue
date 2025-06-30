<script setup>
import { onMounted } from 'vue'
import UmcExtentionView from './views/UmcExtentionView.vue'
import '@/assets/fonts.css'
import '@/assets/base.css'

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
