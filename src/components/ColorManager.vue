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
    <div class="checkbox-wrapper flex flex-col gap-2 mb-4">
      <label class="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" v-model="useClickUpTextColor" class="accent-blue-500" />
        Use ClickUp theme colors (var(--cu-content-primary))
      </label>
      <label class="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" v-model="useClickUpBackgroundColor" class="accent-blue-500" />
        Use ClickUp background color (var(--cu-background-primary))
      </label>
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
