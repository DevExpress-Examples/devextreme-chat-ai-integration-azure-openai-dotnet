<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="app-container">
    <RouterView/>
  </div>
</template>
<style scoped>
.app-container {
  display: flex;
  justify-content: center;
  padding: 50px;
}

:deep(.chat-disabled .dx-chat-messagebox) {
  opacity: 0.5;
  pointer-events: none;
}
</style>
