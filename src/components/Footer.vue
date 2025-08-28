<template>
  <footer class="extension-footer">
    <slot>
      <span class="footer-text">&copy; 2025 ClickUp Chat Channel Color Extension</span>
    </slot>
  </footer>
</template>

<script setup></script>

<style scoped>
.extension-footer {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--color-dark-gray, #23272f);
  color: var(--color-white);
  text-align: center;
  border-radius: var(--border-radius-sm);
  margin-top: var(--spacing-md);
}
.footer-text {
  font-size: var(--font-size-sm, 1em);
  font-weight: var(--font-weight-normal, 400);
}
</style>
