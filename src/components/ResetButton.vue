<template>
  <button class="reset-default-btn" @click="$emit('click')">
    <slot>Reset Default Colors</slot>
  </button>
</template>

<script setup></script>

<style scoped>
.reset-default-btn {
  padding: 0.5rem 1rem;
  background-color: #e53935;
  color: #fff;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.3s;
}
.reset-default-btn:hover {
  background-color: #b71c1c;
}
.reset-default-btn:focus {
  outline: 2px solid #2097f3;
  outline-offset: 2px;
}
</style>
