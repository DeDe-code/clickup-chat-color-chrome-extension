<template>
  <div class="theme-selector-wrapper">
    <label for="theme-select">Appearance</label>
    <select id="theme-select" :value="modelValue" @change="handleChange" class="theme-selector">
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
  modelValue: String,
})
const emit = defineEmits(['update:modelValue'])
function handleChange(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<style scoped>
.theme-selector-wrapper {
  display: var(--flex-center);
  align-items: var(--align-center);
  justify-content: var(--justify-between);
  width: var(--full-width);
  margin: 0 auto;
  padding-block: var(--spacing-md-lg);
  padding-inline: var(--spacing-lg);
}
.theme-selector {
  padding: var(--spacing-md) !important;
  background-color: var(--bg-color);
  color: var(--text-color);
  border-color: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
}
.theme-selector:focus {
  outline: 2px solid var(--color-primary, #2097f3);
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--color-primary, #2097f3);
}
.theme-selector:hover {
  opacity: var(--hover-opacity);
}
</style>
