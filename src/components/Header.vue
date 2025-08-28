<template>
  <header class="extension-header">
    <slot>
      <h1 class="extension-title">ClickUp Chat Channel Color Extension</h1>
    </slot>
  </header>
</template>

<script setup></script>

<style scoped>
.extension-header {
  width: 100%;
  padding: var(--spacing-md-lg);
  background: var(--color-primary, #2097f3);
  color: var(--color-white);
  text-align: center;
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-md);
}
.extension-title {
  font-size: var(--font-size-lg, 1.5em);
  font-weight: var(--font-weight-bold, 700);
  margin: 0;
}
</style>
