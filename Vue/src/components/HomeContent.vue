<template>
  <div :class="['demo-container', { 'chat-disabled': isDisabled }]">
    <DxChat
      :data-source="dataSource"
      :reload-on-change="false"
      :show-avatar="false"
      :show-day-headers="false"
      :user="user"
      height="710"
      v-model:typing-users="typingUsers"
      v-model:alerts="alerts"
      @message-entered="onMessageEntered"
      message-template="messageTemplate"
    >
      <template #messageTemplate="{ data }">
        <div v-if="data.message.text === regenerationText">
          <span>{{ regenerationText }}</span>
        </div>
        <div v-else>
          <div
            class="dx-chat-messagebubble-text"
            v-html="convertToHtml(data.message)"
          />
          <div class="dx-bubble-button-container">
            <DxButton
              :icon="copyButtonIcon"
              styling-mode="text"
              hint="Copy"
              @click="onCopyButtonClick(data.message)"
            />
            <DxButton
              icon="refresh"
              styling-mode="text"
              hint="Regenerate"
              @click="onRegenerateButtonClick"
            />
          </div>
        </div>
      </template>
    </DxChat>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { DxChat } from 'devextreme-vue/chat';
import { DxButton } from 'devextreme-vue/button';
import { useChatLogic } from '@/chat.helpers';

const {
  dataSource,
  user,
  typingUsers,
  alerts,
  regenerationText,
  copyButtonIcon,
  loadMessage,
  initDataSource,
  convertToHtml,
  onMessageEntered,
  onCopyButtonClick,
  onRegenerateButtonClick,
  isDisabled
} = useChatLogic();

// Initialize component
onMounted(() => {
  loadMessage();
  initDataSource();
});
</script>
<style scoped>
:deep(.demo-container) {
  display: flex;
  justify-content: center;
}

:deep(.dx-chat) {
  max-width: 900px;
}

:deep(.dx-chat-messagelist-empty-image) {
  display: none;
}

:deep(.dx-chat-messagelist-empty-message) {
  font-size: var(--dx-font-size-heading-5);
}

:deep(.dx-chat-messagebubble-content),
:deep(.dx-chat-messagebubble-text) {
  display: flex;
  flex-direction: column;
}

:deep(.dx-bubble-button-container) {
  display: none;
}

:deep(.dx-button) {
  display: inline-block;
  color: var(--dx-color-icon);
}

:deep(.dx-chat-messagegroup-alignment-start:last-child .dx-chat-messagebubble:last-child .dx-bubble-button-container) {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

:deep(.dx-chat-messagebubble-content > div > div > p:first-child) {
  margin-top: 0;
}

:deep(.dx-chat-messagebubble-content > div > div > p:last-child) {
  margin-bottom: 0;
}

:deep(.dx-chat-messagebubble-content ol),
:deep(.dx-chat-messagebubble-content ul) {
  white-space: normal;
}

:deep(.dx-chat-messagebubble-content h1),
:deep(.dx-chat-messagebubble-content h2),
:deep(.dx-chat-messagebubble-content h3),
:deep(.dx-chat-messagebubble-content h4),
:deep(.dx-chat-messagebubble-content h5),
:deep(.dx-chat-messagebubble-content h6) {
  font-size: revert;
  font-weight: revert;
}

</style>
