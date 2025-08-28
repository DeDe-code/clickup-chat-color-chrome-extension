<script setup>
import { defineProps, defineEmits } from 'vue'
import ColorInput from 'vue-color-input'
import '../assets/vue-color-input.css'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: 'Color',
  },
  id: {
    type: String,
    default: () => `color-picker-${Math.random().toString(36).slice(2, 8)}`,
  },
  customClass: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'popover-open', 'popover-close'])

function handleInput(value) {
  emit('update:modelValue', value)
}
function handlePopoverOpen() {
  emit('popover-open')
}
function handlePopoverClose() {
  emit('popover-close')
}
</script>

<template>
  <div class="color-picker-wrapper">
    <label :for="id">{{ label }}</label>
    <ColorInput
      :id="id"
      :modelValue="modelValue"
      @update:modelValue="handleInput"
      popover-to="right"
      format="hex"
      :custom-class="customClass"
      @popover-open="handlePopoverOpen"
      @popover-close="handlePopoverClose"
    />
  </div>
</template>

<style scoped>
.color-picker-wrapper {
  display: var(--flex-center);
  flex-direction: var(--flex-column);
  row-gap: var(--gap-sm);
  padding: var(--spacing-lg-sm);
  border: var(--border-default);
  border-radius: var(--border-radius-sm);
}
label {
  font-size: var(--font-size-sm);
  margin-bottom: 0.5em;
}
.color-picker-text:focus,
.color-picker-background:focus {
  outline: 2px solid var(--color-primary, #2097f3);
  outline-offset: 2px;
}
</style>
