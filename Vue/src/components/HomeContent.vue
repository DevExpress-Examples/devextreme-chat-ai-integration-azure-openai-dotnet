<script setup lang="ts">

import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import Chat from '@/components/ChatInterface.vue';

</script>
<template>
  <div class="chat-wrapper">
    <Chat/>
  </div>
</template>
<style scoped>

.chat-wrapper {
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

</style>
