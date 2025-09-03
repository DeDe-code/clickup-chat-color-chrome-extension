<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info', // 'success', 'warning', 'error', 'info'
    validator: (value) => ['success', 'warning', 'error', 'info'].includes(value)
  },
  message: {
    type: String,
    required: true
  },
  dismissible: {
    type: Boolean,
    default: true
  },
  timeout: {
    type: Number,
    default: 5000 // Auto-dismiss after 5 seconds
  }
})

const emit = defineEmits(['close'])

const visible = ref(true)

// Auto-dismiss functionality
if (props.timeout > 0) {
  setTimeout(() => {
    if (visible.value) {
      handleClose()
    }
  }, props.timeout)
}

function handleClose() {
  visible.value = false
  emit('close')
}

const notificationClass = computed(() => {
  return `notification notification--${props.type}`
})

const iconClass = computed(() => {
  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️'
  }
  return icons[props.type] || icons.info
})
</script>

<template>
  <Transition name="notification">
    <div v-if="visible" :class="notificationClass" role="alert" :aria-live="type === 'error' ? 'assertive' : 'polite'">
      <div class="notification__content">
        <span class="notification__icon" aria-hidden="true">{{ iconClass }}</span>
        <span class="notification__message">{{ message }}</span>
      </div>
      <button 
        v-if="dismissible" 
        @click="handleClose" 
        class="notification__close"
        aria-label="Close notification"
        type="button"
      >
        ×
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: var(--border-radius-sm, 6px);
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
  max-width: 400px;
}

.notification__content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.notification__icon {
  font-size: 16px;
  flex-shrink: 0;
}

.notification__message {
  flex: 1;
}

.notification__close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: 12px;
  opacity: 0.7;
  transition: opacity 0.2s;
  line-height: 1;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification__close:hover {
  opacity: 1;
}

.notification__close:focus {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  opacity: 1;
}

/* Notification types */
.notification--success {
  background-color: #f0f9f4;
  color: #166534;
  border-left: 4px solid #16a34a;
}

.notification--warning {
  background-color: #fefce8;
  color: #854d0e;
  border-left: 4px solid #eab308;
}

.notification--error {
  background-color: #fef2f2;
  color: #991b1b;
  border-left: 4px solid #ef4444;
}

.notification--info {
  background-color: #f0f9ff;
  color: #1e40af;
  border-left: 4px solid #3b82f6;
}

/* Dark theme support */
[data-theme="dark"] .notification--success {
  background-color: #064e3b;
  color: #6ee7b7;
}

[data-theme="dark"] .notification--warning {
  background-color: #451a03;
  color: #fcd34d;
}

[data-theme="dark"] .notification--error {
  background-color: #7f1d1d;
  color: #fca5a5;
}

[data-theme="dark"] .notification--info {
  background-color: #1e3a8a;
  color: #93c5fd;
}

/* Transition animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>