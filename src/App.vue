<script setup>
import UmcExtentionView from './views/UmcExtentionView.vue'
import { useWatchColorPickerDropdown } from './composables/useColorPickerDropdown'
useWatchColorPickerDropdown()
</script>

<template>
  <main>
    <UmcExtentionView />
  </main>
</template>

<style scoped></style>
