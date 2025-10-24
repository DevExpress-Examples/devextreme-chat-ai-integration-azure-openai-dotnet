const CHAT_DISABLED_CLASS = 'chat-disabled';
const ALERT_TIMEOUT = 1000 * 60;
const REGENERATION_TEXT = 'Regeneration...';
const CHAT_SERVER_URL = 'http://localhost:5005/api/Chat';

const assistant = {
  id: 'assistant',
  name: 'Virtual Assistant',
};

const user = {
  id: 'user',
};

export {
  CHAT_SERVER_URL,
  REGENERATION_TEXT,
  CHAT_DISABLED_CLASS,
  ALERT_TIMEOUT,
  user,
  assistant,
};
