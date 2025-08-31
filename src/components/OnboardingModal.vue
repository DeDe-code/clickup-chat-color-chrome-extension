<script setup>
import { defineEmits } from 'vue'
const emit = defineEmits(['close'])
</script>

<template>
  <div
    class="onboarding-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="onboarding-title"
    aria-describedby="onboarding-desc"
  >
    <div class="onboarding-content">
      <h1 id="onboarding-title">Welcome to ClickUp Chat Color!</h1>
      <p id="onboarding-desc">Highlight unread messages and customize your chat experience.</p>
      <strong>Features:</strong>
      <ul>
        <li>Theme selection: System, Light, Dark</li>
        <li>Custom channel colors</li>
        <li>Accessibility & keyboard navigation</li>
        <li>Instant preview & reset</li>
      </ul>
      <button class="onboarding-close-btn" @click="emit('close')" aria-label="Close onboarding">
        Get Started
      </button>
    </div>
  </div>
</template>

<style scoped>
.onboarding-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.onboarding-content {
  background: var(--bg-color);
  color: var(--text-color);
  border-radius: var(--border-radius-sm);
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.18);
  padding: 2rem 2.5rem;
  max-width: 400px;
  text-align: left;
  font-size: 1rem;
}
.onboarding-content h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
.onboarding-content ul {
  margin: 0.5rem 0 1rem 1.2rem;
  padding: 0;
}
.onboarding-close-btn {
  margin-top: 1.2rem;
  padding: 0.5rem 1.2rem;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--border-radius-sm);
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.onboarding-close-btn:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
