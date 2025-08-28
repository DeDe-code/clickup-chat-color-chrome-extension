<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  label: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="custom-checkbox-wrapper">
    <input
      type="checkbox"
      :id="id"
      :checked="modelValue"
      @change="emit('update:modelValue', $event.target.checked)"
      class="custom-checkbox-input"
    />
    <label :for="id" class="custom-checkbox-label">
      <span
        class="custom-checkbox-box"
        :style="modelValue && color ? { backgroundColor: color } : {}"
      >
        <svg
          v-if="modelValue"
          class="custom-checkbox-checkmark"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 10.5L9 14.5L15 7.5"
            stroke="white"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <span class="custom-checkbox-text">{{ label }}</span>
    </label>
  </div>
</template>

<style scoped>
.custom-checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5em;
}
.custom-checkbox-input {
  position: absolute;
  opacity: 0;
  width: 24px;
  height: 24px;
  cursor: pointer;
  z-index: 2;
}
.custom-checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.5em;
  user-select: none;
}
.custom-checkbox-box {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid var(--color-border-dark, #222);
  background: #23272f;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s,
    border 0.2s;
  box-sizing: border-box;
}
.custom-checkbox-input:focus + .custom-checkbox-label .custom-checkbox-box {
  outline: 2px solid var(--color-primary, #2097f3);
  outline-offset: 2px;
}
.custom-checkbox-checkmark {
  display: block;
}
.custom-checkbox-text {
  color: inherit;
  font-size: var(--font-size-sm, 1em);
}
</style>
