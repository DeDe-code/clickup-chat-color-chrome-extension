<script setup>
/* global chrome */
import { ref, watch, onMounted } from 'vue'
import { useColorPicker } from '../composables/useColorPicker.js'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'

const emit = defineEmits(['colorsChanged'])

const useClickUpTextColor = ref(false)
const useClickUpBackgroundColor = ref(false)

const { backgroundColor, textColor } = useColorPicker('#fe5722', '#2097f3', (colors) => {
  emit('colorsChanged', {
    backgroundColor: useClickUpBackgroundColor.value
      ? 'var(--cu-background-primary)'
      : colors.backgroundColor,
    textColor: useClickUpTextColor.value ? 'var(--cu-content-primary)' : colors.textColor,
  })
})

// Load saved checkbox states
onMounted(() => {
  chrome.storage.local.get(['useClickUpTextColor', 'useClickUpBackgroundColor'], (result) => {
    useClickUpTextColor.value = !!result.useClickUpTextColor
    useClickUpBackgroundColor.value = !!result.useClickUpBackgroundColor

    emit('colorsChanged', {
      backgroundColor: useClickUpBackgroundColor.value
        ? 'var(--cu-background-primary)'
        : backgroundColor.value,
      textColor: useClickUpTextColor.value ? 'var(--cu-content-primary)' : textColor.value,
    })
  })
})

// Watch for changes and emit updated values
watch([useClickUpTextColor, useClickUpBackgroundColor], () => {
  chrome.storage.local.set({
    useClickUpTextColor: useClickUpTextColor.value,
    useClickUpBackgroundColor: useClickUpBackgroundColor.value,
  })

  emit('colorsChanged', {
    backgroundColor: useClickUpBackgroundColor.value
      ? 'var(--cu-background-primary)'
      : backgroundColor.value,
    textColor: useClickUpTextColor.value ? 'var(--cu-content-primary)' : textColor.value,
  })
})
</script>

<template>
  <div class="color-picker-wrapper flex flex-col gap-4">
    <div class="checkbox-wrapper flex flex-col gap-3 mb-4 w-full">
      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          id="cu-theme"
          v-model="useClickUpTextColor"
          class="accent-blue-500"
        />
        <label for="cu-theme" class="select-none cursor-pointer flex items-center h-full">
          Use ClickUp theme colors
        </label>
      </div>
      <div class="flex items-center gap-2 w-full h-12">
        <input
          type="checkbox"
          id="cu-bg"
          v-model="useClickUpBackgroundColor"
          class="accent-blue-500"
        />
        <label for="cu-bg" class="select-none cursor-pointer flex items-center h-full">
          Use ClickUp background color
        </label>
      </div>
    </div>

    <div class="background-picker-wrapper flex flex-col gap-1">
      <label for="background-picker" class="text-xs font-semibold">Background</label>
      <color-picker
        id="background-picker"
        v-model:pureColor="backgroundColor"
        :disabled="useClickUpBackgroundColor"
        class="w-full"
      />
    </div>

    <div class="text-picker-wrapper flex flex-col gap-1">
      <label for="text-picker" class="text-xs font-semibold">Text</label>
      <color-picker
        id="text-picker"
        v-model:pureColor="textColor"
        :disabled="useClickUpTextColor"
        class="w-full"
      />
    </div>
  </div>
</template>
